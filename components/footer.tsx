import Link from 'next/link';
import { FooterEmail } from './footer-email';

type FooterProps = {
  instagramHandle?: string;
  pinterestHandle?: string;
};

export function Footer({ instagramHandle, pinterestHandle }: FooterProps) {
  const year = new Date().getFullYear();

  const linkClass =
    'font-sans text-[10px] uppercase tracking-[0.18em] text-ivory/50 hover:text-ivory transition-colors';

  return (
    <footer className="bg-obsidian text-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand mark */}
          <Link
            href="/"
            className="font-display font-semibold text-[40px] lg:text-[52px] text-ivory leading-none tracking-tight hover:text-ivory/80 transition-colors"
          >
            Gloriah<span className="text-sage">.</span>
          </Link>

          {/* Social + contact links */}
          <nav
            aria-label="Social links"
            className="flex flex-wrap items-center gap-5 lg:gap-8"
          >
            {instagramHandle && (
              <a
                href={`https://www.instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {instagramHandle}
              </a>
            )}
            {instagramHandle && (
              <a
                href={`https://www.instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Instagram
              </a>
            )}
            {pinterestHandle && (
              <a
                href={`https://www.pinterest.com/${pinterestHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Pinterest
              </a>
            )}
            <FooterEmail className={linkClass} />
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-ivory/[0.07] flex items-center justify-between">
          <p className="font-sans text-[10px] text-ivory/20">
            &copy; {year} Gloriah Mutheu Mwangangi
          </p>
          <Link
            href="/login"
            className="font-sans text-[10px] text-ivory/15 hover:text-ivory/40 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
