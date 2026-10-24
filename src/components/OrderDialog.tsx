import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { formatPrice, products } from '../data/products';
import { WEB3FORMS_ENDPOINT, WEB3FORMS_KEY } from '../config';
import { Icon } from './Icon';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface Props {
  /** `undefined` = closed, `''` = open with no unit chosen, otherwise a product id. */
  productId: string | undefined;
  onClose: () => void;
}

export function OrderDialog({ productId, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('');
  // Bumped on every open so the form remounts with empty fields.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (productId !== undefined && !dlg.open) {
      setUnit(productId);
      setStatus('idle');
      setError('');
      setFormKey((k) => k + 1);
      dlg.showModal();
    } else if (productId === undefined && dlg.open) {
      dlg.close();
    }
  }, [productId]);

  useEffect(() => {
    if (status === 'error') errorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [status, error]);

  const selected = products.find((p) => p.id === unit);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    if (!WEB3FORMS_KEY) {
      setStatus('error');
      setError('Online ordering is not set up yet. Please try again later.');
      return;
    }

    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const product = products.find((p) => p.id === data.unit);
    const unitLabel = product
      ? `${product.name} (${product.lengthInches}", ${product.lace} lace, ${product.colour}, ${formatPrice(product.price)})`
      : data.unit;

    setStatus('sending');
    setError('');
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New order: ${product?.name ?? 'Cutesify unit'} from ${data.name}`,
          from_name: 'Cutesify website',
          replyto: data.email,
          botcheck: data.botcheck,
          Unit: unitLabel,
          Name: data.name,
          Email: data.email,
          Phone: data.phone,
          'Delivery address': data.address,
          Notes: data.notes || '-',
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || `Request failed (${res.status})`);
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('We could not send your order. Check your connection and try again.');
    }
  }

  return (
    <dialog
      ref={ref}
      className="dialog dialog--order glass"
      aria-labelledby="order-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="order">
        <button className="dialog__close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={22} />
        </button>

        {status === 'sent' ? (
          <div className="order__done" role="status">
            <span className="feature__icon">
              <Icon name="check" size={26} />
            </span>
            <h2 id="order-title">Order received</h2>
            <p>
              Thank you! We've received your order{selected ? ` for ${selected.name}` : ''} and will email you
              to confirm availability, payment and delivery.
            </p>
            <button className="btn btn--primary btn--lg" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Place an order</p>
            <h2 id="order-title">{selected ? `Order ${selected.name}` : 'Order a unit'}</h2>
            <p className="order__lede">
              No payment is taken here. We'll email you to confirm availability, payment and delivery.
            </p>

            <form key={formKey} className="order__form" onSubmit={onSubmit} noValidate>
              <div className="field field--full">
                <label htmlFor="o-unit">Unit</label>
                <select id="o-unit" name="unit" required value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="" disabled>
                    Choose a unit
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}: {p.lengthInches}", {p.lace}, {formatPrice(p.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="o-name">Full name</label>
                <input id="o-name" name="name" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="o-phone">Phone number</label>
                <input id="o-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
              </div>
              <div className="field field--full">
                <label htmlFor="o-email">Email</label>
                <input id="o-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field field--full">
                <label htmlFor="o-address">Delivery address</label>
                <textarea id="o-address" name="address" rows={2} autoComplete="street-address" required />
              </div>
              <div className="field field--full">
                <label htmlFor="o-notes">
                  Notes <span className="field__hint">(optional)</span>
                </label>
                <textarea id="o-notes" name="notes" rows={2} />
              </div>
              {/* Spam trap: hidden from people, filled in by bots. */}
              <input type="checkbox" name="botcheck" className="visually-hidden" tabIndex={-1} aria-hidden="true" />

              {status === 'error' && (
                <p ref={errorRef} className="order__error field--full" role="alert">
                  {error}
                </p>
              )}

              <button className="btn btn--primary btn--lg field--full" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : (
                  <>
                    <Icon name="mail" size={18} /> Send order
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
