import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { products } from '../data/products';
import { MAX_QTY } from '../config';
import type { CartItem } from './pricing';

/** Everything that can happen to the bag. */
type Action =
  | { type: 'add'; id: string; qty: number }
  | { type: 'set'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

/** Keeps a quantity between 1 and MAX_QTY (whole numbers only). */
const clamp = (qty: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));

/** True only for products that are actually for sale. */
const isProduct = (id: unknown): id is string => typeof id === 'string' && products.some((p) => p.id === id);

/**
 * Returns the new bag contents for each action (never edits the old array).
 * Unknown products and non-numeric quantities are ignored, so the bag can never hold invalid lines.
 * Note: the bag stores only product ids and quantities. Prices always come from data/products.ts,
 * and must be recalculated on the server once a real payment gateway is connected.
 */
function reducer(items: CartItem[], a: Action): CartItem[] {
  if (a.type !== 'clear' && !isProduct(a.id)) return items;
  if ((a.type === 'add' || a.type === 'set') && !Number.isFinite(a.qty)) return items;

  switch (a.type) {
    // Already in the bag? Bump the quantity. Otherwise add a new line.
    case 'add':
      if (a.qty < 1) return items;
      return items.some((i) => i.id === a.id)
        ? items.map((i) => (i.id === a.id ? { ...i, qty: clamp(i.qty + a.qty) } : i))
        : [...items, { id: a.id, qty: clamp(a.qty) }];
    // Set an exact quantity; going below 1 removes the line.
    case 'set':
      return a.qty < 1
        ? items.filter((i) => i.id !== a.id)
        : items.map((i) => (i.id === a.id ? { ...i, qty: clamp(a.qty) } : i));
    case 'remove':
      return items.filter((i) => i.id !== a.id);
    case 'clear':
      return [];
  }
}

const STORAGE_KEY = 'cutesify-cart';

/**
 * Reads the saved bag from the browser. Saved data can be broken or edited by hand,
 * so anything unexpected is dropped: non-arrays, unknown products, non-whole or
 * non-positive quantities. Duplicate lines are merged, and quantities capped at MAX_QTY.
 * If storage is unavailable or the JSON is invalid, the bag simply starts empty.
 */
function load(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const merged = new Map<string, number>();
    for (const entry of parsed) {
      const id: unknown = entry?.id;
      const qty: unknown = entry?.qty;
      if (!isProduct(id) || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) continue;
      merged.set(id, (merged.get(id) ?? 0) + qty);
    }
    return [...merged].map(([id, qty]) => ({ id, qty: clamp(qty) }));
  } catch {
    return [];
  }
}

/** Which overlay is showing: the bag drawer or checkout. */
export type Panel = 'cart' | 'checkout' | null;

interface CartContextValue {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  panel: Panel;
  openCart: () => void;
  openCheckout: () => void;
  closePanel: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Holds the bag and the open panel, and shares them with every component inside it. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [], load);
  const [panel, setPanel] = useState<Panel>(null);

  // Save the bag whenever it changes so it survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode): the cart still works for this visit.
    }
  }, [items]);

  // The bag plus friendly helper functions; rebuilt only when the bag or panel changes.
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      add: (id, qty = 1) => dispatch({ type: 'add', id, qty }),
      setQty: (id, qty) => dispatch({ type: 'set', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
      panel,
      openCart: () => setPanel('cart'),
      openCheckout: () => setPanel('checkout'),
      closePanel: () => setPanel(null),
    }),
    [items, panel],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Use inside any component to read or change the bag, e.g. `const { add, openCart } = useCart()`. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
