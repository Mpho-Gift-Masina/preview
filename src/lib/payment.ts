/**
 * Payment gateway front end.
 *
 * `processPayment` is a mock so the full checkout can be tried today.
 *
 * ============================================================================
 * PAYFAST: INTEGRATION GUIDE (search the project for "PAYFAST:" to find every spot)
 * ============================================================================
 * PayFast hosts the payment page itself (card, Instant EFT, SnapScan, etc.),
 * so the site never touches card details. You need a small backend
 * (e.g. Vercel/Netlify functions, Firebase, or any Node/PHP server) because the
 * signature and the payment confirmation MUST NOT run in the browser.
 *
 * 1. BACKEND: "create payment" endpoint (e.g. POST /api/payfast/create)
 *    - Receives the OrderPayload below and re-calculates the total on the server
 *      from your own prices (never trust the amount sent by the browser).
 *    - Saves the order as "pending" with m_payment_id = orderNumber.
 *    - Builds the PayFast fields: merchant_id, merchant_key, return_url,
 *      cancel_url, notify_url, name_first, name_last, email_address,
 *      cell_number, m_payment_id, amount (RANDS with 2 decimals, e.g. "849.00",
 *      NOT cents), item_name.
 *    - Creates the `signature`: MD5 of the URL-encoded fields (in PayFast's
 *      documented order) + "&passphrase=YOUR_PASSPHRASE". The passphrase lives
 *      only in server environment variables.
 *    - Returns either the signed fields (redirect method) or, for Onsite
 *      Payments, POSTs them to https://www.payfast.co.za/onsite/process and
 *      returns the `uuid` it gets back.
 *
 * 2. FRONTEND (this file → processPayment below)
 *    - Redirect method: build a hidden <form method="POST"> with the signed
 *      fields and submit it to:
 *        live:    https://www.payfast.co.za/eng/process
 *        sandbox: https://sandbox.payfast.co.za/eng/process
 *    - Onsite (popup) method: load https://www.payfast.co.za/onsite/engine.js
 *      once, then call window.payfast_do_onsite_payment({ uuid }, (ok) => ...).
 *
 * 3. BACKEND: ITN webhook (notify_url, e.g. POST /api/payfast/notify)
 *    - PayFast calls this server-to-server when the payment completes.
 *    - Verify the signature, check the amount matches the saved order, and
 *      confirm with PayFast's validate endpoint (/eng/query/validate).
 *    - Only THEN mark the order "paid" and send the confirmation email.
 *      The browser returning to return_url is NOT proof of payment.
 *
 * 4. RETURN / CANCEL pages: see src/hooks/useRoute.ts and Checkout.tsx.
 *
 * Sandbox testing: create a free sandbox account at https://sandbox.payfast.co.za
 * and use its merchant_id / merchant_key / passphrase while testing.
 */
import { CURRENCY } from '../config';
import type { Fulfilment } from '../cart/pricing';

export interface CardDetails {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

export type PaymentInput =
  | { method: 'card'; card: CardDetails }
  | { method: 'eft'; bank: string };

// PAYFAST: this is what the browser sends to your backend's "create payment" endpoint (step 1 above).
export interface OrderPayload {
  /** PAYFAST: send as `m_payment_id`, so the ITN webhook can find the order again. */
  orderNumber: string;
  /** PAYFAST: PayFast wants RANDS, so send (amountCents / 100).toFixed(2), e.g. "849.00". Re-check it on the server. */
  amountCents: number;
  currency: typeof CURRENCY;
  items: { id: string; qty: number; unitPrice: number }[];
  fulfilment: Fulfilment;
  customer: { name: string; email: string; phone: string };
}

export type PaymentResult = { ok: true; reference: string } | { ok: false; message: string };

export const BANKS = ['Absa', 'African Bank', 'Capitec', 'Discovery Bank', 'FNB', 'Investec', 'Nedbank', 'Standard Bank', 'TymeBank'];

/** Test card that the mock gateway always declines. Any other valid card succeeds. */
const DECLINE_TEST_CARD = '4000000000000002';

/*
 * PAYFAST: REPLACE THE BODY OF processPayment WITH THE REAL INTEGRATION.
 * Everything inside it today is the mock (fake delay, test decline card).
 *
 * Redirect method, roughly:
 *
 *   const res = await fetch('/api/payfast/create', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(order),
 *   });
 *   if (!res.ok) return { ok: false, message: 'We could not start your payment. Please try again.' };
 *   const { action, fields } = await res.json(); // action = PayFast process URL, fields = signed fields
 *   const form = document.createElement('form');
 *   form.method = 'POST';
 *   form.action = action;
 *   for (const [name, value] of Object.entries(fields)) {
 *     const input = document.createElement('input');
 *     input.type = 'hidden';
 *     input.name = name;
 *     input.value = String(value);
 *     form.appendChild(input);
 *   }
 *   document.body.appendChild(form);
 *   form.submit(); // the customer leaves the site and pays on PayFast
 *   return new Promise(() => {}); // never resolves: the page is navigating away
 *
 * Onsite (popup) method: fetch the `uuid` from your backend instead, then
 *   window.payfast_do_onsite_payment({ uuid }, (paid: boolean) => ...)
 * and resolve { ok: paid, ... } from the callback. Still wait for the ITN
 * before treating the order as paid on your side.
 *
 * With PayFast, the `input` argument (card / bank from PaymentForm) is no
 * longer needed: PayFast's own page asks for those details.
 */
export async function processPayment(order: OrderPayload, input: PaymentInput): Promise<PaymentResult> {
  // PAYFAST: mock starts here. Delete from this line to the end of the function.
  await new Promise((r) => setTimeout(r, 1600));
  if (input.method === 'card' && input.card.number.replace(/\D/g, '') === DECLINE_TEST_CARD) {
    return { ok: false, message: 'Your card was declined. Try another card or pay with Instant EFT.' };
  }
  return { ok: true, reference: `PAY-${order.orderNumber}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
}

/** Short, readable order number based on the current time, e.g. "CUT-MDUATS". */
export function newOrderNumber(): string {
  return `CUT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

/* ---------- Card helpers ---------- */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

/** Guesses the card network from its first digits (4 = Visa, 51–55/22–27 = Mastercard, 34/37 = Amex). */
export function cardBrand(value: string): CardBrand {
  const n = value.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

const cardLength = (brand: CardBrand) => (brand === 'amex' ? 15 : 16);

/** Groups digits as the customer types: 4-4-4-4, or 4-6-5 for Amex. */
export function formatCardNumber(value: string): string {
  const brand = cardBrand(value);
  const digits = value.replace(/\D/g, '').slice(0, cardLength(brand));
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const parts: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  return parts.join(' ');
}

/** Adds the slash as the customer types the expiry: "1230" → "12/30". */
export function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Luhn checksum: catches most typos in a card number before it's sent anywhere. */
function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

/** Checks an "MM/YY" expiry: valid format, and not already past. */
function expiryState(value: string): 'ok' | 'expired' | 'invalid' {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!m) return 'invalid';
  // Cards are valid until the last day of their expiry month.
  const endOfMonth = new Date(2000 + Number(m[2]), Number(m[1]), 1);
  return endOfMonth > new Date() ? 'ok' : 'expired';
}

export type CardErrors = Partial<Record<keyof CardDetails, string>>;

/** Checks every card field and returns a friendly message for each problem (empty object = all good). */
export function validateCard(c: CardDetails): CardErrors {
  const e: CardErrors = {};
  const digits = c.number.replace(/\D/g, '');
  const brand = cardBrand(digits);

  if (!c.name.trim()) e.name = 'Enter the name on your card.';

  if (!digits) e.number = 'Enter your card number.';
  else if (brand === 'unknown') e.number = 'We accept Visa, Mastercard and American Express.';
  else if (digits.length !== cardLength(brand) || !luhn(digits)) e.number = 'Check your card number.';

  const exp = expiryState(c.expiry);
  if (exp === 'invalid') e.expiry = 'Enter the expiry date as MM/YY.';
  else if (exp === 'expired') e.expiry = 'This card has expired.';

  const cvcLength = brand === 'amex' ? 4 : 3;
  if (!new RegExp(`^\\d{${cvcLength}}$`).test(c.cvc)) {
    e.cvc = brand === 'amex' ? 'Enter the 4-digit code on the front of your card.' : 'Enter the 3-digit code on the back of your card.';
  }
  return e;
}
