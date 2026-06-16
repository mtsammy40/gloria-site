'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ArtworkFormState } from '@/app/actions/portfolio';

type Props = {
  action: (prev: ArtworkFormState, formData: FormData) => Promise<ArtworkFormState>;
  defaultValues?: {
    title?: string;
    medium?: string;
    dimensions?: string | null;
    year?: number | null;
    description?: string | null;
    featured?: boolean;
    slug?: string;
    imageUrl?: string | null;
  };
  heading: string;
  featuredCapReached?: boolean;
};

const initial: ArtworkFormState = { type: 'idle' };

export function ArtworkForm({ action, defaultValues, heading, featuredCapReached = false }: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);
  const [preview, setPreview] = useState<string | null>(defaultValues?.imageUrl ?? null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/portfolio"
          className="font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors"
        >
          ← Portfolio
        </Link>
        <h1 className="font-display italic text-3xl text-obsidian">{heading}</h1>
      </div>

      {state.type === 'error' && (
        <div className="mb-6 px-4 py-3 bg-mauve/10 border border-mauve/20 rounded font-sans text-sm text-mauve">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="bg-white border border-obsidian/10 rounded p-6 space-y-5">
          <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40">
            Artwork details
          </h2>

          <Field label="Title *">
            <input
              type="text"
              name="title"
              required
              defaultValue={defaultValues?.title}
              placeholder="e.g. Nairobi at Dusk"
              className={inputClass}
            />
          </Field>

          <Field label="Medium *">
            <input
              type="text"
              name="medium"
              required
              defaultValue={defaultValues?.medium}
              placeholder="e.g. Oil on canvas"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Dimensions">
              <input
                type="text"
                name="dimensions"
                defaultValue={defaultValues?.dimensions ?? ''}
                placeholder="e.g. 60 × 80 cm"
                className={inputClass}
              />
            </Field>
            <Field label="Year">
              <input
                type="number"
                name="year"
                defaultValue={defaultValues?.year ?? ''}
                placeholder={String(new Date().getFullYear())}
                min={1900}
                max={new Date().getFullYear() + 1}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              rows={4}
              defaultValue={defaultValues?.description ?? ''}
              placeholder="Optional — appears on the artwork detail page."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Slug (URL)">
            <input
              type="text"
              name="slug"
              defaultValue={defaultValues?.slug ?? ''}
              placeholder="auto-generated from title if blank"
              className={inputClass}
            />
            <p className="mt-1 font-sans text-xs text-obsidian/40">
              Used in the URL: /portfolio/<em>slug</em>
            </p>
          </Field>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              defaultChecked={defaultValues?.featured}
              disabled={featuredCapReached}
              className="w-4 h-4 mt-0.5 accent-sage disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <div>
              <label
                htmlFor="featured"
                className={`font-sans text-sm ${featuredCapReached ? 'text-obsidian/40 cursor-not-allowed' : 'text-obsidian cursor-pointer'}`}
              >
                Feature on home page
              </label>
              {featuredCapReached ? (
                <p className="font-sans text-xs text-obsidian/40 mt-0.5">
                  3 artworks are already featured. Unfeature one to enable this.
                </p>
              ) : (
                <p className="font-sans text-xs text-obsidian/40 mt-0.5">Shown on the home page — max 3.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-obsidian/10 rounded p-6 space-y-4">
          <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40">Image</h2>

          {preview && (
            <div className="relative w-full aspect-video bg-obsidian/5 rounded overflow-hidden">
              <Image src={preview} alt="Preview" fill className="object-contain" sizes="672px" />
            </div>
          )}

          <label className="block">
            <span className="font-sans text-xs text-obsidian/60">
              {preview ? 'Replace image' : 'Upload image'}{' '}
              <span className="text-obsidian/30">— JPEG, PNG, WebP, GIF · max 10 MB</span>
            </span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="mt-2 block w-full font-sans text-sm text-obsidian/60 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-obsidian file:text-ivory file:text-xs file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-mauve file:transition-colors"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-4 pb-4">
          <Link
            href="/dashboard/portfolio"
            className="font-sans text-sm text-obsidian/50 hover:text-obsidian transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-8 py-3 hover:bg-mauve transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save artwork'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'w-full border border-obsidian/20 bg-ivory/50 px-3 py-2 font-sans text-sm text-obsidian placeholder:text-obsidian/30 focus:outline-none focus:border-obsidian transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs text-obsidian/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
