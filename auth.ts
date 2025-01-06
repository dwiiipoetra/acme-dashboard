import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from 'zod';
import { createClient } from "@supabase/supabase-js";
import type { User } from "./app/lib/definitions";
import bcrypt from 'bcrypt';

const supabaseUrl = 'https://iptsgvvlxhiwkvrvzghf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdHNndnZseGhpd2t2cnZ6Z2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTYzODAsImV4cCI6MjA0OTI5MjM4MH0.JzSmQBQl3SJwzEweGKBKlR7dokh4WsSwbiQyx1Moxi0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getUser(email: string): Promise<User | undefined> {
    try {
        const { data, error} = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
    
        if(error) {
            console.log('Failed to fetch users');
        }
        console.log('Success fetch users ', data);
        return data;
    } catch(error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                const parsedCredentials = z
                .object({ email: z.string().email(), password: z.string().min(6) })
                .safeParse(credentials);

                if(parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    // console.log('Credentials parsed successfully:', { email, password });
                    const user = await getUser(email);
                    // console.log({user});
                    if (user) return user
                    return null;
                    // const passwordsMatch = await bcrypt.compare(password, user.password);
                    // if (passwordsMatch) return user;
                }
                console.log('Invalid credentials');
                // return null;
                } catch (error) {
                    console.log('error during auth: ', error);
                }
            }
        })
    ]
});