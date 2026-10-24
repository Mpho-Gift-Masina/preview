# Cutesify Hair Company website

Landing site and catalogue for Cutesify Hair Company, built with React, TypeScript and Vite.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
npm run preview  # serve the production build
```

## Editing content

- **Products**: `src/data/products.ts` (name, price, length, lace, colour, photos).
- **Photos**: `public/images/` (WebP, about 900px wide).
- **Delivery fees, free-delivery threshold, collection points and time slots**: `src/config.ts`.

## Cart and checkout

- The bag (`src/cart/CartContext.tsx`) is saved in the browser so it survives a refresh.
- All money maths lives in `src/cart/pricing.ts`: subtotal, courier fee (local vs national rate, free standard delivery over the threshold), collection fee and total.
- Checkout (`src/components/Checkout.tsx`) has three steps: details with delivery or collection, payment, then confirmation.
- **PayFast**: search the project for `PAYFAST:`. The step-by-step guide is at the top of `src/lib/payment.ts`, and the other comments mark each spot to change (`config.ts`, `Checkout.tsx`, `PaymentForm.tsx`, `useRoute.ts`). You'll need a small backend for the signature and the ITN webhook; never put the passphrase in front-end code.
- **Demo mode** (`DEMO_MODE` in `src/lib/payment.ts`): no payment provider is connected. The payment step asks for no card or bank details; it explains that secure payment is coming and offers a clearly labelled "Place demo order" button. The confirmation says no payment was taken and the order was not sent.

## Security notes

- **No secrets in the front end.** Everything in `src/` ships to every visitor's browser. API keys, the PayFast passphrase and merchant credentials belong in a backend's environment variables only. `.env` files are git-ignored; commit only a `.env.example` without real values.
- **Prices are display-only.** The bag stores product ids and quantities only; prices come from `src/data/products.ts`. Anything in the browser can be changed, so the server must recalculate every price, fee and total before charging.
- **Saved bag data is validated** on load (unknown products, invalid quantities and duplicates are dropped or merged), so tampered or broken storage can't crash the site.
- **Card details are never collected by this site.** When PayFast is connected, customers enter them on PayFast's own page.
- **Errors**: `src/components/ErrorBoundary.tsx` shows a friendly reload screen instead of a blank page and never shows technical details to visitors.
- **When deploying**: set security headers on the host (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, frame-ancestors) and serve only over HTTPS.

## Before PayFast goes live

1. Agree the requirements with the client and open a PayFast (sandbox first) account.
2. Build a small backend: a "create payment" endpoint that recalculates totals and signs the request, and an ITN webhook that confirms payments (see the guide at the top of `src/lib/payment.ts`).
3. Replace the body of `processPayment`, add the return/cancel pages (`src/hooks/useRoute.ts`), and set `DEMO_MODE` to `false` only once real payments work end to end in the sandbox.

## Design notes

- Light glassmorphism: frosted white panels (`.glass`) over blurred product photos (`.backdrop` in `App.tsx`), solid brand pink `#d81b72` (passes WCAG AA with white text). The only gradient left is the light glare on product cards. Colour tokens sit at the top of `src/styles.css`.
- Liquid glass buttons: every button shares one recipe in `src/styles.css` ("Liquid glass buttons"): see-through blurred body, bright rim, soft top highlight, springy hover and squish on press; main actions are pink liquid glass. In Chromium they also refract through the `#liquid-btn` SVG filter.
- Liquid glass: the header is a short pill pinned top-right, with a spring "drop" that flows between links. Panels with `.liquid` get real refraction in Chromium through the `#liquid-glass` SVG filter (`LiquidFilters` in `src/components/motion.tsx`); other browsers keep plain frosted glass.
- Our story (`src/components/Story.tsx`): a scroll-pinned section where gooey blobs (`#goo` filter) melt and recolour behind a glass card, chapters blur in and out, and photos are unveiled with a liquid circle. Edit the copy in `chapters` at the top of the file.
- 3D: the rotating photo ring in the hero, pointer-tilt cards with a glare, and the flip card in the lace guide.
- Transitions (`src/components/motion.tsx`): sections fade up 28px with a soft ease and stagger their children, replaying each time they scroll into view; pages fade out and rise in (`usePageTransition` in `App.tsx`). Reloading always starts at the top (`main.tsx`).
- Policy cards carousel (`src/components/PolicyCarousel.tsx`): 3D coverflow with swipe/drag, arrows, dots and ← → keys; tap the centre card to enlarge.
- Policies page (`#/policies`, `src/components/PoliciesPage.tsx`): text from the policy graphics lives in `src/data/policies.ts`; the original graphics are in `assets/policies-*.jpeg`. Checkout asks customers to accept the policies before placing an order.
- Accessibility: reduced-motion users get no movement (`MotionConfig reducedMotion="user"` plus CSS). Modals trap focus, close on Escape and restore focus. The story is also given to screen readers as plain text.
