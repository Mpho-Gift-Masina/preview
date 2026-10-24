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
- **WhatsApp number**: set `WHATSAPP_NUMBER` in `src/config.ts` (digits only, international format, e.g. `27821234567`). Until it is set, the Order buttons open WhatsApp with the message prefilled and let the customer pick the contact.

## Design notes

- Glassmorphism: frosted panels (`.glass`) over an animated pink and plum gradient mesh.
- 3D: a rotating photo ring in the hero, pointer-tilt product and feature cards with a light glare, and a flip card in the lace guide.
- Accessibility: all motion turns off under `prefers-reduced-motion`; visible keyboard focus, 44px touch targets, and a native `<dialog>` for product details.
