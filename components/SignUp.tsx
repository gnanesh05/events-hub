'use client';

import { signUp } from '@/lib/actions/auth.actions';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function SignUpForm() {
    const [state, formAction, isPending] = useActionState(signUp, {errors: null, success: false, data: null});
    const router = useRouter();
    const { refetch } = authClient.useSession();

    useEffect(() => {
        if(state.success){
            toast.success('Account created successfully');
            posthog.capture('user_signed_up', {
                data: state.data,
            });
            refetch();
            router.push('/');
        }
        if(state.message && !state.success){
            toast.error(state.message);
        }
    }, [state.success, router, state.data, refetch, state.message]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
                <h1 className="text-gradient text-3xl font-bold mb-6 text-center">Create an account</h1>
                
                <form className="flex flex-col gap-4" action={formAction}>
                    {state.message && !state.success && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                            <p className="text-sm text-red-500">{state.message}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-sm font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            defaultValue={state.data?.username || ''}
                            placeholder="Enter your username"
                            className="form-input"
                        />
                        {state.errors?.username && (
                            <p className="text-sm text-red-500">{state.errors.username}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            defaultValue={state.data?.email || ''}
                            placeholder="Enter your email"
                            className="form-input"
                        />
                        {state.errors?.email && (
                            <p className="text-sm text-red-500">{state.errors.email}</p>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            defaultValue={state.data?.password || ''}
                            placeholder="Enter your password"
                            className="form-input"
                        />
                        {state.errors?.password && (
                            <p className="text-sm text-red-500">{state.errors.password}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role" className="text-sm font-medium">
                            Role
                        </label>
                        <select id="role" name="role" required defaultValue={state.data?.role || ''} className="form-input">
                            <option value="organizer">Organizer</option>
                            <option value="participant">Participant</option>
                        </select>
                        {state.errors?.role && (
                            <p className="text-sm text-red-500">{state.errors.role}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary w-full mt-2"
                    >
                        {isPending ? 'Loading...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="text-center mt-4 text-sm text-light-200">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}