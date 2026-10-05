'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { subscribeToCart } from '@/lib/supabase/realtime-cart';
import { naira } from '@/lib/products';

type Line = {
  id: string;
  quantity: number;
  variant?: {
    id: string;
    size: string;
    stock: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      price: number;
      image_url: string;
    };
  } | null;
};

export default function Cart() {
  const [items, setItems] = useState<Line[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof subscribeToCart> | null>(null);

  const load = () =>
    fetch('/api/cart')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setItems(d.items || []);
      })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();

    const db = createClient();
    let interval: ReturnType<typeof setInterval> | null = null;

    db.auth.getUser().then(({ data }) => {
      if (data.user) {
        channelRef.current = subscribeToCart(db, data.user.id, load);
      }
    });

    // Polling fallback every 5 seconds
    interval = setInterval(load, 5000);

    return () => {
      if (interval) clearInterval(interval);
      if (channelRef.current) db.removeChannel(channelRef.current);
    };
  }, []);

  const validItems = items.filter(
    (i) =>
      i.variant &&
      i.variant.product &&
      typeof i.variant.product.price === 'number'
  );

  const total = validItems.reduce(
    (s, i) => s + i.quantity * i.variant!.product!.price,
    0
  );

  async function update(id: string, quantity: number) {
    const r = quantity
      ? await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id, quantity }),
        })
      : await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
    if (!r.ok) {
      const d = await r.json();
      setMessage(d.error);
    } else {
      setMessage('');
      load();
      window.dispatchEvent(new Event('jico-cart-update'));
    }
  }

  return (
    <section className="page-width py-14 md:py-20 min-h-[55vh]">
      <p className="eyebrow text-[#77796f]">JICO FOOTIES</p>
      <h1 className="serif text-5xl mt-3 mb-9">Your cart.</h1>

      {loading ? (
        <p>Loading your cart…</p>
      ) : validItems.length ? (
        <div className="grid md:grid-cols-[1fr_330px] gap-12">
          <div>
            {validItems.map((i) => {
              const product = i.variant!.product!;
              return (
                <article
                  key={i.id}
                  className="border-t border-black/15 py-5 flex gap-5"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative w-28 h-32 shrink-0 bg-[#e8e5de]"
                  >
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link href={`/product/${product.slug}`} className="text-sm">
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#77796f] mt-2">
                      Size {i.variant!.size}
                    </p>
                    <div className="flex items-center gap-3 mt-5">
                      <button
                        onClick={() => update(i.id, i.quantity - 1)}
                        className="border border-black/20 w-7 h-7"
                      >
                        −
                      </button>
                      <span className="text-xs">{i.quantity}</span>
                      <button
                        onClick={() => update(i.id, i.quantity + 1)}
                        className="border border-black/20 w-7 h-7"
                      >
                        +
                      </button>
                      <button
                        onClick={() => update(i.id, 0)}
                        className="text-xs underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="text-xs">
                    {naira(i.quantity * product.price)}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="border-t border-black/15 pt-5">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{naira(total)}</span>
            </div>
            <p className="text-xs text-[#77796f] mt-2">
              Shipping calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="block bg-[#465041] text-white font-medium text-center py-4 mt-6 text-xs tracking-[.16em] uppercase hover:bg-[#3a4236] transition-colors"
            >
              Continue to checkout
            </Link>
            <Link
              href="/shop"
              className="block text-center text-xs underline mt-5"
            >
              Keep looking
            </Link>
          </aside>
        </div>
      ) : (
        <div className="border-t border-black/15 py-8">
          <p className="text-sm text-[#77796f]">
            {message || 'Your cart is waiting for the right pair.'}
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#465041] text-white px-7 py-4 mt-6 text-[11px] uppercase tracking-wider"
          >
            Explore the collection
          </Link>
        </div>
      )}

      {message && validItems.length > 0 && (
        <p className="text-xs mt-4">{message}</p>
      )}
    </section>
  );
}