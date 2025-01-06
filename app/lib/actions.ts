'use server';
import { z } from 'zod';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// initiate supabase client
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseUrl = 'https://iptsgvvlxhiwkvrvzghf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHNndnZseGhpd2t2cnZ6Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTYzODAsImV4cCI6MjA0OTI5MjM4MH0.JzSmQBQl3SJwzEweGKBKlR7dokh4WsSwbiQyx1Moxi0';
const supabase = createClient(supabaseUrl, supabaseKey);

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer'
    }),
    amount: z.coerce
            .number()
            .gt(0, { message: 'Please enter amount greater than $0' }),
    status: z.enum(['pending','paid'], {
        invalid_type_error: 'Please select an invoice status'
    }),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch(error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials'
                default:
                    return 'Something went wrong'
            }
        }
        throw error;
    }
}

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // const rawFormData = Object.fromEntries(formData.entries())
    // console.log(rawFormData);

    // if validation fails, return error early. Otherwise, continue
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to create invoice'
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T'[0]);
    
    const { data, error } = await supabase
        .from('invoices')
        .insert([{
            customer_id: customerId,
            amount: amountInCents,
            status: status,
            date: date,
        }])
        .select();

    if (error) {
        console.error('Error inserting invoice:', error);
    }
    console.log('Invoice inserted:', data);
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // const rawFormData = Object.fromEntries(formData.entries())
    // console.log(rawFormData);

    // if validation fails, return error early. Otherwise, continue
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to update invoice'
        }
    }
    
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    
    const { data, error } = await supabase
        .from('invoices')
        .update([{
            customer_id: customerId,
            amount: amountInCents,
            status: status,
        }])
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating invoice:', error);
    }
    console.log('Invoice updated:', data);
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    const { data, error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting invoice:', error);
    }
    console.log('Invoice deleted:', data);
    
    revalidatePath('/dashboard/invoices');
}