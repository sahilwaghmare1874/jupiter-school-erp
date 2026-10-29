/**
 * core/services/toast.service.ts
 * ────────────────────────────────
 * Signals-based toast notification service.
 * Shows API errors, success confirmations, and warnings without page reload.
 *
 * SDLC Phase 3 — Implementation: Frontend error reporting layer.
 */
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  /** Show a success toast */
  success(message: string, title = 'Success', duration = 4000) {
    this.add({ type: 'success', title, message, duration });
  }

  /** Show an error toast */
  error(message: string, title = 'Error', duration = 6000) {
    this.add({ type: 'error', title, message, duration });
  }

  /** Show a warning toast */
  warning(message: string, title = 'Warning', duration = 5000) {
    this.add({ type: 'warning', title, message, duration });
  }

  /** Show an info toast */
  info(message: string, title = 'Info', duration = 4000) {
    this.add({ type: 'info', title, message, duration });
  }

  /** Show a toast from an HTTP error response */
  fromHttpError(err: any, fallbackMessage = 'An unexpected error occurred.') {
    let message = fallbackMessage;
    if (err?.error) {
      const errData = err.error;
      if (typeof errData === 'string') {
        message = errData;
      } else if (errData.detail) {
        message = errData.detail;
      } else if (errData.errors) {
        message = Array.isArray(errData.errors)
          ? errData.errors.join(' ')
          : JSON.stringify(errData.errors);
      } else {
        // Collect first field error found
        const firstKey = Object.keys(errData)[0];
        if (firstKey && errData[firstKey]) {
          const firstErr = errData[firstKey];
          message = Array.isArray(firstErr) ? firstErr[0] : String(firstErr);
          message = `${firstKey.replace(/_/g, ' ')}: ${message}`;
        }
      }
    }
    const title = err?.status === 400 ? 'Validation Error'
      : err?.status === 401 ? 'Unauthorized'
      : err?.status === 403 ? 'Access Denied'
      : err?.status === 429 ? 'Too Many Requests'
      : 'Server Error';

    this.error(message, title);
  }

  dismiss(id: number) {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }

  private add(options: Omit<Toast, 'id'>) {
    const id = this.nextId++;
    this.toasts.update(ts => [...ts, { id, ...options }]);
    setTimeout(() => this.dismiss(id), options.duration);
  }
}
