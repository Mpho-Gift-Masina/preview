/** Store settings: edit these to change fees, collection points and limits. */

export const CURRENCY = 'ZAR';

/*
 * PAYFAST: front-end settings go here once you integrate, e.g.
 *
 *   export const PAYFAST = {
 *     sandbox: true, // false when you go live
 *     processUrl: 'https://sandbox.payfast.co.za/eng/process', // live: https://www.payfast.co.za/eng/process
 *     createPaymentEndpoint: '/api/payfast/create', // your backend
 *   };
 *
 * Do NOT put the passphrase here: anything in this file is visible to every visitor.
 * merchant_id, merchant_key and passphrase belong in your backend's environment variables.
 */

/** Most units a customer can add of a single product. */
export const MAX_QTY = 5;

/** `sameDay` is only offered when the delivery address is in Soweto (see SAME_DAY below). */
export type DeliverySpeed = 'sameDay' | 'standard' | 'express';

interface DeliveryRate {
  label: string;
  eta: string;
  /** Fee for provinces listed in `localProvinces`. */
  local: number;
  /** Fee for everywhere else in South Africa. */
  national: number;
}

export const DELIVERY: {
  /** Orders at or above this subtotal get free standard delivery. */
  freeThreshold: number;
  localProvinces: string[];
  speeds: Record<DeliverySpeed, DeliveryRate>;
} = {
  freeThreshold: 1500,
  localProvinces: ['Gauteng'],
  speeds: {
    // TODO: confirm the same-day fee (placeholder: same as Gauteng standard). Soweto is in Gauteng, so `local` applies.
    sameDay: { label: 'Same-day delivery', eta: 'Delivered today, Soweto only', local: 99, national: 99 },
    standard: { label: 'Standard courier', eta: '2–4 business days', local: 99, national: 149 },
    express: { label: 'Express courier', eta: 'Next business day, main centres', local: 189, national: 259 },
  },
};

/** Same-day delivery: only for addresses in Soweto. */
export const SAME_DAY = {
  /** Shown everywhere the offer is mentioned. */
  area: 'Soweto',
  /**
   * Optional cut-off, e.g. '12:00'. Leave null for no cut-off.
   * TODO: set this if same-day only applies to orders placed before a certain time.
   */
  cutoff: null as string | null,
  /**
   * An address qualifies when its suburb or city contains any of these words (not case sensitive).
   * Add any Soweto areas your customers use that are missing.
   */
  areas: [
    'soweto',
    'orlando',
    'diepkloof',
    'meadowlands',
    'dobsonville',
    'protea glen',
    'protea north',
    'protea south',
    'pimville',
    'jabavu',
    'jabulani',
    'naledi',
    'zola',
    'zondi',
    'mofolo',
    'dube',
    'kliptown',
    'klipspruit',
    'chiawelo',
    'emdeni',
    'molapo',
    'moroka',
    'tladi',
    'senaoane',
    'phiri',
    'mapetla',
    'rockville',
    'dlamini',
    'mmesi park',
    'braamfischerville',
    'snake park',
    'lufhereng',
    'power park',
    'thulani',
  ],
  /** Soweto's province; addresses in other provinces never qualify, even if a suburb name matches. */
  province: 'Gauteng',
};

export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  hours: string;
  fee: number;
}

/** TODO: replace with the real collection address(es). */
export const COLLECTION_POINTS: CollectionPoint[] = [
  {
    id: 'studio',
    name: 'Cutesify studio',
    address: 'Address shared on your order confirmation',
    hours: 'Mon–Sat, 09:00–17:00',
    fee: 0,
  },
];

export const COLLECTION = {
  /** Earliest collection is this many days after ordering. */
  leadDays: 1,
  /** Days of the week we are closed (0 = Sunday). */
  closedWeekdays: [0],
  slots: ['09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00'],
};
