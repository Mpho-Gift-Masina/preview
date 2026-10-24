import { useEffect, useState } from 'react';

export type Route = 'home' | 'policies';

/** Hash-based pages (`#/policies`) so the site works on any static host without rewrite rules. */
export const POLICIES_HREF = '#/policies';

/*
 * PAYFAST: add the pages PayFast sends the customer back to, and use them as the
 * return_url / cancel_url your backend gives PayFast, e.g.
 *   return_url: https://your-domain.co.za/#/payment/success?order=CUT-XXXXXX
 *   cancel_url: https://your-domain.co.za/#/payment/cancelled?order=CUT-XXXXXX
 * Steps:
 *   1. Extend Route: 'home' | 'policies' | 'payment-success' | 'payment-cancelled'.
 *   2. Detect them in current() below (location.hash.startsWith('#/payment/success') etc.).
 *   3. Render a page for each in App.tsx. The success page should ask your backend
 *      whether the order is paid (set by the ITN webhook) and show "confirming…" until it is.
 *      The cancelled page should keep the bag and offer "Try again".
 */

/** Works out which page the URL is asking for. */
function current(): Route {
  return window.location.hash.startsWith('#/policies') ? 'policies' : 'home';
}

/** Returns the current page and re-renders whenever the URL hash changes (link clicks, back/forward). */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(current);

  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
