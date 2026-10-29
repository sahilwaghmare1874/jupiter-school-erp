import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">About Jupiter English Medium School</h1>
        <p class="lead text-warning">Legacy of Educational Excellence in Shendre Satara Since 1998</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <h2 class="fw-bold mb-3">Our Rich History</h2>
            <p class="text-muted">
              Established in 1998 under Jupiter Education Trust, Jupiter English Medium School in Shendre Satara has consistently empowered young minds with values of integrity, academic distinction, and physical well-being.
            </p>
            <div class="border-start border-4 border-warning ps-3 my-4">
              <h5 class="fw-bold text-gold">Jupiter Education Trust, Shendre Satara</h5>
              <p class="small text-muted mb-0">A premier educational organization in Satara committed to providing world-class K-10 schooling and STEM learning environments.</p>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="row g-3">
              <div class="col-6">
                <div class="spm-card text-center">
                  <h3 class="fw-bold text-warning">1998</h3>
                  <p class="small text-muted mb-0">Year Established</p>
                </div>
              </div>
              <div class="col-6">
                <div class="spm-card text-center">
                  <h3 class="fw-bold text-warning">1250+</h3>
                  <p class="small text-muted mb-0">Enrolled Students</p>
                </div>
              </div>
              <div class="col-6">
                <div class="spm-card text-center">
                  <h3 class="fw-bold text-warning">70+</h3>
                  <p class="small text-muted mb-0">Expert Educators</p>
                </div>
              </div>
              <div class="col-6">
                <div class="spm-card text-center">
                  <h3 class="fw-bold text-warning">100%</h3>
                  <p class="small text-muted mb-0">Board Exam Results</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mt-5">
          <div class="col-md-6">
            <div class="glass-card p-4 h-100">
              <h4 class="fw-bold text-warning mb-3"><i class="fa-solid fa-bullseye me-2"></i>Our Mission</h4>
              <p class="text-muted">To nurture lifelong learners equipped with critical thinking skills, ethical leadership, and scientific temperament to thrive in a dynamic global environment.</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="glass-card p-4 h-100">
              <h4 class="fw-bold text-warning mb-3"><i class="fa-solid fa-eye me-2"></i>Our Vision</h4>
              <p class="text-muted">To be recognized as a premier English medium educational center of excellence in Satara district that integrates traditional values with cutting-edge STEM innovation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {}
