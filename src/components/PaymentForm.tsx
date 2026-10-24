import type { FormEvent } from 'react';
import { formatPrice } from '../data/products';
import { DEMO_MODE } from '../lib/payment';
import { Icon } from './Icon';

interface Props {
  amount: number;
  busy: boolean;
  error: string | null;
  onPay: () => void;
  onBack: () => void;
}

/**
 * Payment step. While DEMO_MODE is on, no payment details are asked for: the customer
 * sees a clear notice that online payment isn't active yet and can place a demo order.
 * PAYFAST: once live, keep this step as-is but relabel the button "Pay {amount} with PayFast";
 * PayFast's own page collects card / Instant EFT details, never this site.
 */
export function PaymentForm({ amount, busy, error, onPay, onBack }: Props) {
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!busy) onPay();
  }

  return (
    <form onSubmit={submit} noValidate>
      <fieldset className="co-section" disabled={busy}>
        <legend>Payment</legend>
        <div className="pay-placeholder">
          {DEMO_MODE && <span className="demo-badge">Demo mode</span>}
          <span className="pay-placeholder__icon" aria-hidden="true">
            <Icon name="lock" size={22} />
          </span>
          <div>
            <p className="pay-placeholder__title">Secure online payment is coming soon</p>
            <p className="pay-placeholder__text">
              Card and Instant EFT payments will be available once our payment provider is activated. Your card or bank
              details will then be entered on the provider's secure page, never on this website.
            </p>
            {DEMO_MODE && (
              <p className="pay-placeholder__text">
                For now you can place a <strong>demo order</strong> to try the checkout. No payment is taken and no order is
                sent to us.
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="co-actions">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={busy}>
          Back
        </button>
        <button type="submit" className="btn btn--primary btn--lg" disabled={busy} aria-live="polite">
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Placing demo order…
            </>
          ) : (
            <>Place demo order · {formatPrice(amount)}</>
          )}
        </button>
      </div>
    </form>
  );
}
