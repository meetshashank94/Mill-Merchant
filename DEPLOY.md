# Deploying to AWS (Amplify Hosting)

This app is a **fully static SPA** — the production build under
`dist/furniture-showcase/browser/` (HTML + JS/CSS + `data/products.json` +
`assets/products/*`) is everything that needs to be served. No backend, no
database, no always-on compute.

We host it on **AWS Amplify Hosting**: it connects to this GitHub repo, builds
on every push, serves over HTTPS via a global CDN, and **handles SPA redirects
automatically**. It's the lowest-effort option — no S3 buckets, CloudFront
distributions, IAM roles, or cache-invalidation scripts to manage.

> Cost: Amplify has a 12-month free tier (build minutes + hosting + transfer).
> After that it's usage-based and still only cents/month at this scale
> (~600 KB of assets, low traffic). For absolute lowest *long-term* cost,
> S3 + CloudFront's perpetual free tier is cheaper but much more setup — this
> repo intentionally optimizes for low effort.

The build settings live in [`amplify.yml`](./amplify.yml) at the repo root, so
Amplify uses them automatically (no console build-spec editing).

---

## One-time setup

1. Go to the **AWS Amplify** console → **Create new app** → **Host web app**.
2. Choose **GitHub** as the source and authorize Amplify. Pick the
   `meetshashank94/Mill-Merchant` repo and the `master` branch.
3. Amplify auto-detects `amplify.yml` — confirm the build settings show:
   - Build command: `npm run build`
   - Output (artifact base) directory: `dist/furniture-showcase/browser`
4. **Deploy.** Amplify builds and gives you a URL like
   `https://master.xxxxx.amplifyapp.com` (HTTPS included).

That's it. Every push to `master` now auto-builds and deploys. Pull requests can
also get **preview deployments** (enable "Previews" in the app settings).

### SPA routing (usually automatic)

Amplify detects single-page apps and adds the catch-all rewrite for you. If a
hard refresh on a deep link ever 404s, add this rule under **App settings →
Rewrites and redirects**:

| Source address | Target address | Type           |
| -------------- | -------------- | -------------- |
| `/<*>`         | `/index.html`  | `404 (Rewrite)` |

(Or use Amplify's built-in "Single page app" preset, which installs the
equivalent regex rule.)

---

## Custom domain (optional)

In the Amplify console → **App settings → Domain management → Add domain**:

- If your domain's DNS is in **Route 53**, Amplify wires up the records and a
  free TLS certificate automatically.
- For an **external registrar** (GoDaddy/Namecheap/etc.), Amplify shows the
  CNAME records to add at your registrar; it manages the certificate.

Amplify handles HTTPS/ACM for you in both cases — no separate certificate
request needed. Without a custom domain you just use the free
`*.amplifyapp.com` URL.

---

## Local build (sanity check)

```bash
npm ci
npm run build      # -> dist/furniture-showcase/browser/
```

Amplify runs exactly these steps via `amplify.yml`.
