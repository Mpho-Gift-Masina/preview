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
- **Payment gateway**: `src/lib/payment.ts` holds a mock `processPayment` so the flow can be tested. Card `4242 4242 4242 4242` (any future expiry, any CVC) succeeds; `4000 0000 0000 0002` is declined. Before going live, replace it with your provider's SDK (PayFast, Yoco, Peach Payments, Paystack…) and swap the card inputs for the provider's hosted fields, so card numbers never reach your server. Confirm each payment on a server through the provider's webhook before you fulfil the order.

## Design notes

- Light glassmorphism: frosted white panels (`.glass`) over blurred product photos (`.backdrop` in `App.tsx`), solid brand pink `#d81b72` (passes WCAG AA with white text). The only gradient left is the light glare on product cards. Colour tokens sit at the top of `src/styles.css`.
- Liquid glass buttons: every button shares one recipe in `src/styles.css` ("Liquid glass buttons"): see-through blurred body, bright rim, soft top highlight, springy hover and squish on press; main actions are pink liquid glass. In Chromium they also refract through the `#liquid-btn` SVG filter.
- Liquid glass: the header is a short pill pinned top-right, with a spring "drop" that flows between links. Panels with `.liquid` get real refraction in Chromium through the `#liquid-glass` SVG filter (`LiquidFilters` in `src/components/motion.tsx`); other browsers keep plain frosted glass.
- Our story (`src/components/Story.tsx`): a scroll-pinned section where gooey blobs (`#goo` filter) melt and recolour behind a glass card, chapters blur in and out, and photos are unveiled with a liquid circle. Edit the copy in `chapters` at the top of the file.
- 3D: the rotating photo ring in the hero, pointer-tilt cards with a glare, and the flip card in the lace guide.
- Transitions (`src/components/motion.tsx`): sections fade up 28px with a soft ease and stagger their children, replaying each time they scroll into view; pages fade out and rise in (`usePageTransition` in `App.tsx`). Reloading always starts at the top (`main.tsx`).
- Policy cards carousel (`src/components/PolicyCarousel.tsx`): 3D coverflow with swipe/drag, arrows, dots and ← → keys; tap the centre card to enlarge.
- Policies page (`#/policies`, `src/components/PoliciesPage.tsx`): text from the policy graphics lives in `src/data/policies.ts`; the original graphics are in `assets/policies-*.jpeg`. Checkout asks customers to accept the policies before paying.
- Accessibility: reduced-motion users get no movement (`MotionConfig reducedMotion="user"` plus CSS). Modals trap focus, close on Escape and restore focus. The story is also given to screen readers as plain text.
