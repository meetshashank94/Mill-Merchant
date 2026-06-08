import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Product } from '../models/product.model';
import { CATALOG_URL, S3_IMAGE_BASE_URL } from './catalog.config';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly catalogUrl = inject(CATALOG_URL);
  private readonly imageBaseUrl = inject(S3_IMAGE_BASE_URL);

  private readonly products$ = this.http
    .get<Product[]>(this.catalogUrl)
    .pipe(shareReplay(1));

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  /** Resolve a product image key against the configured base URL (S3/CDN). */
  imageUrl(key: string): string {
    const base = this.imageBaseUrl.replace(/\/+$/, '');
    return `${base}/${key}`;
  }
}
