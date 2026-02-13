"use server";
import { headers } from "next/headers";
import { auth } from "../auth";
import { z } from "zod";

//Schema
const signUpSchema = z.object({
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"}),
    username: z.string().min(3, {message: "Username must be at least 3 characters long"}),
    role: z.enum(["admin", "participant"], {message: "Invalid role"}),
});

const signInSchema = z.object({
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(8, {message: "Password must be at least 8 characters long"}),
});

// Type definitions
type SignUpCredentials = {
    email: string;
    password: string;
    username: string;
    role: string;
};

type SignInCredentials = {
    email: string;
    password: string;
};

type SignUpState = {
    errors: Record<string, string[]> | null;
    data: SignUpCredentials | null;
    success: boolean;
    message?: string;
};

type SignInState = {
    errors: Record<string, string[]> | null;
    data: SignInCredentials | null;
    success: boolean;
    message?: string;
};

export const signUp = async(prevState: SignUpState, formData: FormData): Promise<SignUpState> => {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        username: formData.get('username') as string,
        role: formData.get('role') as string,
    };
    const result = signUpSchema.safeParse(data);
    if(!result.success){
        return { errors: result.error.flatten().fieldErrors,
             success: false,
             data:{
                email: data.email,
                password: data.password,
                username: data.username,
                role: data.role,
             }
            };
    }
    const { email, password, username, role } = result.data;
    try{
    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name: username,
            role: role,
        },
        headers: await headers(),
    });
    return { errors: null, success: true, message: 'User created successfully', data: {
        email: email,
        password: password,
        username: username,
        role: role,
    } };
    }
    catch(error){
        return { errors: null, success: false, message: error instanceof Error ? error.message : 'An unknown error occurred', data: {
            email: email,
            password: password,
            username: username,
            role: role,
        } };
    }
}

export const signIn = async(prevState: SignInState, formData: FormData): Promise<SignInState> => {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };
    const result = signInSchema.safeParse(data);
    if(!result.success){
        return { errors: result.error.flatten().fieldErrors,
            success: false, data: {
                email: data.email,
                password: '',
            } };
    }
    const { email, password } = result.data;
    try{
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });
        return { errors: null, success: true, message: 'User logged in successfully', data: null };
    }
    catch(error){
        return { errors: null, success: false, message: error instanceof Error ? error.message : 'An unknown error occurred', data: {
            email: email,
            password: password,
        } };
    }
}