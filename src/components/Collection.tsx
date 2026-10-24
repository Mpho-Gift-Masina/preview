import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LaceSize, Product } from '../data/products';
import { products } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductDialog } from './ProductDialog';
import { fadeUp, reveal, stagger, staggerFast } from './motion';

type Filter = 'all' | LaceSize;

// The filter buttons above the product grid.
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All units' },
  { value: '13x4', label: '13x4 lace' },
  { value: '13x6', label: '13x6 lace' },
];

/** Product grid with lace-size filters, plus the details popup for the chosen product. */
export function Collection() {
  const [filter, setFilter] = useState<Filter>('all');
  // The product whose details popup is open (null = closed).
  const [selected, setSelected] = useState<Product | null>(null);
  const shown = filter === 'all' ? products : products.filter((p) => p.lace === filter);

  return (
    <section id="collection" className="section">
      {/* Heading block: eyebrow, title and intro rise in one after another. */}
      <motion.div className="section__head" variants={stagger} {...reveal}>
        <motion.p className="eyebrow" variants={fadeUp}>
          The collection
        </motion.p>
        <motion.h2 variants={fadeUp}>Signature units</motion.h2>
        <motion.p className="section__lede" variants={fadeUp}>
          Four statement units, from icy platinum to deep burgundy. Tap Details for more photos.
        </motion.p>
      </motion.div>

      <motion.div className="filters glass" role="group" aria-label="Filter by lace size" variants={fadeUp} {...reveal}>
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
      </motion.div>

      {/* Cards rise in quickly one after another. The wrapper does the motion so the card's own 3D tilt isn't overridden. */}
      <motion.div className="products" aria-live="polite" variants={staggerFast} {...reveal}>
        {shown.map((p) => (
          <motion.div key={p.id} variants={fadeUp}>
            <ProductCard product={p} onOpen={setSelected} />
          </motion.div>
        ))}
      </motion.div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
