/** The two lace frontal sizes we sell. */
export type LaceSize = '13x4' | '13x6';

/** One wig in the shop. Edit the `products` list below to change what's for sale. */
export interface Product {
  id: string;
  name: string;
  price: number;
  lengthInches: number;
  lace: LaceSize;
  colour: string;
  texture: string;
  description: string;
  /** Gradient used for the product's glow, matching the hair colour. */
  tint: [string, string];
  images: string[];
}

export const products: Product[] = [
  {
    id: 'frosty',
    name: 'Frosty',
    price: 750,
    lengthInches: 30,
    lace: '13x4',
    colour: 'Platinum blonde, brown roots',
    texture: 'Bone straight',
    description: 'Icy platinum lengths melting from a soft brown root, on a transparent 13x4 lace.',
    tint: ['#f5e6c8', '#b08a5a'],
    images: ['/images/frosty-1.webp'],
  },
  {
    id: 'ms-berry',
    name: 'Ms. Berry',
    price: 630,
    lengthInches: 28,
    lace: '13x4',
    colour: '99J burgundy',
    texture: 'Layered',
    description: 'Deep 99J burgundy with face-framing layers and a full frontal transparent lace.',
    tint: ['#c2185b', '#5e0b2b'],
    images: ['/images/ms-berry-1.webp', '/images/ms-berry-2.webp'],
  },
  {
    id: 'mocharella',
    name: 'Mocharella',
    price: 630,
    lengthInches: 28,
    lace: '13x4',
    colour: 'Colour 5, warm chocolate',
    texture: 'Silky straight',
    description: 'A rich chocolate brown that catches the light, on a 13x4 full frontal.',
    tint: ['#c08a6a', '#5a3324'],
    images: ['/images/mocharella-1.webp', '/images/mocharella-2.webp'],
  },
  {
    id: 'swirl',
    name: 'Swirl',
    price: 600,
    lengthInches: 24,
    lace: '13x6',
    colour: 'Colour #3, soft black',
    texture: 'Body wave',
    description: 'Glossy body waves with a deep 13x6 part for endless styling options.',
    tint: ['#6b4a5e', '#1a0f16'],
    images: ['/images/swirl-1.webp', '/images/swirl-2.webp'],
  },
];

/** Shows a price in South African style, e.g. 1500 → "R1 500". */
export function formatPrice(rand: number): string {
  return `R${rand.toLocaleString('en-ZA')}`;
}
