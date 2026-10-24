import { motion } from 'framer-motion';
import { useTilt } from '../hooks/useTilt';
import type { IconName } from './Icon';
import { Icon } from './Icon';
import { fadeUp, reveal, stagger, staggerFast } from './motion';

// The four selling points. `wide` cards span two columns of the bento grid.
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

/** One glass feature card that tilts towards the mouse. */
function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const tilt = useTilt<HTMLElement>(6);
  return (
    <article className="feature glass" ref={tilt.ref} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave}>
      <span className="feature__icon">
        <Icon name={f.icon} size={24} />
      </span>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
    </article>
  );
}

/** "Why Cutesify" section: heading plus a bento grid of feature cards. */
export function Features() {
  return (
    <section className="section">
      <motion.div className="section__head" variants={stagger} {...reveal}>
        <motion.p className="eyebrow" variants={fadeUp}>
          Why Cutesify
        </motion.p>
        <motion.h2 variants={fadeUp}>Made to feel as good as it looks</motion.h2>
      </motion.div>

      {/* Grid cells reveal one after another; each wrapper does the motion so the card's tilt stays intact. */}
      <motion.div className="bento" variants={staggerFast} {...reveal}>
        {features.map((f) => (
          <motion.div key={f.title} className={`bento__item ${f.wide ? 'bento__item--wide' : ''}`} variants={fadeUp}>
            <FeatureCard f={f} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
