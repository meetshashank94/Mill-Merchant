import { Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CatalogService } from '../../services/catalog.service';
import { SelectionService } from '../../services/selection.service';
import { LazyImgComponent } from '../lazy-img/lazy-img.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [LazyImgComponent, DecimalPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  private readonly catalog = inject(CatalogService);
  private readonly selection = inject(SelectionService);

  protected readonly imageUrl = computed(() => this.catalog.imageUrl(this.product().image));
  protected readonly selected = computed(() => this.selection.isSelected(this.product().id));

  protected toggle(): void {
    this.selection.toggle(this.product().id);
  }
}
