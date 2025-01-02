'use server';
import { z } from 'zod';
// initiate supabase client
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabaseUrl = 'https://iptsgvvlxhiwkvrvzghf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHNndnZseGhpd2t2cnZ6Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTYzODAsImV4cCI6MjA0OTI5MjM4MH0.JzSmQBQl3SJwzEweGKBKlR7dokh4WsSwbiQyx1Moxi0';
const supabase = createClient(supabaseUrl, supabaseKey);

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending','paid']),
    date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // const rawFormData = Object.fromEntries(formData.entries())
    // console.log(rawFormData);
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
        return "null";
    }
    console.log('Invoice inserted:', data);
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // const rawFormData = Object.fromEntries(formData.entries())
    // console.log(rawFormData);
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
        return "null";
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
        return "null";
    }
    console.log('Invoice updated:', data);
    
    revalidatePath('/dashboard/invoices');
}