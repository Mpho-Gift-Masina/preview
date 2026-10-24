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
- **Order emails**: orders are sent from the order form to the seller's inbox through [Web3Forms](https://web3forms.com) (free, no server needed).
  1. On web3forms.com, enter the email address that should receive orders and copy the access key it sends you.
  2. Copy `.env.example` to `.env` and set `VITE_WEB3FORMS_KEY=<your key>`. When deploying (Vercel, Netlify, etc.), add the same variable in the host's environment settings.
  3. Rebuild. Each order arrives as an email with the unit, name, phone, email, delivery address and notes; reply to it to reach the customer.

  Until the key is set, the form shows "Online ordering is not set up yet" instead of sending.

## Design notes

- Glassmorphism: frosted panels (`.glass`) over an animated pink and plum gradient mesh.
- 3D: a rotating photo ring in the hero, pointer-tilt product and feature cards with a light glare, and a flip card in the lace guide.
- Accessibility: all motion turns off under `prefers-reduced-motion`; visible keyboard focus, 44px touch targets, and a native `<dialog>` for product details.
