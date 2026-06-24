import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interior Art — Gloriah Mutheu Mwangangi',
  description:
    'Bespoke interior art curation and commission service by Gloriah Mutheu Mwangangi through oriahinteriorart.',
};

const HOW_IT_WORKS = [
  {
    step: '01',
    heading: 'Consult',
    body: 'We begin with a conversation — your space, your life in it, what you want the work to do. Remote or in-person, whatever suits. No brief is too open-ended.',
  },
  {
    step: '02',
    heading: 'Curate or Commission',
    body: 'We identify existing pieces from the portfolio that belong in your space, or we commission something made specifically for it. You see every stage before anything is finalised.',
  },
  {
    step: '03',
    heading: 'Deliver & Install',
    body: 'Carefully packaged and professionally installed. We handle logistics within Kenya; international shipping is coordinated on request. Your walls, transformed.',
  },
];

// Placeholder images — actual works-in-space photos managed via dashboard later
const SPACES: { alt: string; src: string | null }[] = [
  { alt: 'Living room installation', src: null },
  { alt: 'Office lobby', src: null },
  { alt: 'Residential hallway', src: null },
];

export default function InteriorArtPage() {
  return (
    <>
      {/* ── Split hero ────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Image panel */}
        <div className="relative bg-obsidian/5 min-h-[50vw] lg:min-h-0 order-last lg:order-first">
          <div className="absolute inset-0 bg-gradient-to-br from-mauve/10 to-obsidian/20 flex items-end p-8">
            <span className="font-display italic text-obsidian/20 text-sm">
              Work in space — image coming soon
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="bg-ivory flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-24">
          <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-4">
            oriahinteriorart
          </p>
          <h1 className="font-display font-semibold text-3xl lg:text-4xl text-obsidian mb-6 leading-snug">
            Art that belongs in your space
          </h1>
          <p className="font-sans text-base text-obsidian/70 leading-relaxed max-w-md mb-8">
            A bespoke curation and commission service for homes, offices, and hospitality spaces in
            Nairobi and beyond. We find — or make — the piece that completes a room.
          </p>
          <Link
            href="/contact"
            className="self-start font-sans text-xs uppercase tracking-widest border border-obsidian text-obsidian px-8 py-4 hover:border-mauve hover:text-mauve transition-colors"
          >
            Begin a Conversation
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="bg-obsidian px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-semibold text-3xl lg:text-4xl text-ivory mb-14 lg:mb-20">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {HOW_IT_WORKS.map(({ step, heading, body }) => (
              <div key={step}>
                <p className="font-sans text-xs text-mauve/50 tracking-widest mb-4">{step}</p>
                <h3 className="font-display font-semibold text-xl text-ivory mb-4">{heading}</h3>
                <p className="font-sans text-sm text-ivory/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Work in space gallery ─────────────────────────────────────── */}
      <section className="bg-ivory px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-semibold text-3xl text-obsidian mb-10 lg:mb-14">
            Work in space
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {SPACES.map(({ alt, src }) => (
              <div key={alt} className="relative aspect-[3/4] bg-obsidian/5">
                {src ? (
                  <Image src={src} alt={alt} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="font-display italic text-obsidian/20 text-xs">{alt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────── */}
      <section className="bg-obsidian px-6 py-20 lg:py-24 text-center">
        <h2 className="font-display font-semibold text-3xl lg:text-4xl text-ivory mb-4">
          Ready to begin?
        </h2>
        <p className="font-sans text-sm text-ivory/50 mb-10 max-w-sm mx-auto leading-relaxed">
          Tell us about your space and what you&apos;re looking for. We&apos;ll take it from there.
        </p>
        <Link
          href="/contact"
          className="inline-block font-sans text-xs uppercase tracking-widest bg-ivory text-obsidian px-10 py-4 hover:bg-mauve hover:text-ivory transition-colors"
        >
          Begin a Conversation
        </Link>
      </section>
    </>
  );
}
