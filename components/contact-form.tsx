'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { submitContactForm, type ContactState } from '@/app/actions/contact';

const initialState: ContactState = { type: 'idle' };

const SUBJECT_OPTIONS = [
  { value: 'originals', label: 'Original works' },
  { value: 'prints', label: 'Limited prints' },
  { value: 'interior', label: 'Interior art' },
  { value: 'commission', label: 'Commission enquiry' },
  { value: 'general', label: 'General' },
];

const inputClass =
  'w-full bg-transparent border border-obsidian/20 px-4 py-3 text-sm font-sans text-obsidian placeholder:text-obsidian/30 focus:outline-none focus:border-obsidian/60 transition-colors';

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactForm, initialState);

  if (state.type === 'success') {
    return (
      <div className="py-12 text-center">
        <div className="w-10 h-10 border border-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-5 h-5 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-display italic text-2xl text-obsidian mb-3">Message received</h3>
        <p className="font-sans text-sm text-obsidian/60 mb-8 leading-relaxed max-w-xs mx-auto">
          Thank you for reaching out. Gloriah will be in touch soon.
        </p>
        <Link
          href="/portfolio"
          className="font-sans text-xs uppercase tracking-widest text-obsidian/50 hover:text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-px transition-colors"
        >
          Explore the Portfolio →
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="sr-only">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your name *"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com *"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="sr-only">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue=""
          className={`${inputClass} cursor-pointer appearance-none`}
        >
          <option value="" disabled>
            Subject — what&apos;s this about?
          </option>
          {SUBJECT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Your message *"
          required
          className={`${inputClass} resize-none`}
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
        className="w-full sm:w-auto bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-10 py-4 hover:bg-mauve transition-colors disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
