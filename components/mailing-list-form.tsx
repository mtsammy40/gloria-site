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
      <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-5">Stay close</p>
      <h2 className="font-display font-semibold text-3xl lg:text-4xl text-ivory mb-4">{heading}</h2>
      {subheading && (
        <p className="font-sans text-sm text-ivory/50 mb-10 leading-relaxed">{subheading}</p>
      )}

      {isDone ? (
        <p className="font-sans text-sm text-sage leading-relaxed">{state.message}</p>
      ) : (
        <form action={action} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-xs">
            <label htmlFor="mailing-email" className="sr-only">
              Email address
            </label>
            <input
              id="mailing-email"
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="w-full bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/30 px-4 py-3 text-sm font-sans focus:outline-none focus:border-mauve/60 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-ivory text-obsidian px-6 py-3 text-xs uppercase tracking-widest font-sans hover:bg-mauve hover:text-ivory transition-colors disabled:opacity-50"
          >
            {pending ? 'Joining…' : 'Join'}
          </button>
        </form>
      )}

      {state.type === 'error' && (
        <p className="mt-3 text-xs font-sans text-mauve" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}
