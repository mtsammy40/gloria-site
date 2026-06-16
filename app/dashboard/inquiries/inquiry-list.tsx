'use client';

import { useState, useTransition } from 'react';
import { markInquiryReadAction } from '@/app/actions/inquiries';
import type { InquiryRow } from '@/lib/content/inquiries';

const SUBJECT_LABELS: Record<string, string> = {
  originals: 'Originals',
  prints: 'Prints',
  interior: 'Interior art',
  commission: 'Commission',
  general: 'General',
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function InquiryList({ initialInquiries }: { initialInquiries: InquiryRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string, currentRead: boolean) {
    startTransition(() => markInquiryReadAction(id, !currentRead));
  }

  return (
    <div className="space-y-2">
      {initialInquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className={`bg-white border rounded overflow-hidden transition-colors ${
            inquiry.read ? 'border-obsidian/10' : 'border-obsidian/30'
          }`}
        >
          <button
            type="button"
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
            onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              {!inquiry.read && (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-mauve" />
              )}
              <div className="min-w-0">
                <div className="font-sans text-sm text-obsidian truncate">{inquiry.name}</div>
                <div className="font-sans text-xs text-obsidian/40 truncate">{inquiry.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-sans text-xs text-obsidian/40 hidden sm:inline">
                {SUBJECT_LABELS[inquiry.subject] ?? inquiry.subject}
              </span>
              <span className="font-sans text-xs text-obsidian/30 tabular-nums">
                {formatDate(inquiry.createdAt)}
              </span>
              <span className="font-sans text-xs text-obsidian/30">
                {expanded === inquiry.id ? '↑' : '↓'}
              </span>
            </div>
          </button>

          {expanded === inquiry.id && (
            <div className="px-5 pb-5 border-t border-obsidian/8">
              <p className="font-sans text-sm text-obsidian/70 whitespace-pre-wrap mt-4 mb-5">
                {inquiry.message}
              </p>
              <div className="flex items-center justify-between">
                <a
                  href={`mailto:${inquiry.email}?subject=Re: ${SUBJECT_LABELS[inquiry.subject] ?? ''}`}
                  className="font-sans text-xs uppercase tracking-widest text-obsidian border border-obsidian/20 px-4 py-2 hover:border-obsidian transition-colors"
                >
                  Reply by email
                </a>
                <button
                  type="button"
                  onClick={() => toggle(inquiry.id, inquiry.read)}
                  disabled={pending}
                  className="font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors disabled:opacity-40"
                >
                  {inquiry.read ? 'Mark unread' : 'Mark read'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
