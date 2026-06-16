'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { ProductFormState } from '@/app/actions/products';
import type { ArtworkRow } from '@/lib/content/artworks';

type Props = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  artworks: ArtworkRow[];
  defaultValues?: {
    artworkId?: string;
    type?: 'original' | 'print';
    priceKes?: number;
    stockRemaining?: number;
    editionSize?: number | null;
    description?: string | null;
    manuallyMarkedSold?: boolean;
  };
  heading: string;
  isEdit?: boolean;
};

const initial: ProductFormState = { type: 'idle' };

const input =
  'w-full border border-obsidian/20 bg-ivory/50 px-3 py-2 font-sans text-sm text-obsidian placeholder:text-obsidian/30 focus:outline-none focus:border-obsidian transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs text-obsidian/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function ProductForm({ action, artworks, defaultValues, heading, isEdit }: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/shop"
          className="font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors"
        >
          ← Shop
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
          {!isEdit && (
            <>
              <Field label="Artwork *">
                <select name="artworkId" required defaultValue={defaultValues?.artworkId ?? ''} className={input}>
                  <option value="" disabled>Select an artwork…</option>
                  {artworks.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type *">
                <select name="type" required defaultValue={defaultValues?.type ?? ''} className={input}>
                  <option value="" disabled>Select type…</option>
                  <option value="original">Original</option>
                  <option value="print">Print</option>
                </select>
              </Field>
            </>
          )}

          <Field label="Price (KES) *">
            <input
              type="number"
              name="priceKes"
              required
              min={0}
              defaultValue={defaultValues?.priceKes ?? ''}
              placeholder="e.g. 85000"
              className={input}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock remaining *">
              <input
                type="number"
                name="stockRemaining"
                required
                min={0}
                defaultValue={defaultValues?.stockRemaining ?? 1}
                className={input}
              />
            </Field>
            <Field label="Edition size (prints only)">
              <input
                type="number"
                name="editionSize"
                min={1}
                defaultValue={defaultValues?.editionSize ?? ''}
                placeholder="e.g. 50"
                className={input}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              defaultValue={defaultValues?.description ?? ''}
              placeholder="Optional product description…"
              className={`${input} resize-none`}
            />
          </Field>

          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="manuallyMarkedSold"
                name="manuallyMarkedSold"
                defaultChecked={defaultValues?.manuallyMarkedSold}
                className="w-4 h-4 accent-mauve"
              />
              <label htmlFor="manuallyMarkedSold" className="font-sans text-sm text-obsidian cursor-pointer">
                Mark as sold{' '}
                <span className="text-obsidian/40">(hides from shop even if stock &gt; 0)</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 pb-4">
          <Link
            href="/dashboard/shop"
            className="font-sans text-sm text-obsidian/50 hover:text-obsidian transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-8 py-3 hover:bg-mauve transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </form>
    </div>
  );
}
