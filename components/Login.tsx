'use client';

import { signIn } from '@/lib/actions/auth.actions';
import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { authClient } from '@/lib/auth-client';

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(signIn, {errors: null, success: false, data: null});
    const router = useRouter();
    const { refetch } = authClient.useSession();

    useEffect(()=>{
        if(state.success){
            posthog.capture('user_logged_in', {
                data: state.data,
            });
            refetch();
            router.back();
        }
    },[state.success, router, state.data, refetch]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
                
                <form className="flex flex-col gap-4" action={formAction}>
                    
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
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                            className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {state.errors?.password && (
                            <p className="text-sm text-red-500">{state.errors.password}</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-full cursor-pointer items-center justify-center rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black mt-2"
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