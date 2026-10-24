import { useEffect, useRef, useState } from 'react';
import type { Product } from '../data/products';
import { formatPrice } from '../data/products';
import { whatsappLink } from '../config';
import { orderMessage } from './ProductCard';
import { Icon } from './Icon';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductDialog({ product, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (product && !dlg.open) {
      setActive(0);
      dlg.showModal();
    } else if (!product && dlg.open) {
      dlg.close();
    }
  }, [product]);

  return (
    <dialog
      ref={ref}
      className="dialog glass"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {product && (
        <div className="dialog__inner">
          <div className="dialog__gallery">
            <img
              key={product.images[active]}
              src={product.images[active]}
              alt={`${product.name}, photo ${active + 1} of ${product.images.length}`}
              width={450}
              height={600}
            />
            {product.images.length > 1 && (
              <div className="dialog__thumbs" role="group" aria-label="Photos">
                {product.images.map((src, i) => (
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
            <button className="dialog__close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={22} />
            </button>
            <p className="eyebrow">Unit</p>
            <h2 id="dialog-title">{product.name}</h2>
            <p className="dialog__price">{formatPrice(product.price)}</p>
            <p>{product.description}</p>
            <dl className="dialog__specs">
              <div><dt>Length</dt><dd>{product.lengthInches} inches</dd></div>
              <div><dt>Lace</dt><dd>{product.lace} transparent frontal</dd></div>
              <div><dt>Colour</dt><dd>{product.colour}</dd></div>
              <div><dt>Texture</dt><dd>{product.texture}</dd></div>
            </dl>
            <a className="btn btn--primary btn--lg" href={whatsappLink(orderMessage(product))} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={18} /> Order {product.name} on WhatsApp
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
