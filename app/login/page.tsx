'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/app/actions/login';

const initialState: LoginState = { type: 'idle' };

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display italic text-2xl text-ivory">Gloriah Mutheu Mwangangi</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-ivory/30 mt-2">
            Dashboard
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full bg-ivory/5 border border-ivory/10 text-ivory placeholder:text-ivory/20 px-4 py-3 text-sm font-sans focus:outline-none focus:border-ivory/40 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full bg-ivory/5 border border-ivory/10 text-ivory placeholder:text-ivory/20 px-4 py-3 text-sm font-sans focus:outline-none focus:border-ivory/40 transition-colors"
            />
          </div>

          {state.type === 'error' && (
            <p className="text-xs font-sans text-mauve" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ivory text-obsidian font-sans text-xs uppercase tracking-widest py-3 hover:bg-mauve hover:text-ivory transition-colors disabled:opacity-50 mt-2"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
