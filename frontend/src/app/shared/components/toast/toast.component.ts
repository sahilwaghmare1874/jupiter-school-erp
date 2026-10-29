/**
 * shared/components/toast/toast.component.ts
 * ─────────────────────────────────────────────
 * Global toast notification display, embedded in AppComponent.
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast show align-items-center border-0 shadow mb-2 animate-slide-in"
          [class]="toastClass(toast.type)"
          role="alert"
          aria-live="assertive"
          aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body d-flex align-items-start gap-2">
              <i [class]="toastIcon(toast.type) + ' mt-1 flex-shrink-0'"></i>
              <div>
                <strong class="d-block">{{ toast.title }}</strong>
                <small>{{ toast.message }}</small>
              </div>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="toastService.dismiss(toast.id)"
              aria-label="Close">
            </button>
          </div>
          <!-- Progress bar -->
          <div class="toast-progress" [style.animation-duration.ms]="toast.duration"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast-success { background: #198754; color: #fff; }
    .toast-error   { background: #dc3545; color: #fff; }
    .toast-warning { background: #fd7e14; color: #fff; }
    .toast-info    { background: #0d6efd; color: #fff; }
    .toast-progress {
      height: 3px;
      background: rgba(255,255,255,0.5);
      animation: shrink linear forwards;
      border-radius: 0 0 4px 4px;
    }
    @keyframes shrink {
      from { width: 100%; }
      to   { width: 0; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: string): string {
    return `toast-${type}`;
  }

  toastIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-circle-exclamation',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info',
    };
    return icons[type] || 'fa-solid fa-bell';
  }
}
