'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { useState } from 'react';
import type { SiteSettingsRow } from '@/lib/content/settings';
import type { SettingsState } from '@/app/actions/settings';

type Props = {
  settings: SiteSettingsRow;
  action: (prev: SettingsState, formData: FormData) => Promise<SettingsState>;
};

const initial: SettingsState = { type: 'idle' };

export function ContentForm({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, initial);
  const [posterPreview, setPosterPreview] = useState<string | null>(settings.heroPosterUrl);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(settings.aboutPortraitUrl);
  const [studioPreview, setStudioPreview] = useState<string | null>(settings.aboutStudioUrl);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display italic text-3xl text-obsidian">Site content</h1>
        <p className="font-sans text-xs text-obsidian/40 mt-1">
          Edits go live immediately on save.
        </p>
      </div>

      {state.type === 'error' && (
        <div className="mb-6 px-4 py-3 bg-mauve/10 border border-mauve/20 rounded font-sans text-sm text-mauve">
          {state.message}
        </div>
      )}
      {state.type === 'success' && (
        <div className="mb-6 px-4 py-3 bg-sage/10 border border-sage/20 rounded font-sans text-sm text-sage">
          Settings saved.
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* ─── Hero ─── */}
        <Section heading="Hero">
          <Field label="Tagline">
            <textarea
              name="homeTagline"
              rows={2}
              defaultValue={settings.homeTagline}
              className={`${input} resize-none`}
            />
          </Field>
          <Field label="Artist statement (home page)">
            <textarea
              name="homeArtistStatement"
              rows={4}
              defaultValue={settings.homeArtistStatement}
              className={`${input} resize-none`}
            />
          </Field>
          <Field label="Hero video URL">
            <input
              type="url"
              name="heroVideoUrl"
              defaultValue={settings.heroVideoUrl ?? ''}
              placeholder="https://…"
              className={input}
            />
          </Field>
          <Field label="Hero poster image">
            {posterPreview && (
              <div className="relative w-full h-40 bg-obsidian/5 rounded overflow-hidden mb-2">
                <Image src={posterPreview} alt="Poster" fill className="object-cover" sizes="672px" />
              </div>
            )}
            <input
              type="file"
              name="heroPosterImage"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPosterPreview(URL.createObjectURL(f));
              }}
              className={fileInput}
            />
          </Field>
        </Section>

        {/* ─── About ─── */}
        <Section heading="About page">
          <Field label="Bio">
            <textarea
              name="aboutBio"
              rows={6}
              defaultValue={settings.aboutBio}
              className={`${input} resize-none`}
            />
          </Field>
          <Field label="Statement quote">
            <textarea
              name="aboutStatementQuote"
              rows={3}
              defaultValue={settings.aboutStatementQuote}
              className={`${input} resize-none`}
            />
          </Field>
          <Field label="Portrait photo">
            {portraitPreview && (
              <div className="relative w-40 h-48 bg-obsidian/5 rounded overflow-hidden mb-2">
                <Image src={portraitPreview} alt="Portrait" fill className="object-cover" sizes="160px" />
              </div>
            )}
            <input
              type="file"
              name="aboutPortraitImage"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPortraitPreview(URL.createObjectURL(f));
              }}
              className={fileInput}
            />
          </Field>
          <Field label="Studio photo">
            {studioPreview && (
              <div className="relative w-full h-40 bg-obsidian/5 rounded overflow-hidden mb-2">
                <Image src={studioPreview} alt="Studio" fill className="object-cover" sizes="672px" />
              </div>
            )}
            <input
              type="file"
              name="aboutStudioImage"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setStudioPreview(URL.createObjectURL(f));
              }}
              className={fileInput}
            />
          </Field>
        </Section>

        {/* ─── Contact & social ─── */}
        <Section heading="Contact & social">
          <Field label="Contact email">
            <input
              type="email"
              name="contactEmail"
              defaultValue={settings.contactEmail}
              className={input}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram handle">
              <input
                type="text"
                name="instagramHandle"
                defaultValue={settings.instagramHandle}
                placeholder="@gloriahmutheu"
                className={input}
              />
            </Field>
            <Field label="Pinterest handle">
              <input
                type="text"
                name="pinterestHandle"
                defaultValue={settings.pinterestHandle}
                placeholder="gloriahmutheu"
                className={input}
              />
            </Field>
          </div>
        </Section>

        {/* ─── Mailing list banner ─── */}
        <Section heading="Mailing list banner">
          <Field label="Heading">
            <input
              type="text"
              name="mailingBannerHeading"
              defaultValue={settings.mailingBannerHeading}
              className={input}
            />
          </Field>
          <Field label="Subheading">
            <input
              type="text"
              name="mailingBannerSubheading"
              defaultValue={settings.mailingBannerSubheading}
              className={input}
            />
          </Field>
        </Section>

        {/* ─── Shipping & pricing ─── */}
        <Section heading="Shipping & pricing">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Shipping — Kenya (KES)">
              <input
                type="number"
                name="shippingFeeKenyaKes"
                defaultValue={settings.shippingFeeKenyaKes}
                min={0}
                className={input}
              />
            </Field>
            <Field label="Shipping — International (KES)">
              <input
                type="number"
                name="shippingFeeInternationalKes"
                defaultValue={settings.shippingFeeInternationalKes}
                min={0}
                className={input}
              />
            </Field>
          </div>
          <Field label="USD exchange rate (1 USD = ? KES)">
            <input
              type="number"
              name="usdExchangeRate"
              defaultValue={Number(settings.usdExchangeRate)}
              step="0.01"
              min={1}
              className={input}
            />
          </Field>
        </Section>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-8 py-3 hover:bg-mauve transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

const input =
  'w-full border border-obsidian/20 bg-ivory/50 px-3 py-2 font-sans text-sm text-obsidian placeholder:text-obsidian/30 focus:outline-none focus:border-obsidian transition-colors';

const fileInput =
  'block w-full font-sans text-sm text-obsidian/60 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-obsidian file:text-ivory file:text-xs file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-mauve file:transition-colors';

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-obsidian/10 rounded p-6 space-y-5">
      <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40">{heading}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs text-obsidian/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
