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
| `WHATSAPP_NUMBER` | `919205261441` | Destination WhatsApp number (without `+`) |

Override in `src/app/app.config.ts` providers to swap values.

## Editing products

The catalog is a plain JSON array in [`public/data/products.json`](public/data/products.json). Each entry matches the [`Product`](src/app/models/product.model.ts) interface:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | yes | Unique slug, e.g. `sofa-aspen`. Used as the localStorage selection key — keep it stable. |
| `name` | `string` | yes | Display name. |
| `category` | `string` | yes | One of: `Sofas`, `Chairs`, `Tables`, `Beds`, `Storage`, `Lighting`, `Decor` (drives the filter pills). |
| `description` | `string` | yes | Short marketing copy. |
| `price` | `number` | yes | Price in INR (plain number, no symbol/commas). |
| `mrp` | `number` | no | Optional original price; renders as a strike-through. |
| `image` | `string` | yes | Image **key/filename** (e.g. `sofa-aspen.jpg`) — see [Image configuration](#image-configuration). |
| `dimensions` | `string` | yes | Free text, e.g. `210 * 85 * 72 cm`. |
| `sizes` | `string[]` | yes | Variant labels, e.g. `["3-seater", "2-seater"]`. Use `[]` if none. |
| `material` | `string` | yes | e.g. `Solid teak + cotton weave`. |
| `tag` | `string` | no | Eyebrow badge — omit for none. See [Tags](#tags-new--bestseller--heritage). |
| `inStock` | `boolean` | yes | `false` shows a grey **"Made to order"** badge. |

**To add a product**: append an object to the array and make sure its `image` file exists (see below).
**To edit / remove**: change or delete the object. There's no build step for data — the app fetches the JSON at runtime, so changes go live on the next deploy (or immediately on refresh in `ng serve`).

> The file must stay valid JSON (double-quoted keys, no trailing commas, no comments). It's worth running it through a linter/`JSON.parse` before committing.

### Tags (New / Bestseller / Heritage)

Badges are **fully data-driven** — there's no enum or special logic. Set the optional `tag` field to any string and it renders as a pill on the card; omit it for no badge:

```jsonc
{ "id": "sofa-aspen", "name": "Aspen 3-Seater Sofa", "tag": "Bestseller", ... }
{ "id": "table-slab", "name": "Slab Coffee Table",   "tag": "Heritage",    ... }
{ "id": "sofa-drift", "name": "Drift Modular Sofa",  /* no tag field */     ... }
```

Notes:
- All tags share one style (a single green pill, top-left) — the text is whatever you type, there is **no per-tag color**.
- The grey **"Made to order"** pill (top-right) is separate: it's driven by `"inStock": false`, **not** by `tag`.

## Image configuration

How a product finds its image: each product's `image` field is a key that's resolved against the **`S3_IMAGE_BASE_URL`** token at runtime — `imageUrl(key) = S3_IMAGE_BASE_URL + "/" + key` ([`catalog.service.ts`](src/app/services/catalog.service.ts)). So the `image` value must match a real file at that base.

Two ways to host images:

### Option A — Local assets (default)

`S3_IMAGE_BASE_URL` defaults to `assets/products`, so the app loads `assets/products/<image>`.

1. Drop the file in `public/assets/products/` (Angular copies `public/` to the build root).
2. Set the product's `image` to that filename, e.g. `"image": "sofa-aspen.jpg"`.
3. Deploy. (Convention: name files after the product `id`, e.g. `sofa-aspen.jpg`.)

Best for a small catalog — images version and ship with the app, nothing else to configure.

### Option B — AWS S3 / CloudFront

Serve images from a bucket/CDN **without touching component code** — just override the token. In [`src/app/app.config.ts`](src/app/app.config.ts):

```ts
import { S3_IMAGE_BASE_URL } from './services/catalog.config';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...existing providers
    { provide: S3_IMAGE_BASE_URL, useValue: 'https://cdn.example.com/furniture' },
  ],
};
```

Now `"image": "sofa-aspen.jpg"` resolves to `https://cdn.example.com/furniture/sofa-aspen.jpg`. The `image` keys in `products.json` stay the same — only the base changes.

One-time AWS setup:
1. Create an S3 bucket and upload the images (keeping the same filenames as the `image` keys), e.g. `aws s3 sync ./images s3://my-furniture-bucket/`.
2. Front the bucket with **CloudFront** (keep the bucket private, use Origin Access Control) and use the CloudFront domain as the base URL — gives HTTPS + CDN caching.
3. If you point the base URL straight at the S3/website endpoint instead of CloudFront, add a **CORS** rule allowing `GET` from your site's origin so the browser can load the images.

> Tip: prefer optimized/WebP images and consistent dimensions regardless of where they're hosted — that matters far more for performance than S3 vs local at this scale.

## Updating the catalog (summary)

1. Edit `public/data/products.json` (add/remove/modify product objects).
2. Make each product's `image` file available — in `public/assets/products/` (local) **or** uploaded to your S3 bucket/CDN if `S3_IMAGE_BASE_URL` is overridden.
3. Redeploy (auto-deploys on push to `master` via Netlify — see [DEPLOY.md](DEPLOY.md)).

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
│   │   └── chat/                      # Sticky bottom tray + wa.me link builder
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

- **Images** are currently generated color-block placeholders. Replace files in `public/assets/products/` or point `S3_IMAGE_BASE_URL` to your CDN after uploading real photos.
- The catalog is intentionally small (≤40 items) for a link-shared lead-gen page, not a full e-commerce store.
