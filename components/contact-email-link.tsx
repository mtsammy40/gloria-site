'use client';

import { useEffect, useState } from 'react';

export function ContactEmailLink() {
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
      className="font-sans text-sm text-obsidian/70 hover:text-obsidian transition-colors"
    >
      {email}
    </a>
  );
}
