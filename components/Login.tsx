'use client';

import { signIn } from '@/lib/actions/auth.actions';
import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(signIn, {errors: null, success: false, data: null});
    const router = useRouter();
    const { refetch } = authClient.useSession();

    useEffect(()=>{
        if(state.success){
            toast.success('Logged in successfully');
            posthog.capture('user_logged_in', {
                data: state.data,
            });
            refetch();
            router.back();
        }
        if(state.message && !state.success){
            toast.error(state.message);
        }
    },[state.success, router, state.data, refetch, state.message]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
                <h1 className="text-gradient text-3xl font-bold mb-6 text-center">Login</h1>
                
                <form className="flex flex-col gap-4" action={formAction}>
                    {state.message && !state.success && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                            <p className="text-sm text-red-500">{state.message}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </label>
                        <input
                            defaultValue={state.data?.email || ''}
                            type="email"
                            id="email"
                            name="email"
                            required
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
                            placeholder="Enter your password"
                            className="form-input"
                        />
                        {state.errors?.password && (
                            <p className="text-sm text-red-500">{state.errors.password}</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary w-full mt-2"
                    >
                        {isPending ? 'Loading...' : 'Login'}
                    </button>
                </form>
                
                <p className="text-center mt-4 text-sm text-light-200">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-primary hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}