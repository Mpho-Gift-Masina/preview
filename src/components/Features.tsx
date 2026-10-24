import { useTilt } from '../hooks/useTilt';
import type { IconName } from './Icon';
import { Icon } from './Icon';

const features: { icon: IconName; title: string; body: string; wide?: boolean }[] = [
  {
    icon: 'feather',
    title: 'Transparent lace that melts',
    body: 'Thin, transparent lace blends into your skin for a hairline that looks like it grew there.',
    wide: true,
  },
  { icon: 'ruler', title: 'Adjustable fit', body: 'Straps and combs keep your unit secure all day.' },
  { icon: 'layers', title: 'Breathable cap', body: 'Elastic net construction keeps you cool and comfortable.' },
  {
    icon: 'sparkle',
    title: 'Colours that pop',
    body: 'From icy platinum to 99J burgundy, statement shades that photograph beautifully.',
    wide: true,
  },
];

function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const tilt = useTilt<HTMLElement>(6);
  return (
    <article
      className={`feature glass ${f.wide ? 'feature--wide' : ''}`}
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      data-reveal
    >
      <span className="feature__icon">
        <Icon name={f.icon} size={24} />
      </span>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
    </article>
  );
}

export function Features() {
  return (
    <section className="section">
      <div className="section__head" data-reveal>
        <p className="eyebrow">Why Cutesify</p>
        <h2>Made to feel as good as it looks</h2>
      </div>
      <div className="bento">
        {features.map((f) => (
          <FeatureCard key={f.title} f={f} />
        ))}
      </div>
    </section>
  );
}
