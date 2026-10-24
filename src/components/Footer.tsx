import { motion } from 'framer-motion';
import { DELIVERY, SAME_DAY } from '../config';
import { formatPrice } from '../data/products';
import { POLICIES_HREF } from '../hooks/useRoute';
import { Icon } from './Icon';
import { fadeUp, reveal } from './motion';

/** Site footer: a glass "shop now" call to action, then copyright and page links. */
export function Footer() {
  return (
    <footer className="footer">
      <motion.div className="cta glass" variants={fadeUp} {...reveal}>
        <img src="/images/logo.webp" alt="Cutesify Hair Company" width={140} height={140} loading="lazy" />
        <div>
          <h2>Ready for your next look?</h2>
          <p>
            Pay securely online, then get it delivered (same day in {SAME_DAY.area}, free over{' '}
            {formatPrice(DELIVERY.freeThreshold)}) or collect it from us at no charge.
          </p>
        </div>
        <a className="btn btn--primary btn--lg" href="#collection">
          <Icon name="bag" size={18} /> Shop now
        </a>
      </motion.div>
      <div className="footer__bar">
        <p>© {new Date().getFullYear()} Cutesify Hair Company</p>
        <nav aria-label="Footer">
          <a href="#collection">Collection</a>
          <a href="#story">Our story</a>
          <a href="#lace-guide">Lace guide</a>
          <a href="#how-to-order">How to order</a>
          <a href={POLICIES_HREF}>Policies</a>
        </nav>
      </div>
    </footer>
  );
}
