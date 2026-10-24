import { createContext, useContext } from 'react';

/** Opens the order form, optionally with a unit preselected. */
export type OpenOrder = (productId?: string) => void;

export const OrderContext = createContext<OpenOrder>(() => {});

export function useOpenOrder(): OpenOrder {
  return useContext(OrderContext);
}
