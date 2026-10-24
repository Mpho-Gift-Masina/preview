import type { Fulfilment, Totals } from '../cart/pricing';
import { DELIVERY } from '../config';
import { formatPrice } from '../data/products';

/** Name shown next to the delivery/collection fee, e.g. "Standard courier" or "Collection". */
export function fulfilmentLabel(f: Fulfilment): string {
  return f.method === 'delivery' ? DELIVERY.speeds[f.speed].label : 'Collection';
}

interface Props {
  totals: Totals;
  fulfilment: Fulfilment;
  /** Once paid, upsell hints no longer apply. */
  paid?: boolean;
}

/** Checkout sidebar: items, subtotal, delivery/collection fee and total. */
export function OrderSummary({ totals: t, fulfilment, paid = false }: Props) {
  const fee = t.fulfilmentFee ?? 0;
  const showFreeHint = !paid && fulfilment.method === 'delivery' && fulfilment.speed === 'standard' && t.freeDeliveryGap > 0;

  return (
    <div className="summary">
      <h2 className="summary__title">Order summary</h2>
      <ul className="summary-lines">
        {t.lines.map(({ product: p, qty, total }) => (
          <li key={p.id} className="summary-line">
            <span className="summary-line__img">
              <img src={p.images[0]} alt="" width={56} height={72} />
              <span className="summary-line__qty" aria-label={`Quantity ${qty}`}>
                {qty}
              </span>
            </span>
            <span>
              <strong>{p.name}</strong>
              <small>
                {p.lengthInches}" · {p.lace} lace
              </small>
            </span>
            <span className="summary-line__price">{formatPrice(total)}</span>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <div>
          <dt>
            Subtotal ({t.count} {t.count === 1 ? 'item' : 'items'})
          </dt>
          <dd>{formatPrice(t.subtotal)}</dd>
        </div>
        <div>
          <dt>{fulfilmentLabel(fulfilment)}</dt>
          <dd>{fee === 0 ? 'Free' : formatPrice(fee)}</dd>
        </div>
        <div className="totals__grand">
          <dt>Total</dt>
          <dd>{formatPrice(t.total)}</dd>
        </div>
      </dl>
      {showFreeHint && (
        <p className="summary__hint">Add {formatPrice(t.freeDeliveryGap)} more to get free standard delivery.</p>
      )}
    </div>
  );
}
