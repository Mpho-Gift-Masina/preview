/*
 * All money maths for the bag and checkout. Prices are whole rands taken from data/products.ts
 * (never from saved bag data), so totals are exact.
 *
 * SECURITY: these totals are for display only. Anything running in the browser can be changed
 * by the visitor, so when a real payment gateway is connected the server must recalculate every
 * price, delivery fee and total itself before charging. Never trust a total sent from the browser.
 */
import type { Product } from '../data/products';
import { products } from '../data/products';
import type { DeliverySpeed } from '../config';
import { COLLECTION_POINTS, DELIVERY, SAME_DAY } from '../config';

export interface CartItem {
  id: string;
  qty: number;
}

export type Fulfilment =
  | { method: 'delivery'; speed: DeliverySpeed; province: string }
  | { method: 'collection'; pointId: string };

export interface CartLine {
  product: Product;
  qty: number;
  total: number;
}

export interface Totals {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Delivery or collection fee; null until the customer chooses one. */
  fulfilmentFee: number | null;
  /** How much more to spend for free standard delivery (0 once it applies). */
  freeDeliveryGap: number;
  total: number;
}

/**
 * True when an address qualifies for same-day delivery: it's in Gauteng and the suburb or city
 * matches one of the Soweto areas in SAME_DAY.areas (e.g. "Soweto", "Orlando East", "Protea Glen").
 */
export function isSameDayArea(suburb: string, city: string, province: string): boolean {
  if (province && province !== SAME_DAY.province) return false;
  const text = `${suburb} ${city}`.toLowerCase();
  return SAME_DAY.areas.some((area) => text.includes(area));
}

/** Delivery-time text for same-day: mentions the cut-off time if one is set in SAME_DAY.cutoff. */
export function sameDayEta(): string {
  return SAME_DAY.cutoff
    ? `Order before ${SAME_DAY.cutoff} for delivery today, ${SAME_DAY.area} only`
    : DELIVERY.speeds.sameDay.eta;
}

/** Courier fee. Before a province is chosen, the national rate is shown. */
export function deliveryFee(subtotal: number, speed: DeliverySpeed, province: string): number {
  if (speed === 'standard' && subtotal >= DELIVERY.freeThreshold) return 0;
  const rate = DELIVERY.speeds[speed];
  return DELIVERY.localProvinces.includes(province) ? rate.local : rate.national;
}

/** Fee for the chosen option: courier rate for delivery, or the collection point's fee. */
export function fulfilmentFee(subtotal: number, f: Fulfilment): number {
  if (f.method === 'delivery') return deliveryFee(subtotal, f.speed, f.province);
  return COLLECTION_POINTS.find((p) => p.id === f.pointId)?.fee ?? 0;
}

/** All the money maths for the bag and checkout: line totals, item count, subtotal, fee and grand total. */
export function calcTotals(items: CartItem[], fulfilment: Fulfilment | null = null): Totals {
  // Look up each bag item's product; skip any that no longer exist.
  const lines = items.flatMap((i) => {
    const product = products.find((p) => p.id === i.id);
    return product ? [{ product, qty: i.qty, total: product.price * i.qty }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const fee = fulfilment && lines.length ? fulfilmentFee(subtotal, fulfilment) : null;

  return {
    lines,
    count,
    subtotal,
    fulfilmentFee: fee,
    freeDeliveryGap: Math.max(0, DELIVERY.freeThreshold - subtotal),
    total: subtotal + (fee ?? 0),
  };
}
