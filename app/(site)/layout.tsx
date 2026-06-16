import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { MailingListBand } from '@/components/mailing-list-band';
import { CartProvider } from '@/lib/cart/cart-context';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/content/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let mailingHeading = 'Stay Close';
  let mailingSubheading = 'New work, studio updates, and first access to the shop.';
  let instagramHandle: string | undefined;
  let pinterestHandle: string | undefined;

  try {
    const settings = await getSiteSettings(db);
    if (settings.mailingBannerHeading) mailingHeading = settings.mailingBannerHeading;
    if (settings.mailingBannerSubheading) mailingSubheading = settings.mailingBannerSubheading;
    if (settings.instagramHandle) instagramHandle = settings.instagramHandle;
    if (settings.pinterestHandle) pinterestHandle = settings.pinterestHandle;
  } catch {
    // Settings not seeded yet — use defaults above
  }

  return (
    <CartProvider>
      <Nav />
      <main className="pt-16 lg:pt-20">{children}</main>
      <MailingListBand heading={mailingHeading} subheading={mailingSubheading} />
      <Footer instagramHandle={instagramHandle} pinterestHandle={pinterestHandle} />
    </CartProvider>
  );
}
