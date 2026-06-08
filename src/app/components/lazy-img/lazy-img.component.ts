import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';

/**
 * Lazy-loads an image only once it scrolls near the viewport (IntersectionObserver),
 * showing an animated skeleton placeholder until the image has decoded.
 */
@Component({
  selector: 'app-lazy-img',
  standalone: true,
  templateUrl: './lazy-img.component.html',
  styleUrl: './lazy-img.component.scss'
})
export class LazyImgComponent implements AfterViewInit, OnDestroy {
  readonly src = input.required<string>();
  readonly alt = input<string>('');

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  protected readonly visible = signal(false);
  protected readonly loaded = signal(false);
  protected readonly errored = signal(false);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.visible.set(true);
          this.observer?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected onLoad(): void {
    this.loaded.set(true);
  }

  protected onError(): void {
    this.errored.set(true);
    this.loaded.set(true);
  }
}
