'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Featured');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((x) => setProducts(x.products || []));
  }, []);

  const cats = ['All', 'Loafers', 'Sandals', 'Sneakers', 'Heels', 'Boots'];

  const items = useMemo(() => {
    const matched = products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === 'Price: low to high') matched.sort((a, b) => a.price - b.price);
    if (sort === 'Price: high to low') matched.sort((a, b) => b.price - a.price);
    return matched;
  }, [products, category, query, sort]);

  return (
    <section className="page-width pt-14 md:pt-20">
      <div className="border-b border-black/15 pb-8">
        <p className="eyebrow text-[#77796f] mb-3">
          JICO FOOTIES · COLLECTION 01
        </p>
        <h1 className="serif text-5xl md:text-6xl">The footwear edit.</h1>
        <p className="text-sm text-[#77796f] mt-4">
          Considered pieces for the everyday and everything after.
        </p>
      </div>

      <div className="py-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-5 overflow-x-auto text-xs">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap pb-2 ${
                category === c ? 'border-b border-black' : 'text-[#77796f]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 border border-black/20 rounded-sm px-3 py-2 focus-within:border-black transition-colors bg-white/40">
            <Search size={14} className="text-[#77796f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes..."
              className="bg-transparent outline-none text-sm w-40 placeholder:text-[#999b91]"
              type="search"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[#77796f]">
            <SlidersHorizontal size={14} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option>Featured</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <p className="text-xs text-[#77796f] mb-5">
        {items.length} {items.length === 1 ? 'PIECE' : 'PIECES'}
      </p>

      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <p className="py-20 text-center text-sm text-[#77796f]">
          No pairs match your search.
        </p>
      )}
    </section>
  );
}