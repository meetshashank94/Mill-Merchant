# Mill & Merchant — Furniture Showcase SPA

A product-showcase single-page app built with **Angular 19** for WhatsApp-based lead generation. Browse handcrafted furniture, select pieces, and send an enquiry straight to WhatsApp with product context pre-filled.

## Features

- **Static JSON catalog** (~36 furniture items across 7 categories). Edit `public/data/products.json` and redeploy to update.
- **CDK virtual scroll** for smooth performance on 30–40+ item catalogs.
- **Lazy-loaded images** with shimmer skeleton placeholders (IntersectionObserver-based).
- **Multi-select** products → sticky WhatsApp tray builds a `wa.me` deep link with item details pre-filled for the sales executive.
- **AWS S3-ready** image serving: `S3_IMAGE_BASE_URL` injection token resolves image keys to any CDN/bucket. Defaults to local placeholders.
- **Mobile-first responsive** (1 col phone → 2 tablet → 3–4 desktop).
- **Shopifi-inspired design** (DESIGN-2): cinematic dark hero, cream canvas grid, pill-only buttons, Inter Tight display + Inter body.

## Quick start

```bash
npm install
npx ng serve --port 4400
```

Open [http://localhost:4400](http://localhost:4400).

## Configuration

| Token | Default | Purpose |
|-------|---------|---------|
| `S3_IMAGE_BASE_URL` | `assets/products` | Image CDN/bucket base URL |
| `CATALOG_URL` | `data/products.json` | Catalog JSON endpoint |
| `WHATSAPP_NUMBER` | `910000000000` | Destination WhatsApp number (without `+`) |

Override in `src/app/app.config.ts` providers to swap values.

## Updating the catalog

1. Edit `public/data/products.json` (add/remove/modify product objects).
2. Upload corresponding images to your S3 bucket (or `public/assets/products/` for local dev).
3. Redeploy.

## Project structure

```
src/
├── app/
│   ├── models/product.model.ts        # Product interface
│   ├── services/
│   │   ├── catalog.config.ts          # DI tokens (S3_IMAGE_BASE_URL, WHATSAPP_NUMBER)
│   │   ├── catalog.service.ts         # Loads + caches products JSON
│   │   └── selection.service.ts       # Signal-based multi-select (localStorage)
│   ├── components/
│   │   ├── lazy-img/                  # IntersectionObserver image + skeleton
│   │   ├── product-card/              # Card (image, meta, select)
│   │   └── whatsapp-bar/              # Sticky bottom tray + wa.me link builder
│   └── app.component.*                # Shell: hero + controls + virtual grid
├── styles.scss                        # Design tokens (DESIGN-2)
└── index.html                         # Fonts + meta
public/
├── data/products.json                 # Seed catalog (edit to update)
└── assets/products/                   # Placeholder images (swap with S3)
```

## Build

```bash
npx ng build          # production bundle → dist/furniture-showcase
npx ng test --watch=false  # unit tests (ChromeHeadless)
```

## Notes

- **WhatsApp number** is a placeholder — replace `910000000000` with the real sales line before go-live.
- **Images** are currently generated color-block placeholders. Replace files in `public/assets/products/` or point `S3_IMAGE_BASE_URL` to your CDN after uploading real photos.
- The catalog is intentionally small (≤40 items) for a link-shared lead-gen page, not a full e-commerce store.
