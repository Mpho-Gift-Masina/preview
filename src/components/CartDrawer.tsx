import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../cart/CartContext';
import { calcTotals } from '../cart/pricing';
import { DELIVERY, MAX_QTY } from '../config';
import { formatPrice } from '../data/products';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { ease } from './motion';

/** The bag: slides in from the right with each line, quantity controls, subtotal and Checkout button. */
export function CartDrawer() {
  const { items, setQty, remove, panel, closePanel, openCheckout } = useCart();
  const t = calcTotals(items);

  return (
    <Modal open={panel === 'cart'} onClose={closePanel} labelledBy="cart-title" variant="drawer" className="drawer">
      <div className="drawer__head">
        <h2 id="cart-title">
          Your bag <sup>({t.count})</sup>
        </h2>
        <button className="icon-btn" onClick={closePanel} aria-label="Close bag">
          <Icon name="close" size={20} />
        </button>
      </div>

      {t.lines.length === 0 ? (
        <motion.div className="drawer__empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.2 }}>
          <p className="drawer__empty-title">Your bag is empty.</p>
          <p>Find a unit you love and it will show up here.</p>
          <a className="btn btn--primary" href="#collection" onClick={closePanel}>
            Shop the collection <span className="btn__arrow">→</span>
          </a>
        </motion.div>
      ) : (
        <>
          <ul className="cart-lines">
            <AnimatePresence mode="popLayout" initial={false}>
              {t.lines.map(({ product: p, qty, total }, i) => (
                <motion.li
                  key={p.id}
                  layout
                  className="cart-line"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.7, ease, delay: 0.15 + i * 0.06 } }}
                  exit={{ opacity: 0, x: 60, transition: { duration: 0.35, ease } }}
                >
                  <img src={p.images[0]} alt="" width={84} height={112} />
                  <div className="cart-line__body">
                    <div className="cart-line__top">
                      <h3>{p.name}</h3>
                      <p className="cart-line__price">{formatPrice(total)}</p>
                    </div>
                    <p className="cart-line__meta">
                      {p.lengthInches}" · {p.lace} lace · {formatPrice(p.price)} each
                    </p>
                    <div className="cart-line__bottom">
                      <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
                        <button onClick={() => setQty(p.id, qty - 1)} aria-label={qty === 1 ? `Remove ${p.name}` : 'Decrease quantity'}>
                          <Icon name="minus" size={14} />
                        </button>
                        <output aria-live="polite">{qty}</output>
                        <button onClick={() => setQty(p.id, qty + 1)} disabled={qty >= MAX_QTY} aria-label="Increase quantity">
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <button className="link-btn" onClick={() => remove(p.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="drawer__foot">
            <FreeDeliveryMeter subtotal={t.subtotal} gap={t.freeDeliveryGap} />
            <dl className="totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(t.subtotal)}</dd>
              </div>
              <div className="totals__muted">
                <dt>Delivery or collection</dt>
                <dd>Calculated at checkout</dd>
              </div>
            </dl>
            <button className="btn btn--primary btn--lg btn--block" onClick={openCheckout}>
              <Icon name="lock" size={16} /> Checkout · {formatPrice(t.subtotal)}
            </button>
            <button className="link-btn link-btn--center" onClick={closePanel}>
              Continue shopping
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/** Progress bar and message showing how close the bag is to free standard delivery. */
function FreeDeliveryMeter({ subtotal, gap }: { subtotal: number; gap: number }) {
  const pct = Math.min(100, (subtotal / DELIVERY.freeThreshold) * 100);
  return (
    <div className="meter">
      <p>
        {gap > 0 ? (
          <>
            You're <strong>{formatPrice(gap)}</strong> away from free standard delivery.
          </>
        ) : (
          <>
            Your order qualifies for <strong>free standard delivery</strong>.
          </>
        )}
      </p>
      <div className="meter__track" aria-hidden="true">
        <motion.div className="meter__fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease, delay: 0.2 }} />
      </div>
    </div>
  );
}
