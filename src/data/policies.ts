import type { IconName } from '../components/Icon';
import refundProductExchange from '../../assets/policies-refund-product-exchange.jpeg';
import laceColourShipping from '../../assets/policies-lace-colour-shipping.jpeg';
import cancellationCareResponsibility from '../../assets/policies-cancellation-care-responsibility.jpeg';

export interface Policy {
  id: string;
  icon: IconName;
  title: string;
  body: string[];
}

/** Transcribed from the Cutesify policy graphics (assets/policies-*.jpeg). */
export const policies: Policy[] = [
  {
    id: 'refunds',
    icon: 'shield',
    title: 'Refund policy',
    body: [
      'All sales are final.',
      'Due to hygiene reasons, we do not offer refunds or exchanges. Please make sure you are 100% sure before purchasing.',
    ],
  },
  {
    id: 'product-information',
    icon: 'feather',
    title: 'Product information',
    body: [
      'We sell synthetic, Futura and blend wigs. All are made with synthetic fibres.',
      'The products are factory made, therefore we cannot guarantee the exact fibre ratio.',
    ],
  },
  {
    id: 'exchanges',
    icon: 'box',
    title: 'Exchange policy',
    body: [
      'Exchanges are only accepted if the wrong product was sent or if the item is defective (e.g. torn lace, damage).',
      'Please inspect your item upon delivery and report any issues within 24 hours.',
    ],
  },
  {
    id: 'lace',
    icon: 'scissors',
    title: 'Lace & customisation policy',
    body: [
      'Lace is delicate and should be handled with care. We are not responsible for damage caused during installation, cutting, plucking or styling after delivery.',
      'Once the lace has been cut or altered, the item cannot be exchanged.',
    ],
  },
  {
    id: 'colour',
    icon: 'monitor',
    title: 'Colour disclaimer',
    body: [
      'Product colours may appear slightly different due to lighting, editing and screen settings.',
      'We cannot guarantee that the colour you see on your device will match the product exactly.',
    ],
  },
  {
    id: 'shipping',
    icon: 'truck',
    title: 'Shipping & delivery policy',
    body: [
      'Delivery times are estimates and may vary depending on the courier. We are not responsible for courier delays once your parcel has been dispatched.',
      'Please ensure your delivery address and contact details are correct before placing your order.',
    ],
  },
  {
    id: 'cancellations',
    icon: 'clipboard',
    title: 'Order cancellation policy',
    body: [
      'Orders cannot be cancelled once they have been processed or shipped.',
      'Please double-check your order before completing payment.',
    ],
  },
  {
    id: 'care',
    icon: 'sparkle',
    title: 'Care & maintenance policy',
    body: [
      'Proper care will help extend the life of your wig. We are not responsible for damage caused by excessive heat, chemicals, incorrect washing or improper storage.',
      'Please follow the recommended care instructions.',
    ],
  },
  {
    id: 'responsibility',
    icon: 'userCheck',
    title: 'Customer responsibility policy',
    body: [
      'Please inspect your order upon delivery. Any missing, damaged or incorrect items must be reported within 24 hours.',
      'By placing an order, you acknowledge that you have read and accepted all company policies.',
    ],
  },
];

export const policyPosters = [
  { src: refundProductExchange, alt: 'Cutesify policy graphic: refund policy, product information and exchange policy.' },
  { src: laceColourShipping, alt: 'Cutesify policy graphic: lace and customisation policy, colour disclaimer, shipping and delivery policy.' },
  { src: cancellationCareResponsibility, alt: 'Cutesify policy graphic: order cancellation, care and maintenance, customer responsibility policy.' },
];
