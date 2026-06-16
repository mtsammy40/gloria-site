import Link from 'next/link';
import { FooterEmail } from './footer-email';

const NAV_LINKS = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/shop', label: 'Shop' },
  { href: '/interior-art', label: 'Interior Art' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

type FooterProps = {
  instagramHandle?: string;
  pinterestHandle?: string;
};

export function Footer({ instagramHandle, pinterestHandle }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-obsidian text-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-display italic text-xl text-ivory hover:text-mauve transition-colors"
            >
              Gloriah Mutheu Mwangangi
            </Link>
            <p className="mt-4 text-sm font-sans text-ivory/50 leading-relaxed max-w-xs">
              Nairobi-based visual artist — original paintings, limited prints, and bespoke interior
              art.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs uppercase tracking-widest font-sans text-ivory/40 mb-4">
              Navigate
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-sans text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest font-sans text-ivory/40 mb-4">
              Connect
            </p>
            <div className="space-y-3">
              <div>
                <FooterEmail />
              </div>
              {instagramHandle && (
                <p className="text-sm font-sans text-ivory/60">
                  Instagram:{' '}
                  <span className="text-ivory/80">{instagramHandle}</span>
                </p>
              )}
              {pinterestHandle && (
                <p className="text-sm font-sans text-ivory/60">
                  Pinterest:{' '}
                  <span className="text-ivory/80">{pinterestHandle}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-8 flex items-center justify-between gap-4">
          <p className="text-xs font-sans text-ivory/30">
            &copy; {year} Gloriah Mutheu Mwangangi. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-xs font-sans text-ivory/20 hover:text-ivory/50 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
