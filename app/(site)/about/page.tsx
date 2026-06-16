import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/content/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Gloriah Mutheu Mwangangi',
  description:
    'Nairobi-based visual artist Gloriah Mutheu Mwangangi — biography, practice, and artist statement.',
};

const STUDIO_PRACTICE = [
  {
    heading: 'Materials',
    body: 'Acrylic and oil on canvas, with occasional mixed media — textured grounds, palette knife, and raw linen for works that invite touch as much as sight.',
  },
  {
    heading: 'Subject',
    body: 'Figures in repose, domestic interiors, the Nairobi skyline at dusk. Scenes that hold still long enough to become something else.',
  },
  {
    heading: 'Scale',
    body: 'From intimate studies at 30 × 40 cm to room-filling canvases at 150 × 200 cm. Scale is a decision, not a default — each work dictates its own.',
  },
  {
    heading: 'Process',
    body: 'A slow accumulation of layers — colour before form, atmosphere before detail. Most pieces live on the easel for weeks. Some for months.',
  },
];

export default async function AboutPage() {
  let bio =
    'Gloriah Mutheu Mwangangi is a Nairobi-based visual artist working primarily in acrylic and oil. Her practice centres on the tension between permanence and transience — what we choose to preserve, and why.';
  let statementQuote =
    'I paint because the world needs more slowness. Each piece is an act of attention — to colour, to surface, to what stays when everything else has moved on.';
  let portraitUrl: string | null = null;
  let studioUrl: string | null = null;

  try {
    const settings = await getSiteSettings(db);
    if (settings.aboutBio) bio = settings.aboutBio;
    if (settings.aboutStatementQuote) statementQuote = settings.aboutStatementQuote;
    portraitUrl = settings.aboutPortraitUrl ?? null;
    studioUrl = settings.aboutStudioUrl ?? null;
  } catch {
    // DB not seeded — use defaults
  }

  return (
    <>
      {/* ── Split hero ────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Portrait */}
        <div className="relative bg-obsidian/5 min-h-[50vw] lg:min-h-0">
          {portraitUrl ? (
            <Image
              src={portraitUrl}
              alt="Gloriah Mutheu Mwangangi"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-end p-8">
              <span className="font-display italic text-obsidian/20 text-sm">Portrait image</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="bg-ivory flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-24">
          <p className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-6">
            About
          </p>
          <h1 className="font-display italic text-3xl lg:text-4xl text-obsidian mb-8 leading-snug">
            Gloriah Mutheu Mwangangi
          </h1>
          <p className="font-sans text-base text-obsidian/70 leading-relaxed max-w-md">{bio}</p>
        </div>
      </section>

      {/* ── Artist statement ─────────────────────────────────────────── */}
      <section className="bg-obsidian px-8 lg:px-20 py-20 lg:py-28">
        <blockquote className="max-w-3xl mx-auto">
          <p
            className="font-display italic text-ivory leading-relaxed"
            style={{ fontSize: 'clamp(24px, 3.5vw, 40px)' }}
          >
            &ldquo;{statementQuote}&rdquo;
          </p>
          <footer className="mt-6">
            <cite className="font-sans not-italic text-xs uppercase tracking-widest text-ivory/40">
              Gloriah Mutheu Mwangangi
            </cite>
          </footer>
        </blockquote>
      </section>

      {/* ── Studio Practice ──────────────────────────────────────────── */}
      <section className="bg-ivory px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display italic text-3xl lg:text-4xl text-obsidian mb-12 lg:mb-16">
            Studio Practice
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-obsidian/10">
            {STUDIO_PRACTICE.map(({ heading, body }) => (
              <div key={heading} className="bg-ivory p-8 lg:p-10">
                <h3 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-4">
                  {heading}
                </h3>
                <p className="font-sans text-base text-obsidian/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Studio image ─────────────────────────────────────────────── */}
      {studioUrl && (
        <section className="relative h-[60vh] bg-obsidian/5">
          <Image
            src={studioUrl}
            alt="Gloriah's studio"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-ivory px-6 py-16 text-center">
        <p className="font-sans text-sm text-obsidian/50 mb-6">Interested in a piece?</p>
        <Link
          href="/shop"
          className="inline-block font-sans text-xs uppercase tracking-widest border border-obsidian text-obsidian px-8 py-4 hover:bg-obsidian hover:text-ivory transition-colors"
        >
          Visit the Shop
        </Link>
      </section>
    </>
  );
}
