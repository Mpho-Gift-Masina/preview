import { useState } from 'react';
import type { LaceSize } from '../data/products';
import { Icon } from './Icon';

const guides: Record<LaceSize, { title: string; image: string; alt: string; points: string[] }> = {
  '13x4': {
    title: '13x4 lace frontal',
    image: '/images/lace-13x4.webp',
    alt: 'Diagram of a 13x4 lace frontal cap: 13 inches ear to ear, 4 inches deep, elastic net, 3 combs and adjustable straps.',
    points: [
      '13" ear to ear, 4" deep parting space',
      'Breathable elastic net cap',
      '3 combs: two sides and back',
      'Adjustable straps for a secure fit',
    ],
  },
  '13x6': {
    title: '13x6 lace frontal',
    image: '/images/lace-13x6.webp',
    alt: 'Diagram of a 13x6 lace frontal cap: 13 inches ear to ear, 6 inches deep, elastic band, 4 combs and adjustable straps.',
    points: [
      '13" ear to ear, 6" deep parting space',
      'Deeper part for middle and side styles',
      '4 combs plus an elastic band',
      'HD transparent lace, made for all skin tones',
    ],
  },
};

export function LaceGuide() {
  const [size, setSize] = useState<LaceSize>('13x4');
  const flipped = size === '13x6';

  return (
    <section id="lace-guide" className="section lace">
      <div className="lace__copy" data-reveal>
        <p className="eyebrow">Lace guide</p>
        <h2>13x4 or 13x6?</h2>
        <p className="section__lede">
          Both give you a natural hairline from ear to ear. The difference is how far back you can part.
        </p>

        <div className="filters glass" role="tablist" aria-label="Lace size">
          {(Object.keys(guides) as LaceSize[]).map((s) => (
            <button
              key={s}
              role="tab"
              id={`tab-${s}`}
              aria-selected={size === s}
              aria-controls="lace-panel"
              className={`filters__btn ${size === s ? 'is-active' : ''}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <ul className="lace__points" id="lace-panel" role="tabpanel" aria-labelledby={`tab-${size}`}>
          {guides[size].points.map((pt) => (
            <li key={pt}>
              <Icon name="check" size={18} /> {pt}
            </li>
          ))}
        </ul>
      </div>

      <div className="flip" data-reveal>
        <div className={`flip__card ${flipped ? 'is-flipped' : ''}`}>
          {(['13x4', '13x6'] as LaceSize[]).map((s, i) => (
            <figure key={s} className={`flip__face glass ${i ? 'flip__face--back' : ''}`} aria-hidden={s !== size}>
              <img src={guides[s].image} alt={guides[s].alt} loading="lazy" width={900} height={895} />
              <figcaption>{guides[s].title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
