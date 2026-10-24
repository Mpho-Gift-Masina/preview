import { motion } from 'framer-motion';
import { useTilt } from '../hooks/useTilt';
import { DELIVERY, SAME_DAY } from '../config';
import { formatPrice, products } from '../data/products';
import { Icon } from './Icon';
import { fadeUp, reveal, slideIn, stagger } from './motion';

// Every product photo, in order, for the spinning 3D ring.
const slides = products.flatMap((p) => p.images.map((src) => ({ src, name: p.name })));
// Figures for the stat tiles, worked out from the product list so they stay correct.
const fromPrice = Math.min(...products.map((p) => p.price));
const lengths = products.map((p) => p.lengthInches);

/** Opening section: headline and buttons on the left, rotating 3D photo ring on the right. */
export function Hero() {
  // Lets the ring lean towards the mouse pointer.
  const stage = useTilt<HTMLDivElement>(6);

  return (
    <section id="top" className="hero">
      {/* Text column: each line rises in one after the other. */}
      <motion.div className="hero__copy" variants={stagger} {...reveal}>
        {/*<motion.p className="pill glass" variants={fadeUp}>
          <Icon name="sparkle" size={14} />// New drop · {products.length} signature units
        </motion.p>*/}
        <motion.h1 className="hero__title" variants={fadeUp}>
          Hair that <em>turns</em> heads.
        </motion.h1>
        <motion.p className="hero__lede" variants={fadeUp}>
          Lace frontal wigs in platinum, burgundy, chocolate and jet black. Transparent lace, adjustable fit, ready to
          slay straight out of the box.
        </motion.p>
        <motion.div className="hero__actions" variants={fadeUp}>
          <a className="btn btn--primary btn--lg" href="#collection">
            Shop the collection <Icon name="arrow" size={18} />
          </a>
          <a className="btn btn--glass btn--lg" href="#story">
            Our story
          </a>
        </motion.div>
        <motion.dl className="hero__stats" variants={fadeUp}>
          <div className="glass">
            <dt>From</dt>
            <dd>{formatPrice(fromPrice)}</dd>
          </div>
          <div className="glass">
            <dt>Lengths</dt>
            <dd>
              {Math.min(...lengths)}–{Math.max(...lengths)}"
            </dd>
          </div>
          <div className="glass">
            <dt>Free delivery</dt>
            <dd>{formatPrice(DELIVERY.freeThreshold)}+</dd>
          </div>
          <div className="glass">
            <dt>Same-day delivery only in</dt>
            <dd>{SAME_DAY.area}</dd>
          </div>
        </motion.dl>
      </motion.div>

      {/* 3D stage: slides in from the right, then spins and tilts with the pointer. */}
      <motion.div className="hero__stage-wrap" variants={slideIn} {...reveal}>
        <div
          className="hero__stage"
          ref={stage.ref}
          onPointerMove={stage.onPointerMove}
          onPointerLeave={stage.onPointerLeave}
          aria-label="Rotating showcase of Cutesify wigs"
          role="img"
        >
          <div className="carousel-tilt">
            {/* Each photo sits at its own angle around the ring (--i of --count). */}
            <div className="carousel" style={{ ['--count' as string]: slides.length }}>
              {slides.map((s, i) => (
                <figure className="carousel__item glass" key={s.src} style={{ ['--i' as string]: i }}>
                  <img src={s.src} alt="" width={300} height={400} />
                  <figcaption>{s.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          {/* Floating glass bubbles for depth. */}
          <div className="orb orb--a" aria-hidden="true" />
          <div className="orb orb--b" aria-hidden="true" />
          <div className="orb orb--c" aria-hidden="true" />
        </div>
      </motion.div>
    </section>
  );
}
