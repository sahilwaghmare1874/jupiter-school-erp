import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Contact Jupiter English Medium School</h1>
        <p class="lead text-warning">We are Here to Help. Reach Out for Admission Queries & Information</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-5">
          <!-- Form -->
          <div class="col-lg-6">
            <div class="spm-card p-4 p-md-5">
              <h3 class="fw-bold mb-4"><i class="fa-solid fa-envelope me-2 text-warning"></i>Send Us a Message</h3>
              @if (submitted()) {
                <div class="text-center py-4">
                  <div class="display-2 text-warning mb-3"><i class="fa-solid fa-circle-check"></i></div>
                  <h4 class="fw-bold">Message Received!</h4>
                  <p class="text-muted">Thank you! Our administrative team will respond within 1-2 business days.</p>
                  <button class="btn btn-gold mt-2" (click)="resetForm()">Send Another Message</button>
                </div>
              } @else {
              @if (errorMsg()) {
                <div class="alert alert-danger small py-2 mb-3">{{ errorMsg() }}</div>
              }
              <form (ngSubmit)="submitMessage()">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Your Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required placeholder="Full Name">
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Email Address *</label>
                    <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required placeholder="name@domain.com">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Phone Number *</label>
                    <input type="tel" class="form-control" [(ngModel)]="formData.phone" name="phone" required placeholder="+91 98220 12345">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Subject *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.subject" name="subject" required placeholder="Admission Inquiry / General Query">
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Message *</label>
                  <textarea class="form-control" rows="4" [(ngModel)]="formData.message" name="message" required placeholder="Write your message here..."></textarea>
                </div>
                <button type="submit" class="btn btn-gold w-100" [disabled]="loading()">
                  @if (loading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>Sending...
                  } @else {
                    <i class="fa-solid fa-paper-plane me-2"></i>Send Message
                  }
                </button>
              </form>
              }
            </div>
          </div>

          <!-- Info & Map -->
          <div class="col-lg-6">
            <div class="glass-card p-4 mb-4">
              <h4 class="fw-bold text-warning mb-3">School Address & Hours</h4>
              <ul class="list-unstyled space-y-3 mb-0">
                <li class="d-flex align-items-start gap-3 mb-3">
                  <i class="fa-solid fa-location-dot text-warning fs-5 mt-1"></i>
                  <div>
                    <strong>Jupiter English Medium School</strong><br>
                    NH-4 Highway, Shendre, Satara, Maharashtra 415001
                  </div>
                </li>
                <li class="d-flex align-items-center gap-3 mb-3">
                  <i class="fa-solid fa-phone text-warning fs-5"></i>
                  <div>+91 2162 270123 / +91 98220 12345</div>
                </li>
                <li class="d-flex align-items-center gap-3 mb-3">
                  <i class="fa-solid fa-envelope text-warning fs-5"></i>
                  <div>info&#64;jupiterschoolsatara.org</div>
                </li>
                <li class="d-flex align-items-center gap-3">
                  <i class="fa-solid fa-clock text-warning fs-5"></i>
                  <div>Office Hours: Monday – Saturday (8:00 AM – 4:00 PM)</div>
                </li>
              </ul>
            </div>

            <!-- Map Mockup Container -->
            <div class="spm-card p-0 overflow-hidden text-center position-relative">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" 
                   class="w-100 opacity-75" style="height: 250px; object-fit: cover;" alt="Map">
              <div class="position-absolute inset-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white">
                <div>
                  <i class="fa-solid fa-map-location-dot fs-1 text-warning mb-2"></i>
                  <h5 class="fw-bold mb-0">Shendre, Satara Campus</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
  apiService = inject(ApiService);
  submitted = signal(false);
  loading = signal(false);
  errorMsg = signal('');
  formData = { name: '', email: '', phone: '', subject: '', message: '' };

  submitMessage() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.apiService.submitContactMessage(this.formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        this.formData = { name: '', email: '', phone: '', subject: '', message: '' };
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to send message. Please verify your details and ensure the server is reachable.');
      }
    });
  }

  resetForm() {
    this.submitted.set(false);
    this.errorMsg.set('');
  }
}

