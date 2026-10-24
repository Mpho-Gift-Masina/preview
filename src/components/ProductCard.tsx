import type { Product } from '../data/products';
import { formatPrice } from '../data/products';
import { useTilt } from '../hooks/useTilt';
import { useCart } from '../cart/CartContext';
import { Icon } from './Icon';

interface Props {
  product: Product;
  /** Opens the details popup for this product. */
  onOpen: (product: Product) => void;
}

/** One glass product card: photo (swaps to a second angle on hover), name, price, specs and buttons. */
export function ProductCard({ product: p, onOpen }: Props) {
  // 3D tilt and light glare that follow the mouse.
  const tilt = useTilt<HTMLElement>(8);
  const { add, openCart } = useCart();
  const [front, back] = p.images;

  return (
    <article
      className="product glass"
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={{ ['--tint' as string]: p.tint[1] }}
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
          {/* Add one to the bag, then slide the bag open so the customer sees it. */}
          <button
            className="btn btn--primary"
            onClick={() => {
              add(p.id);
              openCart();
            }}
            aria-label={`Add ${p.name} to bag`}
          >
            <Icon name="bag" size={18} /> Add
          </button>
          <button className="btn btn--glass" onClick={() => onOpen(p)} aria-label={`View details for ${p.name}`}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
