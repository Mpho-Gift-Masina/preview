import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../cart/CartContext';
import type { Fulfilment, Totals } from '../cart/pricing';
import { calcTotals, deliveryFee, isSameDayArea, sameDayEta } from '../cart/pricing';
import type { DeliverySpeed } from '../config';
import { COLLECTION, COLLECTION_POINTS, DELIVERY, PROVINCES, SAME_DAY } from '../config';
import { formatPrice } from '../data/products';
import { earliestCollectionDate, formatDate, isClosed } from '../lib/dates';
import { DEMO_MODE, newOrderNumber, processPayment } from '../lib/payment';
import { Field, errorProps } from './Field';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { ease } from './motion';
import { OrderSummary, fulfilmentLabel } from './OrderSummary';
import { PaymentForm } from './PaymentForm';
import { POLICIES_HREF } from '../hooks/useRoute';

type Step = 'details' | 'payment' | 'done';

interface Details {
  name: string;
  email: string;
  phone: string;
  method: Fulfilment['method'];
  speed: DeliverySpeed;
  street: string;
  unit: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  pointId: string;
  date: string;
  slot: string;
  notes: string;
  /** Customer ticked "I accept the store policies". */
  agree: boolean;
}

type TextKey = Exclude<keyof Details, 'method' | 'speed' | 'agree'>;

/** Longest text each field accepts (generous for real addresses, but stops pasted junk). */
const MAX_LENGTH: Record<TextKey, number> = {
  name: 80,
  email: 120,
  phone: 20,
  street: 120,
  unit: 80,
  suburb: 80,
  city: 80,
  province: 40,
  postalCode: 4,
  pointId: 40,
  date: 10,
  slot: 20,
  notes: 500,
};
type Errors = Partial<Record<keyof Details, string>>;

interface Receipt {
  orderNumber: string;
  /** True when the order was only simulated (no payment provider connected). */
  demo: boolean;
  totals: Totals;
  fulfilment: Fulfilment;
  details: Details;
}

/** Empty checkout form: delivery and standard courier selected by default. */
const initialDetails: Details = {
  name: '',
  email: '',
  phone: '',
  method: 'delivery',
  speed: 'standard',
  street: '',
  unit: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
  pointId: COLLECTION_POINTS[0].id,
  date: '',
  slot: COLLECTION.slots[0],
  notes: '',
  agree: false,
};

/** The three steps shown in the progress bar at the top of checkout. */
const steps: { id: Step; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
  { id: 'done', label: DEMO_MODE ? 'Demo order' : 'Confirmed' },
];

/** Picks out just the delivery-or-collection choice from the form, for the price maths. */
function toFulfilment(d: Details): Fulfilment {
  return d.method === 'delivery'
    ? { method: 'delivery', speed: d.speed, province: d.province }
    : { method: 'collection', pointId: d.pointId };
}

/** Checks the details step and returns a message for every field that needs fixing. */
function validate(d: Details): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = 'Enter a valid email address.';
  if (!/^(\+27|0)\d{9}$/.test(d.phone.replace(/[\s()-]/g, ''))) e.phone = 'Enter a South African number, e.g. 082 123 4567.';

  if (d.method === 'delivery') {
    if (!d.street.trim()) e.street = 'Enter your street address.';
    if (!d.suburb.trim()) e.suburb = 'Enter your suburb.';
    if (!d.city.trim()) e.city = 'Enter your city or town.';
    if (!PROVINCES.includes(d.province)) e.province = 'Choose your province.';
    if (!/^\d{4}$/.test(d.postalCode.trim())) e.postalCode = 'Postal codes have 4 digits.';
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) e.date = 'Choose a collection date.';
    else if (d.date < earliestCollectionDate()) e.date = `The earliest collection date is ${formatDate(earliestCollectionDate())}.`;
    else if (isClosed(d.date)) e.date = "We're closed that day. Please choose another date.";
    // The pickers only offer valid options; these checks catch a tampered form.
    if (!COLLECTION_POINTS.some((p) => p.id === d.pointId)) e.pointId = 'Choose a collection point.';
    if (!COLLECTION.slots.includes(d.slot)) e.slot = 'Choose a collection time.';
  }
  if (!d.agree) e.agree = 'Please confirm you have read and accept our store policies.';
  return e;
}

/** Checkout modal: details (contact + delivery or collection) → payment → confirmation, with the order summary alongside. */
export function Checkout() {
  const { items, panel, closePanel, openCart, clear } = useCart();
  const [step, setStep] = useState<Step>('details');
  const [details, setDetails] = useState<Details>(initialDetails);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Same-day delivery is offered only while the address is in Soweto.
  const sameDayAvailable = isSameDayArea(details.suburb, details.city, details.province);
  const speeds = (Object.keys(DELIVERY.speeds) as DeliverySpeed[]).filter((s) => s !== 'sameDay' || sameDayAvailable);

  // If the address changes to outside Soweto, fall back from same-day to standard courier.
  useEffect(() => {
    if (!sameDayAvailable && details.speed === 'sameDay') setDetails((d) => ({ ...d, speed: 'standard' }));
  }, [sameDayAvailable, details.speed]);

  const fulfilment = toFulfilment(details);
  const totals = calcTotals(items, fulfilment);

  function handleClose() {
    if (!busy) closePanel();
  }

  // Reset only once the closing animation has finished, so the content doesn't swap mid-fade.
  function handleExited() {
    setPayError(null);
    if (step === 'done') {
      setStep('details');
      setReceipt(null);
    }
  }

  function update(key: keyof Details, value: string) {
    setDetails((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Wires an input to the form state, its error message and its length limit.
  const bind = (key: TextKey) => ({
    id: `co-${key}`,
    name: key,
    value: details[key],
    maxLength: MAX_LENGTH[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(key, e.target.value),
    ...errorProps(`co-${key}`, errors[key]),
  });

  function submitDetails(e: FormEvent) {
    e.preventDefault();
    const errs = validate(details);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setStep('payment');
  }

  async function handlePay() {
    setBusy(true);
    setPayError(null);
    // PAYFAST: let your backend create the order number instead (it saves the "pending"
    // order and returns the number), so it can't clash and the ITN webhook can match it.
    const orderNumber = newOrderNumber();
    let result;
    try {
      // PAYFAST: this payload goes to your backend "create payment" endpoint.
      // See the guide at the top of src/lib/payment.ts. The server must recalculate the prices.
      result = await processPayment({
        orderNumber,
        amountCents: totals.total * 100,
        currency: 'ZAR',
        items: totals.lines.map((l) => ({ id: l.product.id, qty: l.qty, unitPrice: l.product.price })),
        fulfilment,
        customer: { name: details.name.trim(), email: details.email.trim(), phone: details.phone.trim() },
      });
    } catch {
      // Never show technical error details to customers.
      result = { ok: false as const, message: 'Something went wrong while placing your order. Please try again.' };
    }
    setBusy(false);
    if (!result.ok) {
      setPayError(result.message);
      return;
    }
    // PAYFAST: with the redirect method the code below never runs here: the customer
    // leaves for PayFast and comes back to your return_url. Move this "success" handling
    // to the return page (see src/hooks/useRoute.ts): read the order number from the URL,
    // fetch the order status from your backend (paid once the ITN has arrived), then show
    // the confirmation and call clear(). Before redirecting, save `details` and `totals`
    // (e.g. in sessionStorage) so the confirmation can show them after the customer returns.
    setReceipt({ orderNumber, demo: result.demo, totals, fulfilment, details });
    clear();
    setStep('done');
  }

  const stepIndex = steps.findIndex((s) => s.id === step);
  const summary = receipt ?? { totals, fulfilment };
  const isEmpty = totals.lines.length === 0 && !receipt;

  return (
    <Modal
      open={panel === 'checkout'}
      onClose={handleClose}
      onExitComplete={handleExited}
      dismissible={!busy}
      labelledBy="checkout-title"
      className="checkout"
    >
      <div className="checkout__inner">
        <div className="checkout__main">
          <button className="icon-btn checkout__close" onClick={handleClose} aria-label="Close checkout" disabled={busy}>
            <Icon name="close" size={20} />
          </button>

          <ol className="progress" aria-label="Checkout progress">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className={i === stepIndex ? 'is-current' : i < stepIndex ? 'is-complete' : ''}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                <span>{i < stepIndex ? <Icon name="check" size={13} /> : `0${i + 1}`}</span>
                {s.label}
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isEmpty ? 'empty' : step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.55, ease }}
            >
          {isEmpty ? (
            <div className="done">
              <StepTitle>Your bag is empty</StepTitle>
              <a className="btn btn--primary" href="#collection" onClick={handleClose}>
                Shop the collection
              </a>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={submitDetails} noValidate>
              <StepTitle>Checkout</StepTitle>

              <fieldset className="co-section">
                <legend>Contact</legend>
                <div className="form-grid">
                  <Field id="co-name" label="Full name" error={errors.name}>
                    <input className="input" autoComplete="name" {...bind('name')} />
                  </Field>
                  <Field id="co-email" label="Email" error={errors.email} half>
                    <input className="input" type="email" autoComplete="email" {...bind('email')} />
                  </Field>
                  <Field id="co-phone" label="Cellphone" error={errors.phone} half>
                    <input className="input" type="tel" autoComplete="tel" placeholder="082 123 4567" {...bind('phone')} />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="co-section">
                <legend>How would you like to get your order?</legend>
                <div className="choices">
                  <label className={`choice ${details.method === 'delivery' ? 'is-checked' : ''}`}>
                    <input type="radio" name="method" checked={details.method === 'delivery'} onChange={() => update('method', 'delivery')} />
                    <Icon name="truck" size={22} />
                    <span>
                      <strong>Delivery</strong>
                      <small>
                        From {formatPrice(DELIVERY.speeds.standard.local)} · free over {formatPrice(DELIVERY.freeThreshold)} · same day
                        in {SAME_DAY.area}
                      </small>
                    </span>
                  </label>
                  <label className={`choice ${details.method === 'collection' ? 'is-checked' : ''}`}>
                    <input type="radio" name="method" checked={details.method === 'collection'} onChange={() => update('method', 'collection')} />
                    <Icon name="store" size={22} />
                    <span>
                      <strong>Collection</strong>
                      <small>Free · choose a date and time</small>
                    </span>
                  </label>
                </div>
              </fieldset>

              {details.method === 'delivery' ? (
                <>
                  <fieldset className="co-section">
                    <legend>Delivery address</legend>
                    <div className="form-grid">
                      <Field id="co-street" label="Street address" error={errors.street}>
                        <input className="input" autoComplete="address-line1" {...bind('street')} />
                      </Field>
                      <Field id="co-unit" label="Apartment, complex or unit" optional>
                        <input className="input" autoComplete="address-line2" {...bind('unit')} />
                      </Field>
                      <Field id="co-suburb" label="Suburb" error={errors.suburb} half>
                        <input className="input" autoComplete="address-level3" {...bind('suburb')} />
                      </Field>
                      <Field id="co-city" label="City or town" error={errors.city} half>
                        <input className="input" autoComplete="address-level2" {...bind('city')} />
                      </Field>
                      <Field id="co-province" label="Province" error={errors.province} half>
                        <select className="input" autoComplete="address-level1" {...bind('province')}>
                          <option value="">Choose province</option>
                          {PROVINCES.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </Field>
                      <Field id="co-postalCode" label="Postal code" error={errors.postalCode} half>
                        <input className="input" inputMode="numeric" autoComplete="postal-code" {...bind('postalCode')} />
                      </Field>
                    </div>
                  </fieldset>

                  <fieldset className="co-section">
                    <legend>Delivery speed</legend>
                    <div className="choices choices--stack">
                      {/* Same-day only appears once the address is in Soweto. */}
                      {speeds.map((speed) => {
                        const rate = DELIVERY.speeds[speed];
                        const fee = deliveryFee(totals.subtotal, speed, details.province);
                        return (
                          <label
                            key={speed}
                            className={`choice ${details.speed === speed ? 'is-checked' : ''} ${speed === 'sameDay' ? 'choice--highlight' : ''}`}
                          >
                            <input type="radio" name="speed" checked={details.speed === speed} onChange={() => update('speed', speed)} />
                            <span>
                              <strong>
                                {rate.label}
                                {speed === 'sameDay' && <span className="choice__tag">{SAME_DAY.area}</span>}
                              </strong>
                              <small>{speed === 'sameDay' ? sameDayEta() : rate.eta}</small>
                            </span>
                            <span className="choice__price">{fee === 0 ? 'Free' : formatPrice(fee)}</span>
                          </label>
                        );
                      })}
                    </div>
                    {sameDayAvailable ? (
                      <p className="field__note">Good news: you're in {SAME_DAY.area}, so we can deliver today.</p>
                    ) : (
                      <p className="field__note">
                        In {SAME_DAY.area}? Enter your suburb (e.g. Orlando, Diepkloof, Protea Glen) to unlock same-day delivery.
                        {!details.province && ' Choose your province for the exact rate; Gauteng deliveries cost less.'}
                      </p>
                    )}
                  </fieldset>
                </>
              ) : (
                <fieldset className="co-section">
                  <legend>Collection</legend>
                  <div className="choices choices--stack">
                    {COLLECTION_POINTS.map((p) => (
                      <label key={p.id} className={`choice ${details.pointId === p.id ? 'is-checked' : ''}`}>
                        <input type="radio" name="pointId" checked={details.pointId === p.id} onChange={() => update('pointId', p.id)} />
                        <Icon name="store" size={22} />
                        <span>
                          <strong>{p.name}</strong>
                          <small>
                            {p.address} · {p.hours}
                          </small>
                        </span>
                        <span className="choice__price">{p.fee === 0 ? 'Free' : formatPrice(p.fee)}</span>
                      </label>
                    ))}
                  </div>
                  <div className="form-grid form-grid--spaced">
                    <Field id="co-date" label="Collection date" error={errors.date} half>
                      <input className="input" type="date" min={earliestCollectionDate()} {...bind('date')} />
                    </Field>
                    <Field id="co-slot" label="Time" half>
                      <select className="input" {...bind('slot')}>
                        {COLLECTION.slots.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <p className="field__note">Bring your order number and ID when you collect. Closed on Sundays.</p>
                </fieldset>
              )}

              <fieldset className="co-section">
                <legend className="sr-only">Notes</legend>
                <div className="form-grid">
                  <Field id="co-notes" label="Order notes" optional>
                    <textarea className="input" rows={3} placeholder="Anything we should know?" {...bind('notes')} />
                  </Field>
                </div>
              </fieldset>

              <div className="agree">
                <label className="agree__label">
                  <input
                    type="checkbox"
                    id="co-agree"
                    checked={details.agree}
                    onChange={(e) => {
                      const agree = e.target.checked;
                      setDetails((d) => ({ ...d, agree }));
                      setErrors((er) => ({ ...er, agree: undefined }));
                    }}
                    {...errorProps('co-agree', errors.agree)}
                  />
                  <span>
                    I have read and accept the{' '}
                    <a href={POLICIES_HREF} target="_blank" rel="noreferrer">
                      store policies
                    </a>
                    , including that all sales are final.
                  </span>
                </label>
                {errors.agree && (
                  <p id="co-agree-err" className="field__error">
                    {errors.agree}
                  </p>
                )}
              </div>

              <div className="co-actions">
                <button type="button" className="btn btn--ghost" onClick={openCart}>
                  Back to bag
                </button>
                <button type="submit" className="btn btn--primary btn--lg">
                  Continue to payment <Icon name="arrow" size={18} />
                </button>
              </div>
            </form>
          ) : step === 'payment' ? (
            <>
              <StepTitle>Payment</StepTitle>
              <div className="co-review">
                <div>
                  <span>Contact</span>
                  <p>
                    {details.name} · {details.email}
                  </p>
                </div>
                <div>
                  <span>{fulfilmentLabel(fulfilment)}</span>
                  <p>{fulfilmentDescription(details)}</p>
                </div>
                <button className="link-btn" onClick={() => setStep('details')} disabled={busy}>
                  Change
                </button>
              </div>
              <PaymentForm amount={totals.total} busy={busy} error={payError} onPay={handlePay} onBack={() => setStep('details')} />
            </>
          ) : (
            receipt && (
              <div className="done">
                <motion.span
                  className="done__icon"
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
                >
                  <Icon name="check" size={34} />
                </motion.span>
                {/* Demo orders say plainly that nothing was paid or sent, so no one mistakes them for a real purchase. */}
                {receipt.demo ? (
                  <>
                    <span className="demo-badge">Demo mode</span>
                    <StepTitle>Demo order complete</StepTitle>
                    <p>
                      This was a demonstration only. <strong>No payment was taken</strong> and this order has not been sent to
                      Cutesify. Online ordering will open once secure payments are activated.
                    </p>
                  </>
                ) : (
                  <>
                    <StepTitle>Thank you, {receipt.details.name.split(' ')[0]}!</StepTitle>
                    <p>
                      Your order of <strong>{formatPrice(receipt.totals.total)}</strong> has been placed.
                    </p>
                  </>
                )}
                <dl className="done__facts">
                  <div>
                    <dt>{receipt.demo ? 'Demo order number' : 'Order number'}</dt>
                    <dd>{receipt.orderNumber}</dd>
                  </div>
                  <div>
                    <dt>{fulfilmentLabel(receipt.fulfilment)}</dt>
                    <dd>{fulfilmentDescription(receipt.details)}</dd>
                  </div>
                </dl>
                {!receipt.demo && (
                  <p className="done__note">
                    Keep your order number for your records. We'll contact you on {receipt.details.phone} if we need anything.
                  </p>
                )}
                <button className="btn btn--primary btn--lg" onClick={handleClose}>
                  Back to the shop
                </button>
              </div>
            )
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!isEmpty && (
          <aside className="checkout__aside" aria-label="Order summary">
            <OrderSummary totals={summary.totals} fulfilment={summary.fulfilment} paid={!!receipt} />
          </aside>
        )}
      </div>
    </Modal>
  );
}

/** Step heading that takes focus and scrolls the panel to the top when its step appears. */
function StepTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.closest('.modal')?.scrollTo({ top: 0, behavior: 'smooth' });
    el.focus({ preventScroll: true });
  }, []);
  return (
    <h2 id="checkout-title" ref={ref} tabIndex={-1} className={`checkout__title ${className}`}>
      {children}
    </h2>
  );
}

/** One-line summary of where the order is going, e.g. "1 Main Rd, Rosebank… (2–4 business days)". */
function fulfilmentDescription(d: Details): string {
  if (d.method === 'delivery') {
    const address = [d.street, d.unit, d.suburb, d.city, d.province, d.postalCode].filter((s) => s.trim()).join(', ');
    return `${address} (${d.speed === 'sameDay' ? sameDayEta() : DELIVERY.speeds[d.speed].eta})`;
  }
  const point = COLLECTION_POINTS.find((p) => p.id === d.pointId);
  return `${point?.name ?? 'Collection'}, ${formatDate(d.date)}, ${d.slot}`;
}
