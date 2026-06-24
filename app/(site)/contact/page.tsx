import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/content/settings';
import { ContactForm } from '@/components/contact-form';
import { ContactEmailLink } from '@/components/contact-email-link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Gloriah Mutheu Mwangangi',
  description:
    'Get in touch with Gloriah Mutheu Mwangangi — commissions, shop enquiries, and interior art.',
};

export default async function ContactPage() {
  let instagramHandle = '@oriahinteriorart';
  let pinterestHandle = 'gloriahmutheu';

  try {
    const settings = await getSiteSettings(db);
    if (settings.instagramHandle) instagramHandle = settings.instagramHandle;
    if (settings.pinterestHandle) pinterestHandle = settings.pinterestHandle;
  } catch {
    // DB not seeded — use defaults
  }

  return (
    <section className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <header className="mb-14 lg:mb-20">
          <h1 className="font-display font-semibold text-4xl lg:text-5xl text-obsidian">Get in touch</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Form */}
          <div>
            <ContactForm />
          </div>

          {/* Info column */}
          <div className="lg:pt-1">
            <div className="space-y-10">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-3">
                  Email
                </p>
                <ContactEmailLink />
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-3">
                  Instagram
                </p>
                <p className="font-sans text-sm text-obsidian/70">{instagramHandle}</p>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-3">
                  Pinterest
                </p>
                <p className="font-sans text-sm text-obsidian/70">{pinterestHandle}</p>
              </div>

              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-mauve/60 mb-3">
                  Studio
                </p>
                <p className="font-sans text-sm text-obsidian/70 leading-relaxed">Nairobi, Kenya</p>
              </div>

              <blockquote className="border-l-2 border-mauve/40 pl-5 mt-10">
                <p className="font-display italic text-lg text-obsidian/70 leading-relaxed">
                  &ldquo;Every conversation starts with a space. Tell me about yours.&rdquo;
                </p>
                <footer className="mt-3">
                  <cite className="font-sans not-italic text-xs uppercase tracking-widest text-obsidian/30">
                    Gloriah Mutheu Mwangangi
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
