'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Product, naira } from '@/lib/products';

export function ProductGrid({ items }: { items: Product[] }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/wishlist')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const raw = d.items || d.wishlist || d.data || [];
        const list = Array.isArray(raw) ? raw : [];
        const ids: string[] = list
          .map((w: unknown) => {
            if (!w || typeof w !== 'object') return null;
            const obj = w as Record<string, unknown>;
            return (
              (obj.product_id as string) ||
              (obj.productId as string) ||
              (obj.id as string) ||
              null
            );
          })
          .filter((x): x is string => typeof x === 'string');
        setSaved(new Set(ids));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleWishlist = async (id: string) => {
    const wasSaved = saved.has(id);
    setSaved((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      const r = await fetch('/api/wishlist', {
        method: wasSaved ? 'DELETE' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });

      if (r.status === 401) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        location.assign('/account');
        return;
      }

      if (!r.ok) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        return;
      }

      window.dispatchEvent(new Event('jico-wishlist-update'));
    } catch {
      setSaved((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const handleAddToCart = async (slug: string) => {
    try {
      const r = await fetch('/api/cart', { method: 'GET' });
      if (r.status === 401) {
        location.assign(
          `/account?notice=${encodeURIComponent('Sign in to add items to your cart')}`
        );
        return;
      }
    } catch {
      // fall through — send them to the product page anyway
    }
    location.assign(`/product/${slug}`);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-7">
      {items.map((p, i) => {
        const isSaved = loaded && saved.has(p.id);
        return (
          <article
            key={p.id}
            className="group fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-[.79] overflow-hidden bg-[#e9e6df]">
              <Link href={`/product/${p.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />
              </Link>

              {/* Wishlist heart — always visible in top-right */}
              <button
                type="button"
                onClick={() => toggleWishlist(p.id)}
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                className="absolute top-3 right-3 z-10 bg-[#f5f3ee]/90 p-2 hover:bg-[#f5f3ee] transition-colors"
              >
                <Heart
                  size={15}
                  strokeWidth={isSaved ? 0 : 2}
                  className={
                    isSaved
                      ? 'fill-[#b91c1c]'
                      : 'fill-transparent text-[#181917]'
                  }
                />
              </button>

              {/* Add to cart bar — appears at the TOP on hover, slides down */}
              <button
                type="button"
                onClick={() => handleAddToCart(p.slug)}
                className="absolute inset-x-0 top-0 bg-[#465041] text-white text-center py-3.5 text-[11px] tracking-[.16em] uppercase font-medium -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
              >
                Add to cart
              </button>
            </div>

            <div className="flex justify-between gap-2 mt-3">
              <div>
                <Link href={`/product/${p.slug}`} className="text-sm">
                  {p.name}
                </Link>
                <p className="text-[11px] text-[#77796f] mt-1">{p.category}</p>
              </div>
              <span className="text-sm pt-0.5 whitespace-nowrap">
                {naira(p.price)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}