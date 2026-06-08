export type ProductCategory =
  | 'Sofas'
  | 'Chairs'
  | 'Tables'
  | 'Beds'
  | 'Storage'
  | 'Lighting'
  | 'Decor';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  /** Short marketing description. */
  description: string;
  /** Price in INR. */
  price: number;
  /** Optional strike-through original price in INR. */
  mrp?: number;
  /** Image key/filename resolved against S3_IMAGE_BASE_URL. */
  image: string;
  /** Dimensions, e.g. "210 * 90 * 85 cm (W*D*H)". */
  dimensions: string;
  /** Available size/variant labels, e.g. ["2-seater", "3-seater"]. */
  sizes: string[];
  /** Material/finish, e.g. "Solid sheesham wood". */
  material: string;
  /** Short eyebrow tag, e.g. "Bestseller". */
  tag?: string;
  inStock: boolean;
}
