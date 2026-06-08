import { Component, computed, inject, input } from '@angular/core';
import { Product } from '../../models/product.model';
import { SelectionService } from '../../services/selection.service';
import { WHATSAPP_NUMBER } from '../../services/catalog.config';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  /** Full catalog, used to resolve selected ids to product details. */
  readonly products = input.required<Product[]>();

  private readonly selection = inject(SelectionService);
  private readonly waNumber = inject(WHATSAPP_NUMBER);

  protected readonly count = this.selection.count;

  protected readonly selectedProducts = computed<Product[]>(() => {
    const ids = new Set(this.selection.ids());
    return this.products().filter((p) => ids.has(p.id));
  });

  protected remove(id: string): void {
    this.selection.remove(id);
  }

  protected clear(): void {
    this.selection.clear();
  }

  /** Build a wa.me deep link with the selected products as context. */
  protected whatsappLink(): string {
    const items = this.selectedProducts();
    const lines = [
      'Hi Mill & Merchant, I am interested in the following pieces:',
      ''
    ];
    items.forEach((p, i) => {
      lines.push(
        `${i + 1}. ${p.name} (${p.category}) — ₹${p.price.toLocaleString('en-IN')}`
      );
      lines.push(`   Size: ${p.dimensions}`);
      if (p.sizes.length) {
        lines.push(`   Variants: ${p.sizes.join(', ')}`);
      }
    });
    lines.push('');
    lines.push('Please share availability and delivery details.');
    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${this.waNumber}?text=${text}`;
  }
}
