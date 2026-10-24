/**
 * Payment gateway front end.
 *
 * DEMO MODE: no payment provider is connected yet. `processPayment` only simulates
 * placing an order so the checkout flow can be reviewed. It takes NO payment, asks
 * for NO card or bank details, and sends nothing anywhere.
 *
 * SECURITY NOTE: all prices and totals in the browser can be changed by the visitor.
 * When a real gateway is connected, the server must recalculate every price and the
 * total from its own product list before asking the gateway for payment.
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

/**
 * True while no payment provider is connected. The checkout uses it to label
 * everything as a demo. PAYFAST: set to false only once real payments work end to end.
 */
export const DEMO_MODE = true;

// PAYFAST: this is what the browser sends to your backend's "create payment" endpoint (step 1 above).
export interface OrderPayload {
  /** PAYFAST: send as `m_payment_id`, so the ITN webhook can find the order again. */
  orderNumber: string;
  /** PAYFAST: PayFast wants RANDS, so send (amountCents / 100).toFixed(2), e.g. "849.00". Re-check it on the server. */
  amountCents: number;
  currency: typeof CURRENCY;
  /** PAYFAST: the server must ignore `unitPrice` and look prices up itself. */
  items: { id: string; qty: number; unitPrice: number }[];
  fulfilment: Fulfilment;
  customer: { name: string; email: string; phone: string };
}

/** `demo: true` means the order was only simulated and no money moved. */
export type PaymentResult = { ok: true; demo: boolean } | { ok: false; message: string };

/*
 * PAYFAST: REPLACE THE BODY OF processPayment WITH THE REAL INTEGRATION.
 * Today it only simulates placing an order (a short delay, then success).
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
 * and resolve { ok: paid, demo: false } from the callback. Still wait for the ITN
 * before treating the order as paid on your side.
 */
export async function processPayment(order: OrderPayload): Promise<PaymentResult> {
  // DEMO: nothing is charged or sent. The order details stay in this browser tab only.
  void order;
  await new Promise((r) => setTimeout(r, 1200));
  return { ok: true, demo: DEMO_MODE };
}

/** Short, readable order number based on the current time, e.g. "CUT-MDUATS". PAYFAST: the backend should issue this instead. */
export function newOrderNumber(): string {
  return `CUT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}
