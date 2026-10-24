import { useState, type FormEvent } from 'react';
import { formatPrice } from '../data/products';
import type { CardDetails, CardErrors, PaymentInput } from '../lib/payment';
import { BANKS, cardBrand, formatCardNumber, formatExpiry, validateCard } from '../lib/payment';
import { Field, errorProps } from './Field';
import { Icon } from './Icon';

type Method = PaymentInput['method'];
type Errors = CardErrors & { bank?: string };

const brandLabel = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', unknown: '' } as const;

interface Props {
  amount: number;
  busy: boolean;
  error: string | null;
  onPay: (input: PaymentInput) => void;
  onBack: () => void;
}

/** Payment step: choose card or Instant EFT, enter details, then Pay. */
export function PaymentForm({ amount, busy, error, onPay, onBack }: Props) {
  const [method, setMethod] = useState<Method>('card');
  const [card, setCard] = useState<CardDetails>({ name: '', number: '', expiry: '', cvc: '' });
  const [bank, setBank] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const brand = cardBrand(card.number);

  function setField(key: keyof CardDetails, value: string) {
    setCard((c) => ({ ...c, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // PAYFAST: once PayFast is live, this whole form can shrink to the "Pay" button.
  // PayFast's own page asks for card or Instant EFT details, so the card fields,
  // the bank picker and validateCard() below are no longer needed. Just call onPay().
  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: Errors = method === 'card' ? validateCard(card) : bank ? {} : { bank: 'Choose your bank.' };
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`pay-${first}`)?.focus();
      return;
    }
    onPay(method === 'card' ? { method, card } : { method, bank });
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* PAYFAST: replace these two fieldsets (method choice + card/bank details) with a short note
          such as "You'll be taken to PayFast to pay securely by card, Instant EFT and more."
          Never collect card numbers on this site once PayFast is connected. */}
      <fieldset className="co-section" disabled={busy}>
        <legend>Payment method</legend>
        <div className="choices">
          <label className={`choice ${method === 'card' ? 'is-checked' : ''}`}>
            <input type="radio" name="pay-method" checked={method === 'card'} onChange={() => setMethod('card')} />
            <Icon name="card" size={22} />
            <span>
              <strong>Card</strong>
              <small>Visa, Mastercard, Amex</small>
            </span>
          </label>
          <label className={`choice ${method === 'eft' ? 'is-checked' : ''}`}>
            <input type="radio" name="pay-method" checked={method === 'eft'} onChange={() => setMethod('eft')} />
            <Icon name="bank" size={22} />
            <span>
              <strong>Instant EFT</strong>
              <small>Pay from your bank app</small>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="co-section" disabled={busy}>
        <legend>{method === 'card' ? 'Card details' : 'Your bank'}</legend>
        {method === 'card' ? (
          <div className="form-grid">
            <Field id="pay-name" label="Name on card" error={errors.name}>
              <input
                id="pay-name"
                className="input"
                autoComplete="cc-name"
                value={card.name}
                onChange={(e) => setField('name', e.target.value)}
                {...errorProps('pay-name', errors.name)}
              />
            </Field>
            <Field id="pay-number" label="Card number" error={errors.number}>
              <div className="input-wrap">
                <input
                  id="pay-number"
                  className="input"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => setField('number', formatCardNumber(e.target.value))}
                  {...errorProps('pay-number', errors.number)}
                />
                {brand !== 'unknown' && <span className="input-wrap__badge">{brandLabel[brand]}</span>}
              </div>
            </Field>
            <Field id="pay-expiry" label="Expiry" error={errors.expiry} half>
              <input
                id="pay-expiry"
                className="input"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setField('expiry', formatExpiry(e.target.value))}
                {...errorProps('pay-expiry', errors.expiry)}
              />
            </Field>
            <Field id="pay-cvc" label="Security code" error={errors.cvc} half>
              <input
                id="pay-cvc"
                className="input"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={brand === 'amex' ? '4 digits' : '3 digits'}
                value={card.cvc}
                onChange={(e) => setField('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                {...errorProps('pay-cvc', errors.cvc)}
              />
            </Field>
          </div>
        ) : (
          <div className="form-grid">
            <Field id="pay-bank" label="Bank" error={errors.bank}>
              <select
                id="pay-bank"
                className="input"
                value={bank}
                onChange={(e) => {
                  setBank(e.target.value);
                  setErrors({});
                }}
                {...errorProps('pay-bank', errors.bank)}
              >
                <option value="">Choose your bank</option>
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <p className="field field__note">You'll approve the payment in your banking app. Your order is confirmed as soon as it clears.</p>
          </div>
        )}
      </fieldset>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {/* PAYFAST: with the redirect method, relabel the busy text to "Taking you to PayFast…"
          and the button to "Pay {amount} with PayFast". */}
      <div className="co-actions">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={busy}>
          Back
        </button>
        <button type="submit" className="btn btn--primary btn--lg" disabled={busy} aria-live="polite">
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Processing payment…
            </>
          ) : (
            <>
              <Icon name="lock" size={18} /> Pay {formatPrice(amount)}
            </>
          )}
        </button>
      </div>
      <p className="co-secure">
        <Icon name="lock" size={14} /> Payments are processed by our payment provider. We never see or store your card details.
      </p>
    </form>
  );
}
