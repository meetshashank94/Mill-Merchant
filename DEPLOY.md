# Deploying to AWS (S3 + CloudFront)

This app is a **fully static SPA** — the production build under
`dist/furniture-showcase/browser/` (HTML + JS/CSS + `data/products.json` +
`assets/products/*`) is everything that needs to be served. No backend, no
database, no always-on compute.

The cheapest robust hosting is **Amazon S3 (private) + CloudFront**:

- **S3** stores the files (fractions of a cent/month at ~600 KB; 5 GB free for
  12 months).
- **CloudFront** serves them over HTTPS with a global CDN. Its perpetual
  *always-free* tier (1 TB egress + 10M requests/month) means typical cost is
  **$0/month** at this scale.
- **ACM** TLS certificate is free; HTTPS works out of the box on the default
  `*.cloudfront.net` domain.

The only optional paid piece is a **custom domain** via Route 53 (~$0.50/month
per hosted zone + domain registration). Skip it to stay at $0 and use the
CloudFront URL.

> Avoid EC2 / Lightsail / ECS / Elastic Beanstalk — that is always-on compute
> this static site does not need ($3–10+/month minimum).

---

## One-time setup

Set your names once:

```bash
BUCKET=mill-merchant-site         # must be globally unique
REGION=ap-south-1                 # pick the region closest to your customers
```

### 1. Create a private bucket

```bash
aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"
# Keep it private — CloudFront will read it via Origin Access Control (OAC).
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 2. Create the CloudFront distribution

In the CloudFront console (or via API):

- **Origin**: the S3 bucket, using **Origin Access Control (OAC)** so the bucket
  stays private. CloudFront will give you a bucket policy to paste.
- **Viewer protocol policy**: Redirect HTTP → HTTPS.
- **Default root object**: `index.html`.
- **Custom error responses** (the one non-obvious must-do for SPA routing):
  - HTTP `403` → response page `/index.html`, response code `200`
  - HTTP `404` → response page `/index.html`, response code `200`

  Angular uses client-side routing, so deep links / refreshes must fall back to
  `index.html`. Without this, refreshing on a sub-route returns an error.

Note the distribution ID (e.g. `E123ABC...`).

### 3. Least-privilege deploy IAM (OIDC — no stored keys)

The GitHub Actions workflow uses OIDC to assume a role, so **no long-lived AWS
keys** are stored in GitHub. Create an IAM role that trusts your repo and grants
only what the deploy needs:

Permissions policy (replace ARNs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Sync",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::mill-merchant-site"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::mill-merchant-site/*"
    },
    {
      "Sid": "Invalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

Trust policy (GitHub OIDC):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:meetshashank94/Mill-Merchant:ref:refs/heads/master" }
    }
  }]
}
```

(If the GitHub OIDC provider doesn't exist yet in your account, create it once
for `https://token.actions.githubusercontent.com`.)

### 4. Wire up GitHub

In the repo: **Settings → Secrets and variables → Actions**

- Secret `AWS_DEPLOY_ROLE_ARN` = the role ARN from step 3
- Variable `AWS_REGION` = e.g. `ap-south-1`
- Variable `S3_BUCKET` = your bucket name
- Variable `CLOUDFRONT_DISTRIBUTION_ID` = the distribution id

After that, every push to `master` auto-deploys via
`.github/workflows/deploy.yml` (also runnable manually via "Run workflow").

---

## Manual deploy (from your laptop)

With the AWS CLI configured (`aws configure`):

```bash
S3_BUCKET=mill-merchant-site \
CLOUDFRONT_DISTRIBUTION_ID=E123ABC... \
npm run deploy
```

This builds, syncs to S3 (long-cache for fingerprinted assets, no-cache for
`index.html` and `data/`), and invalidates CloudFront.

---

## Caching strategy

- Fingerprinted assets (`main-*.js`, `styles-*.css`, images) → cached 1 year
  (`immutable`); the filename hash changes on every build, so updates are picked
  up automatically.
- `index.html` and `data/products.json` → `no-cache`, and explicitly
  invalidated on each deploy, so catalog/tag/price/stock edits appear right away.
