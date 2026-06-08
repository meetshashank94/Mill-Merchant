import { computed, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'fs.selection.ids';

/** Signal-based multi-select of product ids, persisted to localStorage. */
@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly _ids = signal<string[]>(this.restore());

  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);

  isSelected(id: string): boolean {
    return this._ids().includes(id);
  }

  toggle(id: string): void {
    const current = this._ids();
    this._ids.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
    this.persist();
  }

  remove(id: string): void {
    this._ids.set(this._ids().filter((x) => x !== id));
    this.persist();
  }

  clear(): void {
    this._ids.set([]);
    this.persist();
  }

  private restore(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._ids()));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }
}
