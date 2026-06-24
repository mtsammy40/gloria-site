'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CartCount } from './cart-count';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/shop', label: 'Shop' },
  { href: '/interior-art', label: 'Interior Art' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory border-b border-obsidian/10">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display font-semibold text-lg lg:text-xl text-obsidian tracking-wide hover:text-mauve transition-colors"
        >
          Gloriah Mutheu Mwangangi
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-sans text-xs uppercase tracking-widest text-obsidian/70 hover:text-obsidian transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <CartCount />
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span
            className={`block h-px bg-obsidian transition-all duration-300 origin-center ${
              open ? 'w-6 translate-y-[7px] rotate-45' : 'w-6'
            }`}
          />
          <span
            className={`block h-px bg-obsidian transition-all duration-300 ${
              open ? 'w-0 opacity-0' : 'w-6'
            }`}
          />
          <span
            className={`block h-px bg-obsidian transition-all duration-300 origin-center ${
              open ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-4'
            }`}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden bg-obsidian overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pt-8 pb-12">
          <ul className="space-y-1 mb-10">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block font-display font-semibold text-3xl text-ivory hover:text-mauve transition-colors py-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-mauve/20 pt-6">
            <CartCount />
          </div>
        </div>
      </div>
    </header>
  );
}
