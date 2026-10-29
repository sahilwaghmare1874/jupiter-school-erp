import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer-wrap text-white pt-5 pb-3">
      <div class="container">
        <div class="row g-4 mb-5">
          <!-- Brand Column -->
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="logo-box">
                <i class="fa-solid fa-school text-warning fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-white">JUPITER ENGLISH MEDIUM SCHOOL</h5>
                <small class="text-warning">Jupiter Education Trust, Shendre Satara</small>
              </div>
            </div>
            <p class="text-white-50 small mb-4">
              Jupiter English Medium School is a flagship educational institution in Shendre Satara dedicated to academic brilliance, moral character, and innovative STEM education since 1998.
            </p>
            <div class="d-flex gap-3">
              <a href="#" class="social-icon"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" class="social-icon"><i class="fa-brands fa-twitter"></i></a>
              <a href="#" class="social-icon"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" class="social-icon"><i class="fa-brands fa-youtube"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-6">
            <h6 class="text-warning fw-bold mb-3">Quick Links</h6>
            <ul class="list-unstyled footer-links small">
              <li><a routerLink="/about"><i class="fa-solid fa-angle-right me-2 text-warning"></i>About Us</a></li>
              <li><a routerLink="/academics"><i class="fa-solid fa-angle-right me-2 text-warning"></i>Academics</a></li>
              <li><a routerLink="/admissions"><i class="fa-solid fa-angle-right me-2 text-warning"></i>Admissions</a></li>
              <li><a routerLink="/teachers"><i class="fa-solid fa-angle-right me-2 text-warning"></i>Our Faculty</a></li>
              <li><a routerLink="/events"><i class="fa-solid fa-angle-right me-2 text-warning"></i>Events & News</a></li>
            </ul>
          </div>

          <!-- Student & Parent Downloads -->
          <div class="col-lg-3 col-6">
            <h6 class="text-warning fw-bold mb-3">Portals & Downloads</h6>
            <ul class="list-unstyled footer-links small">
              <li><a routerLink="/login"><i class="fa-solid fa-right-to-bracket me-2 text-warning"></i>Student Portal</a></li>
              <li><a routerLink="/login"><i class="fa-solid fa-lock me-2 text-warning"></i>Admin Portal</a></li>
              <li><a routerLink="/admissions"><i class="fa-solid fa-file-pdf me-2 text-warning"></i>Prospectus 2026-27</a></li>
              <li><a routerLink="/academics"><i class="fa-solid fa-calendar-days me-2 text-warning"></i>Academic Calendar</a></li>
            </ul>
          </div>

          <!-- Contact Details -->
          <div class="col-lg-3">
            <h6 class="text-warning fw-bold mb-3">Contact Us</h6>
            <ul class="list-unstyled text-white-50 small space-y-2">
              <li class="d-flex align-items-start gap-2 mb-2">
                <i class="fa-solid fa-location-dot text-warning mt-1"></i>
                <span>NH-4 Highway, Shendre, Satara, Maharashtra 415001</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <i class="fa-solid fa-phone text-warning"></i>
                <span>+91 2162 270123 / +91 98220 12345</span>
              </li>
              <li class="d-flex align-items-center gap-2 mb-2">
                <i class="fa-solid fa-envelope text-warning"></i>
                <span>info&#64;jupiterschoolsatara.org</span>
              </li>
            </ul>
          </div>
        </div>

        <hr class="border-secondary opacity-25">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50 pt-2">
          <div>&copy; 2026 Jupiter English Medium School, Shendre Satara. All Rights Reserved.</div>
          <div class="d-flex gap-3 mt-2 mt-md-0">
            <a href="#" class="text-white-50 text-decoration-none">Privacy Policy</a>
            <a href="#" class="text-white-50 text-decoration-none">Terms of Service</a>
            <a href="#" class="text-white-50 text-decoration-none">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrap {
      background: #0F2027;
      border-top: 2px solid var(--primary-gold);
    }
    .logo-box {
      width: 44px;
      height: 44px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-gold);
    }
    .social-icon {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-gold);
      transition: all 0.3s ease;
      &:hover {
        background: var(--primary-gold);
        color: #0F2027;
        transform: translateY(-3px);
      }
    }
    .footer-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: color 0.2s ease;
      display: block;
      margin-bottom: 0.5rem;
      &:hover {
        color: var(--primary-gold);
      }
    }
  `]
})
export class FooterComponent {}
