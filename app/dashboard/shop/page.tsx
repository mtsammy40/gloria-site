import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { listProducts } from '@/lib/content/products';
import { verifySession } from '@/lib/auth/session';
import { ShopActions } from './shop-actions';

function formatKes(n: number) {
  return `KES ${n.toLocaleString()}`;
}

export default async function ShopDashboardPage() {
  await verifySession();
  const products = await listProducts(db);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display italic text-3xl text-obsidian">Shop</h1>
          <p className="font-sans text-xs text-obsidian/40 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/shop/new"
          className="bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-5 py-3 hover:bg-mauve transition-colors"
        >
          + Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-obsidian/10 py-16 text-center rounded bg-white">
          <p className="font-sans text-sm text-obsidian/40">No products yet.</p>
          <Link
            href="/dashboard/shop/new"
            className="font-sans text-sm text-mauve hover:underline mt-2 inline-block"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-obsidian/10 rounded overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-obsidian/10 text-xs uppercase tracking-widest text-obsidian/40">
                <th className="text-left px-4 py-3 font-normal">Artwork</th>
                <th className="text-left px-4 py-3 font-normal">Type</th>
                <th className="text-left px-4 py-3 font-normal">Price</th>
                <th className="text-left px-4 py-3 font-normal hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3 font-normal hidden lg:table-cell">Edition</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian/8">
              {products.map((product) => {
                const available = !product.manuallyMarkedSold && product.stockRemaining > 0;
                return (
                  <tr key={product.id} className="hover:bg-obsidian/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 shrink-0 bg-obsidian/5">
                          {product.artwork.imageUrl && (
                            <Image
                              src={product.artwork.imageUrl}
                              alt={product.artwork.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                        <span className="font-display italic text-obsidian">
                          {product.artwork.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-obsidian/60 capitalize">{product.type}</td>
                    <td className="px-4 py-3 text-obsidian">{formatKes(product.priceKes)}</td>
                    <td className="px-4 py-3 text-obsidian/60 hidden md:table-cell">
                      {product.stockRemaining}
                    </td>
                    <td className="px-4 py-3 text-obsidian/60 hidden lg:table-cell">
                      {product.editionSize ? `/${product.editionSize}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {available ? (
                        <span className="inline-flex items-center gap-1.5 font-sans text-xs text-sage">
                          <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-sans text-xs text-obsidian/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-obsidian/20" />
                          {product.manuallyMarkedSold ? 'Sold' : 'Out of stock'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/shop/${product.id}/edit`}
                        className="font-sans text-xs text-obsidian/50 hover:text-obsidian mr-4 transition-colors"
                      >
                        Edit
                      </Link>
                      <ShopActions id={product.id} title={product.artwork.title} type={product.type} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
