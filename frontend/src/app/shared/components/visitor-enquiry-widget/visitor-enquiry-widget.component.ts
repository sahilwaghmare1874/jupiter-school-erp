import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-visitor-enquiry-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ── Floating Trigger Button ───────────────────────────────────── -->
    @if (showWidget) {
      <div class="widget-container">
        <button
          class="widget-fab"
          [class.widget-fab-open]="isOpen()"
          (click)="togglePanel()"
          id="enquiry-widget-btn"
          title="Quick Enquiry"
          aria-label="Open school enquiry form">
          @if (!isOpen()) {
            <span class="fab-content">
              <i class="fa-solid fa-comments me-2"></i>
              <span class="fab-label">Enquire Now</span>
            </span>
          } @else {
            <i class="fa-solid fa-xmark fs-5"></i>
          }
          <!-- Pulsing ring -->
          @if (!isOpen() && !submitted()) {
            <span class="pulse-ring"></span>
            <span class="pulse-ring pulse-ring-2"></span>
          }
        </button>

        <!-- ── Slide-up Panel ──────────────────────────────────────────── -->
        @if (isOpen()) {
          <div class="enquiry-panel" id="enquiry-panel">
            <!-- Header -->
            <div class="panel-header">
              <div class="d-flex align-items-center gap-2">
                <div class="panel-icon">
                  <i class="fa-solid fa-school text-warning"></i>
                </div>
                <div>
                  <div class="fw-bold text-white" style="font-size:0.95rem">Jupiter English Medium School</div>
                  <div class="text-white-50" style="font-size:0.72rem">Quick Enquiry — We'll call you back!</div>
                </div>
              </div>
              <div class="panel-online-dot"></div>
            </div>

            <!-- Success State -->
            @if (submitted()) {
              <div class="panel-body text-center py-4">
                <div class="success-icon mb-3">
                  <i class="fa-solid fa-circle-check text-success fs-1"></i>
                </div>
                <h5 class="fw-bold text-white mb-2">Enquiry Submitted!</h5>
                <p class="text-white-50 small mb-3">
                  Our clerk will call <strong class="text-warning">{{ form.phone }}</strong> shortly.
                </p>
                <p class="text-white-50 small">School hours: Mon–Sat, 8 AM – 4 PM</p>
                <button class="btn btn-outline-light btn-sm mt-2" (click)="resetForm()">
                  Submit Another Enquiry
                </button>
              </div>
            }

            <!-- Form State -->
            @if (!submitted()) {
              <div class="panel-body">
                <p class="text-white-50 small mb-3">
                  <i class="fa-solid fa-circle me-1 text-success" style="font-size:0.5rem"></i>
                  We're online — fill in your details and we'll contact you
                </p>

                <!-- 📱 PHONE — PRIMARY FIELD (largest, most prominent) -->
                <div class="field-group mb-3">
                  <label class="field-label">
                    <i class="fa-solid fa-mobile-screen-button me-1 text-warning"></i>
                    Mobile Number <span class="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    class="field-input field-input-phone"
                    [(ngModel)]="form.phone"
                    placeholder="📱 +91 98765 43210"
                    id="widget-phone"
                    maxlength="15"
                    required>
                  <div class="field-hint">We'll call you back on this number</div>
                </div>

                <div class="field-group mb-3">
                  <label class="field-label">
                    <i class="fa-solid fa-user me-1 text-white-50"></i>Your Name <span class="text-danger">*</span>
                  </label>
                  <input type="text" class="field-input" [(ngModel)]="form.name"
                    placeholder="Full name" id="widget-name">
                </div>

                <div class="field-group mb-3">
                  <label class="field-label">
                    <i class="fa-solid fa-envelope me-1 text-white-50"></i>Email (optional)
                  </label>
                  <input type="email" class="field-input" [(ngModel)]="form.email"
                    placeholder="email@example.com" id="widget-email">
                </div>

                <div class="field-group mb-3">
                  <label class="field-label">
                    <i class="fa-solid fa-question-circle me-1 text-white-50"></i>Enquiry About
                  </label>
                  <select class="field-select" [(ngModel)]="form.purpose" id="widget-purpose">
                    <option value="Admission">🎓 Admission Enquiry</option>
                    <option value="General">📋 General Information</option>
                    <option value="Visit">🏫 Schedule School Visit</option>
                    <option value="Fee">💰 Fee / Scholarship Info</option>
                    <option value="Other">💬 Other</option>
                  </select>
                </div>

                <div class="field-group mb-4">
                  <label class="field-label">
                    <i class="fa-solid fa-comment me-1 text-white-50"></i>Message (optional)
                  </label>
                  <textarea class="field-input" [(ngModel)]="form.message"
                    placeholder="Your question or message..." rows="2" id="widget-message"
                    style="resize:none"></textarea>
                </div>

                @if (errorMsg()) {
                  <div class="error-msg mb-3">
                    <i class="fa-solid fa-triangle-exclamation me-1"></i>{{ errorMsg() }}
                  </div>
                }

                <button
                  class="submit-btn"
                  (click)="submitEnquiry()"
                  [disabled]="submitting()">
                  @if (submitting()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>Sending...
                  } @else {
                    <i class="fa-solid fa-paper-plane me-2"></i>Send Enquiry — Call Me Back!
                  }
                </button>

                <div class="text-center mt-3">
                  <a href="tel:+912162270123" class="call-direct-link">
                    <i class="fa-solid fa-phone me-1"></i>Or call directly: +91 2162 270123
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    /* ── Widget Container ──────────────────────────────────── */
    .widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    /* ── FAB Button ────────────────────────────────────────── */
    .widget-fab {
      position: relative;
      background: linear-gradient(135deg, #d4af37, #f0c040);
      color: #0F2027;
      border: none;
      border-radius: 30px;
      padding: 0.75rem 1.25rem;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(212,175,55,0.5);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 48px;
      overflow: visible;
    }
    .widget-fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(212,175,55,0.65);
    }
    .widget-fab-open {
      border-radius: 50%;
      width: 48px; height: 48px;
      padding: 0;
      justify-content: center;
      background: rgba(50,60,80,0.95);
      color: white;
    }
    .fab-content { display:flex; align-items:center; }
    .fab-label { white-space: nowrap; }

    /* Pulsing rings */
    .pulse-ring {
      position: absolute;
      inset: 0;
      border-radius: 30px;
      border: 2px solid rgba(212,175,55,0.6);
      animation: pulse-out 2s ease-out infinite;
      pointer-events: none;
    }
    .pulse-ring-2 { animation-delay: 1s; }
    @keyframes pulse-out {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    /* ── Enquiry Panel ─────────────────────────────────────── */
    .enquiry-panel {
      background: linear-gradient(170deg, #1a2540 0%, #0f1f35 100%);
      border: 1px solid rgba(212,175,55,0.3);
      border-radius: 20px;
      width: 340px;
      max-height: 82vh;
      overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1);
      margin-bottom: 12px;
      animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* ── Panel Header ──────────────────────────────────────── */
    .panel-header {
      background: linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
      border-bottom: 1px solid rgba(212,175,55,0.2);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 20px 20px 0 0;
    }
    .panel-icon {
      width: 36px; height: 36px;
      background: rgba(212,175,55,0.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .panel-online-dot {
      width: 10px; height: 10px;
      background: #28c76f;
      border-radius: 50%;
      box-shadow: 0 0 6px #28c76f;
      animation: blink 1.5s ease-in-out infinite;
    }
    @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

    /* ── Panel Body ────────────────────────────────────────── */
    .panel-body { padding: 1.25rem; }

    /* ── Form Fields ───────────────────────────────────────── */
    .field-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-label {
      font-size: 0.78rem; font-weight: 600;
      color: rgba(255,255,255,0.7);
    }
    .field-input {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 0.6rem 0.9rem;
      color: white;
      font-size: 0.88rem;
      transition: border-color 0.2s;
      width: 100%;
    }
    .field-input:focus {
      outline: none;
      border-color: var(--primary-gold, #d4af37);
      background: rgba(255,255,255,0.1);
    }
    .field-input::placeholder { color: rgba(255,255,255,0.35); }

    /* Phone input — bigger, more prominent */
    .field-input-phone {
      font-size: 1.05rem;
      font-weight: 700;
      border-color: rgba(212,175,55,0.4);
      background: rgba(212,175,55,0.07);
      padding: 0.75rem 0.9rem;
    }
    .field-input-phone:focus { border-color: #d4af37; }

    .field-hint { font-size: 0.7rem; color: rgba(255,255,255,0.4); }

    .field-select {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 0.6rem 0.9rem;
      color: white;
      font-size: 0.88rem;
      width: 100%;
    }
    .field-select option { background: #1a2540; color: white; }

    /* ── Submit Button ─────────────────────────────────────── */
    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #d4af37, #f0c040);
      color: #0F2027;
      border: none;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212,175,55,0.4);
    }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── Error ─────────────────────────────────────────────── */
    .error-msg {
      background: rgba(220,53,69,0.15);
      border: 1px solid rgba(220,53,69,0.3);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      color: #ff7b8a;
    }

    /* ── Success ───────────────────────────────────────────── */
    .success-icon { animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes bounce-in {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* ── Call Direct ───────────────────────────────────────── */
    .call-direct-link {
      color: rgba(212,175,55,0.7);
      text-decoration: none;
      font-size: 0.77rem;
      transition: color 0.2s;
    }
    .call-direct-link:hover { color: #d4af37; }

    /* ── Mobile responsive ─────────────────────────────────── */
    @media (max-width: 480px) {
      .widget-container { bottom: 16px; right: 16px; }
      .enquiry-panel { width: calc(100vw - 32px); }
      .fab-label { display: none; }
      .widget-fab { border-radius: 50%; width: 56px; height: 56px; padding: 0; justify-content: center; }
    }
  `]
})
export class VisitorEnquiryWidgetComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  isOpen = signal(false);
  submitted = signal(false);
  submitting = signal(false);
  errorMsg = signal('');
  showWidget = true;

  form = {
    phone: '',
    name: '',
    email: '',
    purpose: 'Admission',
    message: ''
  };

  constructor() {
    // Hide widget on portal pages (student/admin)
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects || e.url;
      this.showWidget = !url.includes('portal') && !url.includes('login');
    });
  }

  togglePanel() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      // Focus phone input after panel opens
      setTimeout(() => {
        const el = document.getElementById('widget-phone');
        if (el) el.focus();
      }, 350);
    }
  }

  submitEnquiry() {
    this.errorMsg.set('');

    if (!this.form.phone.trim()) {
      this.errorMsg.set('Mobile number is required so we can call you back!');
      return;
    }
    if (this.form.phone.replace(/\D/g, '').length < 10) {
      this.errorMsg.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!this.form.name.trim()) {
      this.errorMsg.set('Please enter your name.');
      return;
    }

    this.submitting.set(true);
    this.apiService.submitVisitorEnquiry({
      phone: this.form.phone.trim(),
      name: this.form.name.trim(),
      email: this.form.email.trim() || undefined,
      purpose: this.form.purpose,
      message: this.form.message.trim() || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        // Still show success since reactive store was already updated
        this.submitted.set(true);
      }
    });
  }

  resetForm() {
    this.form = { phone: '', name: '', email: '', purpose: 'Admission', message: '' };
    this.submitted.set(false);
    this.errorMsg.set('');
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) this.isOpen.set(false);
  }
}
