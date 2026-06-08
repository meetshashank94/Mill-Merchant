import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Product } from './models/product.model';
import { CatalogService } from './services/catalog.service';
import { SelectionService } from './services/selection.service';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { WhatsappBarComponent } from './components/whatsapp-bar/whatsapp-bar.component';

const ROW_GAP = 24;
const CARD_HEIGHT = 472;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ScrollingModule,
    ProductCardComponent,
    WhatsappBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly selection = inject(SelectionService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly category = signal<string>('All');
  protected readonly search = signal<string>('');
  protected readonly cols = signal<number>(this.columnsForWidth(this.viewportWidth()));

  protected readonly selectedCount = this.selection.count;
  protected readonly rowGap = ROW_GAP;
  protected readonly itemSize = CARD_HEIGHT + ROW_GAP;

  protected readonly categories = computed<string[]>(() => {
    const set = new Set<string>(this.products().map((p) => p.category));
    return ['All', ...Array.from(set)];
  });

  protected readonly filtered = computed<Product[]>(() => {
    const cat = this.category();
    const q = this.search().trim().toLowerCase();
    return this.products().filter((p) => {
      if (cat !== 'All' && p.category !== cat) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  });

  /** Filtered products chunked into rows of `cols` for the virtual viewport. */
  protected readonly rows = computed<Product[][]>(() => {
    const items = this.filtered();
    const n = this.cols();
    const out: Product[][] = [];
    for (let i = 0; i < items.length; i += n) {
      out.push(items.slice(i, i + n));
    }
    return out;
  });

  ngOnInit(): void {
    this.catalog.getProducts().subscribe({
      next: (list) => {
        this.products.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    const next = this.columnsForWidth(this.viewportWidth());
    if (next !== this.cols()) {
      this.cols.set(next);
    }
  }

  protected trackRow = (index: number, row: Product[]): string =>
    row.length ? `${index}:${row[0].id}` : `${index}`;

  protected selectCategory(cat: string): void {
    this.category.set(cat);
  }

  protected onSearch(value: string): void {
    this.search.set(value);
  }

  protected reset(): void {
    this.category.set('All');
    this.search.set('');
  }

  private viewportWidth(): number {
    return typeof window === 'undefined' ? 1200 : window.innerWidth;
  }

  private columnsForWidth(w: number): number {
    if (w < 600) {
      return 1;
    }
    if (w < 900) {
      return 2;
    }
    if (w < 1240) {
      return 3;
    }
    return 4;
  }
}
