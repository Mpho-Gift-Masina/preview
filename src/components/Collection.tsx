import { useState } from 'react';
import type { LaceSize, Product } from '../data/products';
import { products } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductDialog } from './ProductDialog';

type Filter = 'all' | LaceSize;

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All units' },
  { value: '13x4', label: '13x4 lace' },
  { value: '13x6', label: '13x6 lace' },
];

export function Collection() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Product | null>(null);
  const shown = filter === 'all' ? products : products.filter((p) => p.lace === filter);

  return (
    <section id="collection" className="section">
      <div className="section__head" data-reveal>
        <p className="eyebrow">The collection</p>
        <h2>Signature units</h2>
        <p className="section__lede">Four statement units, from icy platinum to deep burgundy. Tap Details for more photos.</p>
      </div>

      <div className="filters glass" role="group" aria-label="Filter by lace size">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filters__btn ${filter === f.value ? 'is-active' : ''}`}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="products" aria-live="polite">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={setSelected} />
        ))}
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
