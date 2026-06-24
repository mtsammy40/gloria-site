'use client';

import { useEffect, useState } from 'react';

export function FooterEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(
      'hello' + String.fromCharCode(64) + 'gloriahmutheu' + String.fromCharCode(46) + 'com',
    );
  }, []);

  if (!email) return null;

  return (
    <a
      href={`mailto:${email}`}
      className="text-mauve/80 hover:text-mauve transition-colors text-sm font-sans"
    >
      {email}
    </a>
  );
}
