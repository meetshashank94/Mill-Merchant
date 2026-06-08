import { InjectionToken } from '@angular/core';

/**
 * Base URL that product image keys are resolved against.
 * Defaults to the bundled placeholder images under `assets/products`.
 * To serve from AWS S3 / CloudFront, override this token in `app.config.ts`
 * with the bucket/CDN base URL (e.g. `https://cdn.example.com/furniture`).
 */
export const S3_IMAGE_BASE_URL = new InjectionToken<string>('S3_IMAGE_BASE_URL', {
  providedIn: 'root',
  factory: () => 'assets/products'
});

/**
 * Path (relative to the app) of the static product catalog JSON.
 * Editing this file + redeploying is the supported way to update the catalog.
 */
export const CATALOG_URL = new InjectionToken<string>('CATALOG_URL', {
  providedIn: 'root',
  factory: () => 'data/products.json'
});

/**
 * Destination WhatsApp number in international format WITHOUT the leading `+`
 * (wa.me requirement), e.g. `919999999999`. This is a placeholder — replace
 * with the sales line before going live.
 */
export const WHATSAPP_NUMBER = new InjectionToken<string>('WHATSAPP_NUMBER', {
  providedIn: 'root',
  factory: () => '910000000000'
});
