import { db } from '@/lib/db';
import { listProducts } from '@/lib/content/products';
import { getSiteSettings } from '@/lib/content/settings';
import { ShopTabs } from '@/components/shop-tabs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — Gloriah Mutheu Mwangangi',
  description: 'Original paintings and limited prints by Gloriah Mutheu Mwangangi, available to purchase.',
};

export default async function ShopPage() {
  let originals: Awaited<ReturnType<typeof listProducts>> = [];
  let prints: Awaited<ReturnType<typeof listProducts>> = [];
  let usdRate = 130;

  try {
    const [allProducts, settings] = await Promise.all([listProducts(db), getSiteSettings(db)]);
    originals = allProducts.filter((p) => p.type === 'original');
    prints = allProducts.filter((p) => p.type === 'print');
    usdRate = settings.usdExchangeRate;
  } catch {
    // DB not available — render empty state
  }

  return (
    <section className="bg-ivory min-h-screen px-6 lg:px-10 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-14 lg:mb-20">
          <h1 className="font-display italic text-4xl lg:text-5xl text-obsidian">Shop</h1>
          <p className="font-sans text-sm text-obsidian/50 mt-3 max-w-sm leading-relaxed">
            All prices in KES. USD reference shown at current rate. Shipping available worldwide.
          </p>
        </header>

        <ShopTabs originals={originals} prints={prints} usdRate={usdRate} />
      </div>
    </section>
  );
}
