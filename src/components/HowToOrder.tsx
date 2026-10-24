import { motion } from 'framer-motion';
import { DELIVERY, SAME_DAY } from '../config';
import { formatPrice } from '../data/products';
import { POLICIES_HREF } from '../hooks/useRoute';
import { fadeUp, reveal, stagger } from './motion';

// The three ordering steps. Prices come from config.ts so they stay in sync with checkout.
const steps = [
  { title: 'Pick your unit', body: 'Browse the collection and add the length, colour and lace you love to your bag.' },
  {
    title: 'Delivery or collection',
    body: `Same-day delivery in ${SAME_DAY.area}. Courier delivery anywhere else in South Africa from ${formatPrice(DELIVERY.speeds.standard.local)}, free over ${formatPrice(DELIVERY.freeThreshold)}. Or collect from us for free.`,
  },
  { title: 'Pay and slay', body: 'Pay securely online by card or Instant EFT. You get your order number straight away.' },
];

/** "How to order" section: heading, policies reminder and three numbered step cards. */
export function HowToOrder() {
  return (
    <section id="how-to-order" className="section">
      <motion.div className="section__head" variants={stagger} {...reveal}>
        <motion.p className="eyebrow" variants={fadeUp}>
          How to order
        </motion.p>
        <motion.h2 variants={fadeUp}>Three steps to your new look</motion.h2>
        <motion.p className="section__lede" variants={fadeUp}>
          All sales are final, so please read our <a href={POLICIES_HREF}>store policies</a> before you order.
        </motion.p>
      </motion.div>

      {/* Step cards rise in one after another. */}
      <motion.ol className="steps" variants={stagger} {...reveal}>
        {steps.map((s, i) => (
          <motion.li key={s.title} className="step glass" variants={fadeUp}>
            <span className="step__num" aria-hidden="true">
              0{i + 1}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
