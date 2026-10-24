import type { Product } from '../data/products';
import { formatPrice } from '../data/products';
import { useTilt } from '../hooks/useTilt';
import { useOpenOrder } from '../order';
import { Icon } from './Icon';

interface Props {
  product: Product;
  onOpen: (product: Product) => void;
}

export function ProductCard({ product: p, onOpen }: Props) {
  const tilt = useTilt<HTMLElement>(8);
  const openOrder = useOpenOrder();
  const [front, back] = p.images;

  return (
    <article
      className="product glass"
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={{ ['--tint-a' as string]: p.tint[0], ['--tint-b' as string]: p.tint[1] }}
    >
      <div className="product__media">
        <img src={front} alt={`${p.name}: ${p.colour} wig on a mannequin`} loading="lazy" width={450} height={600} />
        {back && <img className="product__alt" src={back} alt="" loading="lazy" width={450} height={600} />}
        <span className="product__badge glass">{p.lace} lace</span>
        <span className="product__glare" aria-hidden="true" />
      </div>
      <div className="product__body">
        <div className="product__head">
          <h3>{p.name}</h3>
          <p className="product__price">{formatPrice(p.price)}</p>
        </div>
        <ul className="product__specs">
          <li>{p.lengthInches}"</li>
          <li>{p.colour}</li>
          <li>{p.texture}</li>
        </ul>
        <div className="product__actions">
          <button className="btn btn--primary" onClick={() => openOrder(p.id)} aria-label={`Order ${p.name}`}>
            <Icon name="bag" size={18} /> Order
          </button>
          <button className="btn btn--glass" onClick={() => onOpen(p)} aria-label={`View details for ${p.name}`}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
