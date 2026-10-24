import { useState } from 'react';
import { motion } from 'framer-motion';
import { policies, policyPosters } from '../data/policies';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { PolicyCarousel } from './PolicyCarousel';
import { fadeUp, reveal, stagger, staggerFast } from './motion';

/** Smoothly scroll a policy card into the middle of the screen (used by the quick-jump chips). */
function scrollToPolicy(id: string) {
  document.getElementById(`policy-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** The #/policies page: intro, quick-jump chips, the nine policy cards and the original graphics carousel. */
export function PoliciesPage() {
  // Which policy graphic is open full size (null = none).
  const [open, setOpen] = useState<number | null>(null);
  // Keep showing the last graphic while the popup animates closed.
  const shown = open ?? 0;

  return (
    <div className="policies">
      {/* Intro: back link, title, summary banner and chips rise in one after another. */}
      <motion.section className="section policies__hero" variants={stagger} {...reveal}>
        <motion.div variants={fadeUp}>
          <a className="back-link" href="#top">
            <Icon name="back" size={16} /> Back to the shop
          </a>
          <p className="eyebrow">Store policies</p>
          <h1 className="policies__title">
            The <em>fine print</em>, made pretty.
          </h1>
          <p className="section__lede">
            Please read these before you order. By placing an order, you confirm that you have read and accepted all
            Cutesify Hair Company policies.
          </p>
        </motion.div>

        <motion.div className="policies__alert glass" variants={fadeUp}>
          <Icon name="shield" size={22} />
          <p>
            <strong>All sales are final.</strong> For hygiene reasons we don't offer refunds. Exchanges only apply to wrong
            or defective items reported within 24 hours of delivery.
          </p>
        </motion.div>

        {/* One chip per policy; tapping scrolls to that card. */}
        <motion.div className="policies__chips" variants={fadeUp}>
          {policies.map((p) => (
            <button key={p.id} className="chip glass" onClick={() => scrollToPolicy(p.id)}>
              <Icon name={p.icon} size={15} /> {p.title.replace(' policy', '')}
            </button>
          ))}
        </motion.div>
      </motion.section>

      {/* The nine policies as glass cards, revealed quickly one after another. */}
      <motion.section className="section policies__list" aria-label="All policies" variants={staggerFast} {...reveal}>
        {policies.map((p, i) => (
          <motion.article key={p.id} id={`policy-${p.id}`} className="policy glass" variants={fadeUp}>
            <span className="policy__icon">
              <Icon name={p.icon} size={24} />
            </span>
            <span className="policy__num">{String(i + 1).padStart(2, '0')}</span>
            <h2>{p.title}</h2>
            {p.body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </motion.article>
        ))}
      </motion.section>

      {/* The original social-media policy graphics, in a 3D carousel. */}
      <section className="section">
        <motion.div className="section__head" variants={stagger} {...reveal}>
          <motion.p className="eyebrow" variants={fadeUp}>
            The originals
          </motion.p>
          <motion.h2 variants={fadeUp}>Our policy cards</motion.h2>
          <motion.p className="section__lede" variants={fadeUp}>
            The same policies as we share them on social media. Swipe through, then tap a card to see it full size.
          </motion.p>
        </motion.div>
        <motion.div variants={fadeUp} {...reveal}>
          <PolicyCarousel onOpen={setOpen} />
        </motion.div>
      </section>

      {/* Full-size view of a policy graphic. */}
      <Modal open={open !== null} onClose={() => setOpen(null)} labelledBy="poster-title" className="poster-modal">
        <h2 id="poster-title" className="sr-only">
          Policy card {shown + 1}
        </h2>
        <button className="icon-btn poster-modal__close" onClick={() => setOpen(null)} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
        <img src={policyPosters[shown].src} alt={policyPosters[shown].alt} width={1086} height={1450} />
      </Modal>
    </div>
  );
}
