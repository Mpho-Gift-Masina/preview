import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../data/products';
import { formatPrice } from '../data/products';
import { useCart } from '../cart/CartContext';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { ease } from './motion';

interface Props {
  product: Product | null;
  onClose: () => void;
}

/** Product details popup: photo gallery with thumbnails, specs and an "Add to bag" button. */
export function ProductDialog({ product, onClose }: Props) {
  const [active, setActive] = useState(0);
  const { add, openCart } = useCart();
  // Keep showing the last product while the dialog animates out.
  const last = useRef(product);
  if (product) last.current = product;
  const p = product ?? last.current;

  useEffect(() => {
    if (product) setActive(0);
  }, [product]);

  return (
    <Modal open={!!product} onClose={onClose} labelledBy="dialog-title" className="dialog">
      {p && (
        <div className="dialog__inner">
          <div className="dialog__gallery">
            <div className="dialog__photo">
              <AnimatePresence initial={false}>
                <motion.img
                  key={p.images[active]}
                  src={p.images[active]}
                  alt={`${p.name}, photo ${active + 1} of ${p.images.length}`}
                  width={450}
                  height={600}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                />
              </AnimatePresence>
            </div>
            {p.images.length > 1 && (
              <div className="dialog__thumbs" role="group" aria-label="Photos">
                {p.images.map((src, i) => (
                  <button
                    key={src}
                    className={i === active ? 'is-active' : ''}
                    aria-label={`Show photo ${i + 1}`}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                  >
                    <img src={src} alt="" width={64} height={84} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="dialog__details">
            <button className="icon-btn dialog__close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
            <p className="eyebrow">Unit</p>
            <h2 id="dialog-title">{p.name}</h2>
            <p className="dialog__price">{formatPrice(p.price)}</p>
            <p>{p.description}</p>
            <dl className="dialog__specs">
              <div>
                <dt>Length</dt>
                <dd>{p.lengthInches} inches</dd>
              </div>
              <div>
                <dt>Lace</dt>
                <dd>{p.lace} transparent frontal</dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd>{p.colour}</dd>
              </div>
              <div>
                <dt>Texture</dt>
                <dd>{p.texture}</dd>
              </div>
            </dl>
            <button
              className="btn btn--primary btn--lg"
              onClick={() => {
                add(p.id);
                onClose();
                openCart();
              }}
            >
              <Icon name="bag" size={18} /> Add {p.name} to bag
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
