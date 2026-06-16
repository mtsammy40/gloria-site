import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/shop', label: 'Shop' },
  { href: '/interior-art', label: 'Interior Art' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory border-b border-obsidian/10">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="font-display italic text-lg lg:text-xl text-obsidian tracking-wide hover:text-mauve transition-colors"
        >
          Gloriah Mutheu Mwangangi
        </Link>

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
        </ul>

        {/* Mobile menu placeholder — implemented in a later slice */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span className="block w-6 h-px bg-obsidian" />
          <span className="block w-6 h-px bg-obsidian" />
          <span className="block w-4 h-px bg-obsidian" />
        </button>
      </nav>
    </header>
  );
}
