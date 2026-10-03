'use client';
import { useState } from 'react';
import Link from 'next/link';

export function ProductActions({
  product,
  availableSizes,
}: {
  product: { id: string; name: string; slug: string; price: number; image: string };
  availableSizes: string[];
}) {
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  async function add() {
    if (!size) {
      setMessage('Please select a size first.');
      return;
    }
    setBusy(true);
    setMessage('');
    setJustAdded(false);
    setNeedsSignIn(false);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data.error || '';
        if (err.toLowerCase().includes('sign in')) {
          setNeedsSignIn(true);
          setMessage('');
        } else {
          setMessage(err || 'Something went wrong. Please try again.');
        }
        return;
      }
      window.dispatchEvent(new Event('jico-cart-update'));
      setMessage('Added to your cart.');
      setJustAdded(true);
    } catch {
      setMessage('We could not update your cart. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-2 max-w-sm">
        {availableSizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`h-11 border text-xs ${
              size === s
                ? 'border-[#465041] bg-[#465041] text-white'
                : 'border-black/20 hover:border-black'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        disabled={busy}
        onClick={add}
        className="mt-5 w-full max-w-sm bg-[#465041] text-white py-4 text-[10px] tracking-[.17em] uppercase disabled:opacity-60"
      >
        {busy ? 'Adding…' : 'Add to cart'}
      </button>

      {needsSignIn && (
        <p className="text-xs mt-3">
          <Link
            className="underline"
            href={`/account?add=${encodeURIComponent(product.id)}&size=${encodeURIComponent(size)}`}
          >
            Sign in to add this to your cart →
          </Link>
        </p>
      )}

      {message && (
        <p className="text-xs mt-3">
          {message}{' '}
          {justAdded && (
            <Link className="underline ml-2" href="/cart">
              View cart →
            </Link>
          )}
        </p>
      )}
    </>
  );
}