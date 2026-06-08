# Deploying (Netlify)

This app is a **fully static SPA** — the production build under
`dist/furniture-showcase/browser/` (HTML + JS/CSS + `data/products.json` +
`assets/products/*`) is everything that needs to be served. No backend, no
database, no always-on compute.

We host it on **Netlify**: connect this GitHub repo once, then every push builds
and deploys over HTTPS via Netlify's global CDN. Pull requests get automatic
**deploy previews**. It's the lowest-effort option and runs comfortably within
the **free tier**.

> Free tier (Starter): 100 GB bandwidth/month, 300 build minutes/month,
> automatic HTTPS, deploy previews, and custom domains. At this scale
> (~600 KB of assets, low traffic) you'll stay well within it — effectively $0.

Build settings and the SPA redirect live in [`netlify.toml`](./netlify.toml) at
the repo root, so there's nothing to configure in the Netlify UI:

```toml
[build]
  command = "npm run build"
  publish = "dist/furniture-showcase/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200          # SPA fallback so deep links / refreshes don't 404
```

---

## One-time setup

1. Sign in at [app.netlify.com](https://app.netlify.com) (use the GitHub login).
2. **Add new site → Import an existing project → GitHub**, authorize Netlify,
   and pick `meetshashank94/Mill-Merchant`.
3. Netlify reads `netlify.toml`, so build command and publish directory are
   pre-filled. Select the `master` branch as the production branch and **Deploy**.
4. You get a URL like `https://<random-name>.netlify.app` (HTTPS included). You
   can rename the site in **Site settings → Site details**.

Every push to `master` now auto-builds and deploys. Pull requests get **deploy
previews** automatically (a unique URL per PR).

> Alternative (CLI, optional): `npm i -g netlify-cli`, then `netlify init` to
> link the repo or `netlify deploy --prod` for a manual one-off deploy.

---

## Custom domain (optional)

In **Site settings → Domain management → Add a custom domain**:

- Enter your domain; Netlify walks you through DNS.
- Easiest path: point your registrar's nameservers to **Netlify DNS**, or add
  the CNAME / A records Netlify shows for an external registrar.
- **HTTPS** (Let's Encrypt) is provisioned automatically once DNS resolves —
  no certificate steps.

Without a custom domain you just use the free `*.netlify.app` URL.

---

## Local build (sanity check)

```bash
npm ci
npm run build      # -> dist/furniture-showcase/browser/
```

Netlify runs the same `npm run build` and publishes that folder.
