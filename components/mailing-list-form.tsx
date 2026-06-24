'use client';

import { useActionState } from 'react';
import { subscribeToMailingList, type MailingListState } from '@/app/actions/mailing-list';

const initialState: MailingListState = { type: 'idle' };

type Props = {
  heading: string;
  subheading: string;
};

export function MailingListForm({ heading, subheading }: Props) {
  const [state, action, pending] = useActionState(subscribeToMailingList, initialState);

  const isDone = state.type === 'success' || state.type === 'already_subscribed';

  return (
    <div className="max-w-2xl">
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ivory/40 mb-6">
        Stay Close
      </p>
      <h2
        className="font-display font-semibold text-ivory mb-10 leading-tight"
        style={{ fontSize: 'clamp(36px, 5vw, 68px)' }}
      >
        {heading}
      </h2>

      {isDone ? (
        <p className="font-sans text-sm text-ivory/70 leading-relaxed">{state.message}</p>
      ) : (
        <form action={action} className="flex flex-col sm:flex-row gap-0">
          <div className="flex-1 max-w-sm">
            <label htmlFor="mailing-email" className="sr-only">
              Email address
            </label>
            <input
              id="mailing-email"
              type="email"
              name="email"
              placeholder="Your email"
              required
              className="w-full bg-transparent border border-ivory/25 text-ivory placeholder:text-ivory/35 px-5 py-4 text-sm font-sans focus:outline-none focus:border-ivory/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-ivory text-obsidian px-8 py-4 text-[10px] uppercase tracking-[0.18em] font-sans hover:bg-sage hover:text-ivory transition-colors disabled:opacity-50 shrink-0"
          >
            {pending ? 'Joining…' : 'Join'}
          </button>
        </form>
      )}

      {subheading && !isDone && (
        <p className="mt-4 font-sans text-xs text-ivory/35 leading-relaxed">{subheading}</p>
      )}

      {state.type === 'error' && (
        <p className="mt-3 text-xs font-sans text-ivory/60" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
