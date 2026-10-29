import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-5 bg-primary-navy">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">
            <div class="glass-card p-4 p-md-5">
              <!-- Brand Header -->
              <div class="text-center mb-4">
                <div class="logo-box mx-auto mb-2">
                  <i class="fa-solid fa-school text-warning fs-2"></i>
                </div>
                <h3 class="fw-bold text-white mb-1">Jupiter ERP Portal</h3>
                <p class="text-white-50 small">Secure Single Sign-On Access</p>
              </div>

              <!-- Error Alert -->
              @if (errorMsg()) {
                <div class="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  <span class="small">{{ errorMsg() }}</span>
                </div>
              }

              <!-- Quick Demo Switcher -->
              <div class="p-3 bg-dark bg-opacity-50 rounded-3 mb-4 border border-warning border-opacity-25">
                <small class="text-warning fw-bold d-block mb-2 text-center text-uppercase">
                  <i class="fa-solid fa-bolt me-1"></i> Quick Test Role Switcher
                </small>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  @for (role of demoRoles; track role.key) {
                    <button class="btn btn-sm btn-outline-warning" [disabled]="loading()" (click)="demoLogin(role.key)">
                      @if (loading() && activeRole() === role.key) {
                        <span class="spinner-border spinner-border-sm me-1"></span>
                      }
                      {{ role.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Login Form -->
              <form (ngSubmit)="onLogin()">
                <div class="mb-3">
                  <label class="form-label text-white small fw-semibold">Username / Roll Number / GR</label>
                  <div class="input-group">
                    <span class="input-group-text bg-dark text-warning border-secondary"><i class="fa-solid fa-user"></i></span>
                    <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="credentials.username" name="username" required placeholder="e.g. student_alex">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label text-white small fw-semibold">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-dark text-warning border-secondary"><i class="fa-solid fa-key"></i></span>
                    <input [type]="showPwd() ? 'text' : 'password'" class="form-control bg-dark text-white border-secondary" [(ngModel)]="credentials.password" name="password" required placeholder="••••••••">
                    <button type="button" class="input-group-text bg-dark border-secondary text-white-50" (click)="showPwd.set(!showPwd())">
                      <i [class]="showPwd() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-gold w-100 py-2 mb-3" [disabled]="loading()">
                  @if (loading() && !activeRole()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>Signing in...
                  } @else {
                    <i class="fa-solid fa-right-to-bracket me-2"></i>Log In to Portal
                  }
                </button>
              </form>

              <div class="text-center text-white-50 small mt-3">
                Need assistance? Contact school admin at <strong>info&#64;jupiterschoolsatara.org</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-primary-navy { background: #0F2027; }
    .logo-box {
      width: 54px; height: 54px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--primary-gold);
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = { username: '', password: '' };
  loading = signal(false);
  errorMsg = signal('');
  activeRole = signal<UserRole | null>(null);
  showPwd = signal(false);

  demoRoles: { key: UserRole; label: string }[] = [
    { key: 'TRUSTEE', label: 'Trustee' },
    { key: 'PRINCIPAL', label: 'Principal' },
    { key: 'TEACHER', label: 'Teacher' },
    { key: 'CLERK', label: 'Clerk' },
    { key: 'STUDENT', label: 'Student' },
  ];

  onLogin() {
    if (!this.credentials.username || !this.credentials.password) return;
    this.loading.set(true);
    this.activeRole.set(null);
    this.errorMsg.set('');
    this.authService.login(this.credentials).subscribe({
      next: () => { this.loading.set(false); this.navigateByRole(); },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Invalid username or password. Please try again.');
      }
    });
  }

  demoLogin(role: UserRole) {
    this.loading.set(true);
    this.activeRole.set(role);
    this.errorMsg.set('');
    this.authService.quickDemoLogin(role).subscribe({
      next: () => { this.loading.set(false); this.activeRole.set(null); this.navigateByRole(); },
      error: () => {
        this.loading.set(false);
        this.activeRole.set(null);
        this.errorMsg.set('Demo login failed. Please make sure the backend server is running at http://localhost:8000');
      }
    });
  }

  private navigateByRole() {
    const role = this.authService.userRole();
    if (role === 'STUDENT') {
      this.router.navigate(['/student-portal']);
    } else {
      this.router.navigate(['/admin-portal']);
    }
  }
}
