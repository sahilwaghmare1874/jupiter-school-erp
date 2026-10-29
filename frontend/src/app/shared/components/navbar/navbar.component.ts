import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Announcement Bar -->
    <div class="top-bar py-1 px-3 d-none d-md-block">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="top-bar-left text-white small">
          <i class="fa-solid fa-graduation-cap me-2 text-warning"></i>
          <span>Affiliated to State Board | Established 1998 | Shendre Satara, Maharashtra</span>
        </div>
        <div class="top-bar-right d-flex align-items-center gap-3">
          <a routerLink="/admissions" class="badge text-bg-warning text-dark text-decoration-none px-2 py-1">
            <i class="fa-solid fa-file-signature me-1"></i> Admissions Open 2026-27
          </a>
          <button class="btn btn-sm btn-link text-white p-0" (click)="themeService.toggleTheme()">
            <i class="fa-solid" [ngClass]="themeService.isDarkMode() ? 'fa-sun text-warning' : 'fa-moon'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="sticky-top shadow-sm glass-header">
      <nav class="navbar navbar-expand-lg py-2">
        <div class="container">
          <!-- Logo & Brand -->
          <a class="navbar-brand d-flex align-items-center gap-3" routerLink="/">
            <div class="logo-box">
              <i class="fa-solid fa-school text-warning fs-3"></i>
            </div>
            <div>
              <div class="brand-title">JUPITER ENGLISH MEDIUM SCHOOL</div>
              <div class="brand-sub">Jupiter Education Trust, Shendre Satara</div>
            </div>
          </a>

          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Nav Items -->
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold align-items-lg-center">
              <li class="nav-item">
                <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/about" routerLinkActive="active">About Us</a>
              </li>
              
              <!-- Mega Menu Dropdown for Academics -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" routerLink="/academics" id="academicsDropdown" role="button" data-bs-toggle="dropdown">
                  Academics
                </a>
                <div class="dropdown-menu mega-dropdown-menu p-4 shadow-lg border-0">
                  <div class="row g-3">
                    <div class="col-md-3">
                      <h6 class="text-warning fw-bold"><i class="fa-solid fa-baby me-2"></i>Pre-Primary</h6>
                      <ul class="list-unstyled small mb-0">
                        <li><a class="dropdown-item" routerLink="/academics">Mini KG</a></li>
                        <li><a class="dropdown-item" routerLink="/academics">Jr. KG</a></li>
                        <li><a class="dropdown-item" routerLink="/academics">Sr. KG</a></li>
                      </ul>
                    </div>
                    <div class="col-md-3">
                      <h6 class="text-warning fw-bold"><i class="fa-solid fa-child me-2"></i>Primary</h6>
                      <ul class="list-unstyled small mb-0">
                        <li><a class="dropdown-item" routerLink="/academics">Grades 1 to 5</a></li>
                        <li><a class="dropdown-item" routerLink="/academics">Curriculum & Syllabus</a></li>
                      </ul>
                    </div>
                    <div class="col-md-3">
                      <h6 class="text-warning fw-bold"><i class="fa-solid fa-user-graduate me-2"></i>Secondary</h6>
                      <ul class="list-unstyled small mb-0">
                        <li><a class="dropdown-item" routerLink="/academics">Grades 6 to 10</a></li>
                        <li><a class="dropdown-item" routerLink="/academics">Board Exams & Results</a></li>
                      </ul>
                    </div>
                    <div class="col-md-3">
                      <h6 class="text-warning fw-bold"><i class="fa-solid fa-flask me-2"></i>Facilities</h6>
                      <ul class="list-unstyled small mb-0">
                        <li><a class="dropdown-item" routerLink="/academics">Robotics & Science Labs</a></li>
                        <li><a class="dropdown-item" routerLink="/academics">Digital Classrooms</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              <li class="nav-item">
                <a class="nav-link" routerLink="/admissions" routerLinkActive="active">Admissions</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/teachers" routerLinkActive="active">Faculty</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/events" routerLinkActive="active">Events</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/gallery" routerLinkActive="active">Gallery</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/contact" routerLinkActive="active">Contact</a>
              </li>
            </ul>

            <!-- Action Buttons -->
            <div class="d-flex align-items-center gap-2">
              @if (!authService.isLoggedIn()) {
                <a routerLink="/login" class="btn btn-navy btn-sm">
                  <i class="fa-solid fa-right-to-bracket me-1"></i> Portal Login
                </a>
                <a routerLink="/admissions" class="btn btn-gold btn-sm d-none d-xl-inline-block">
                  Apply Online
                </a>
              } @else {
                <div class="dropdown">
                  <button class="btn btn-navy btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                    <i class="fa-solid fa-circle-user text-warning fs-5"></i>
                    <span>{{ authService.currentUser()?.first_name || authService.currentUser()?.username }}</span>
                    <span class="badge bg-warning text-dark ms-1">{{ authService.currentUser()?.role }}</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow">
                    @if (authService.currentUser()?.role === 'STUDENT') {
                      <li><a class="dropdown-item" routerLink="/student-portal"><i class="fa-solid fa-gauge me-2"></i>Student Portal</a></li>
                    } @else {
                      <li><a class="dropdown-item" routerLink="/admin-portal"><i class="fa-solid fa-shield-halved me-2"></i>Admin Dashboard</a></li>
                    }
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" (click)="authService.logout()"><i class="fa-solid fa-power-off me-2"></i>Logout</button></li>
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .top-bar {
      background: #0F2027;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .glass-header {
      background: rgba(15, 32, 39, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }
    .brand-title {
      font-family: var(--font-heading);
      font-weight: 800;
      color: #FFFFFF;
      font-size: clamp(0.85rem, 3.5vw, 1.15rem);
      letter-spacing: 0.5px;
      line-height: 1.15;
      word-wrap: break-word;
    }
    .brand-sub {
      font-size: clamp(0.62rem, 2.2vw, 0.75rem);
      color: var(--primary-gold);
      font-weight: 500;
    }
    .logo-box {
      width: 40px;
      height: 40px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-gold);
      flex-shrink: 0;
    }
    .nav-link {
      color: rgba(255,255,255,0.85);
      padding: 0.5rem 0.8rem !important;
      transition: color 0.2s ease;
      font-size: 0.95rem;
      &:hover, &.active {
        color: var(--primary-gold) !important;
      }
    }
    .mega-dropdown-menu {
      width: min(800px, 92vw) !important;
      max-width: 92vw !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: #0F2027;
      border: 1px solid rgba(212, 175, 55, 0.3) !important;
      border-radius: 16px;
      
      .dropdown-item {
        color: rgba(255,255,255,0.75);
        padding: 0.4rem 0.6rem;
        border-radius: 6px;
        &:hover {
          background: rgba(212, 175, 55, 0.15);
          color: var(--primary-gold);
        }
      }
    }
    @media (max-width: 991px) {
      .navbar-collapse {
        background: #0B161B;
        padding: 1.25rem;
        border-radius: 16px;
        margin-top: 0.75rem;
        border: 1px solid rgba(212, 175, 55, 0.25);
        max-height: 80vh;
        overflow-y: auto;
      }
      .mega-dropdown-menu {
        position: static !important;
        transform: none !important;
        width: 100% !important;
        max-width: 100% !important;
        margin-top: 0.5rem;
      }
    }
  `]

})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
}
