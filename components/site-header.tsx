'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, ShoppingBag, UserRound, Heart } from 'lucide-react';

export function SiteHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      fetch('/api/cart')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) =>
          setCount(
            (d?.items || []).reduce(
              (n: number, x: { quantity: number }) => n + x.quantity,
              0
            )
          )
        )
        .catch(() => {});
    };
    update();
    window.addEventListener('jico-cart-update', update);
    return () => window.removeEventListener('jico-cart-update', update);
  }, []);

  return (
    <header className="bg-[#f5f3ee] border-b border-black/10">
      <div className="page-width h-[76px] flex items-center justify-between relative">
        <nav className="hidden md:flex gap-8 text-[10px] tracking-[.16em] uppercase">
          <Link href="/shop">Shop</Link>
          <Link href="/shop">New in</Link>
          <a href="/#story">Our story</a>
        </nav>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-center"
        >
          <span className="serif text-[28px] tracking-[.17em]">JICO</span>
          <span className="block -mt-1 text-[8px] tracking-[.34em]">
            FOOTIES
          </span>
        </Link>

        <div className="flex items-center gap-5 ml-auto">
          <Link href="/shop" aria-label="Search" title="Search">
            <Search size={17} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={17} />
          </Link>
          <Link href="/account" aria-label="Account" title="Account">
            <UserRound size={17} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            title="Cart"
            className="relative"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#465041] text-white text-[9px] grid place-items-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}