#!/usr/bin/env bash
#
# Manual deploy of the built SPA to S3 + CloudFront.
#
# Required env vars:
#   S3_BUCKET                    target S3 bucket name
#   CLOUDFRONT_DISTRIBUTION_ID   CloudFront distribution id
# Optional:
#   AWS_REGION                   (defaults to your AWS CLI default)
#
# Usage:
#   S3_BUCKET=mill-merchant-site CLOUDFRONT_DISTRIBUTION_ID=E123ABC npm run deploy
#
set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET (target S3 bucket name)}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?Set CLOUDFRONT_DISTRIBUTION_ID}"

DIST="dist/furniture-showcase/browser"

echo "==> Building production bundle..."
npm run build

echo "==> Syncing fingerprinted assets (immutable, 1-year cache)..."
aws s3 sync "$DIST" "s3://$S3_BUCKET" --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude index.html --exclude "data/*"

echo "==> Uploading index.html + catalog data (no-cache so edits show immediately)..."
aws s3 cp "$DIST/index.html" "s3://$S3_BUCKET/index.html" \
  --cache-control "no-cache"
aws s3 cp "$DIST/data" "s3://$S3_BUCKET/data" --recursive \
  --cache-control "no-cache"

echo "==> Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/index.html" "/data/*"

echo "==> Done."
