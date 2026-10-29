import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { HeroSlide, Announcement, EventItem, Facility } from '../../core/models/erp.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO SECTION CAROUSEL -->
    <section class="hero-section position-relative text-white overflow-hidden">
      <div class="carousel slide carousel-fade" data-bs-ride="carousel" id="heroCarousel">
        <div class="carousel-inner">
          @for (slide of slides; track slide.id; let first = $first) {
            <div class="carousel-item" [class.active]="first">
              <div class="hero-bg-overlay"></div>
              <img [src]="slide.image_url" class="d-block w-100 hero-img" [alt]="slide.title">
              <div class="carousel-caption text-start">
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2 mb-md-3 animate-fade-in hero-badge">
                  <i class="fa-solid fa-award me-1"></i> Top English Medium School in Satara
                </span>
                <h1 class="display-3 fw-bold mb-2 mb-md-3 text-white animate-fade-in hero-title">{{ slide.title }}</h1>
                <p class="lead mb-3 mb-md-4 text-white-50 max-w-600 animate-fade-in hero-desc">{{ slide.subtitle }}</p>
                <div class="d-flex flex-column flex-sm-row gap-2 gap-sm-3 animate-fade-in">
                  <a [routerLink]="slide.cta_link" class="btn btn-gold btn-lg">{{ slide.cta_text }}</a>
                  <a routerLink="/about" class="btn btn-outline-light btn-lg rounded-pill px-4">Explore Jupiter</a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- LIVE NEWS TICKER -->
    <div class="news-ticker py-2 bg-dark border-bottom border-warning border-opacity-25">
      <div class="container d-flex align-items-center flex-wrap flex-sm-nowrap gap-2">
        <div class="badge bg-warning text-dark px-3 py-1 text-uppercase fw-bold flex-shrink-0">
          <i class="fa-solid fa-bullhorn me-1"></i> Latest News
        </div>
        <div class="ticker-content text-white-50 small flex-grow-1 overflow-hidden">
          @for (ann of announcements; track ann.id) {
            <span class="me-5"><i class="fa-solid fa-circle text-warning me-2" style="font-size: 6px;"></i>{{ ann.title }}</span>
          }
        </div>
      </div>
    </div>

    <!-- WHY CHOOSE US / FEATURES SECTION -->
    <section class="py-5 bg-surface">
      <div class="container py-3 py-md-4">
        <div class="section-title-wrap">
          <span class="subtitle">Why Choose Jupiter</span>
          <h2 class="title">World-Class Education & Facilities</h2>
          <div class="divider"></div>
        </div>

        <div class="row g-3 g-md-4">
          @for (card of whyChooseUsCards; track card.title) {
            <div class="col-6 col-md-6 col-lg-3">
              <div class="spm-card h-100 text-center">
                <div class="feature-icon-wrapper mb-3 mx-auto">
                  <i [class]="card.icon + ' text-warning fs-2'"></i>
                </div>
                <h5 class="fw-bold mb-2 fs-6 fs-md-5">{{ card.title }}</h5>
                <p class="text-muted small mb-0 d-none d-sm-block">{{ card.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ABOUT SCHOOL BRIEF -->
    <section class="py-5 bg-primary-navy text-white position-relative">
      <div class="container py-3 py-md-4">
        <div class="row align-items-center g-4 g-lg-5">
          <div class="col-lg-6">
            <div class="position-relative">
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80" 
                   class="img-fluid rounded-4 shadow-lg border border-warning border-opacity-25 w-100" alt="Jupiter Campus">
              <div class="stat-badge glass-card p-3 position-absolute bottom-0 end-0 m-2 m-md-3 text-dark">
                <div class="fs-3 fs-md-2 fw-bold text-warning mb-0">25+ Years</div>
                <div class="small fw-semibold">Academic Excellence</div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <span class="text-warning text-uppercase fw-bold letter-spacing-2 small d-block mb-1">About Jupiter English Medium School</span>
            <h2 class="display-5 fw-bold text-white mb-3">Empowering Generations of Leaders in Satara</h2>
            <p class="text-white-50 mb-4 small fs-md-6">
              Under Jupiter Education Trust, Jupiter English Medium School in Shendre Satara has stood as a beacon of academic rigor, character building, and modern scientific education since 1998.
            </p>
            <div class="row g-3 mb-4">
              <div class="col-12 col-sm-6">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-check-circle text-warning fs-5"></i>
                  <span class="small text-white">100% Board Pass Rate</span>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-check-circle text-warning fs-5"></i>
                  <span class="small text-white">Advanced STEM & AI Labs</span>
                </div>
              </div>
            </div>
            <a routerLink="/about" class="btn btn-gold">Read Principal's Message</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ACADEMICS PREVIEW -->
    <section class="py-5">
      <div class="container py-3 py-md-4">
        <div class="section-title-wrap">
          <span class="subtitle">Academic Wings</span>
          <h2 class="title">Holistic Learning Framework</h2>
          <div class="divider"></div>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <div class="spm-card h-100">
              <div class="badge bg-danger mb-3">Pre-Primary</div>
              <h4 class="fw-bold mb-3 fs-5">Kindergarten & Early Childhood</h4>
              <p class="text-muted small">Play-based experiential learning fostering motor skills, phonics, and emotional development.</p>
              <a routerLink="/academics" class="text-warning fw-bold text-decoration-none small">Explore Pre-Primary <i class="fa-solid fa-arrow-right ms-1"></i></a>
            </div>
          </div>
          <div class="col-md-4">
            <div class="spm-card h-100 border-warning">
              <div class="badge bg-warning text-dark mb-3">Primary Wing</div>
              <h4 class="fw-bold mb-3 fs-5">Grades 1 to 5 Foundation</h4>
              <p class="text-muted small">Core inquiry in Science, Mathematics, English fluency, environmental studies, and creative arts.</p>
              <a routerLink="/academics" class="text-warning fw-bold text-decoration-none small">Explore Primary <i class="fa-solid fa-arrow-right ms-1"></i></a>
            </div>
          </div>
          <div class="col-md-4">
            <div class="spm-card h-100">
              <div class="badge bg-primary mb-3">Secondary Wing</div>
              <h4 class="fw-bold mb-3 fs-5">Grades 6 to 10 Secondary</h4>
              <p class="text-muted small">State Board curriculum, competitive exam prep, advanced physics & robotics laboratories.</p>
              <a routerLink="/academics" class="text-warning fw-bold text-decoration-none small">Explore Secondary <i class="fa-solid fa-arrow-right ms-1"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EVENTS & NEWS -->
    <section class="py-5 bg-surface">
      <div class="container py-3 py-md-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end mb-4 gap-2">
          <div>
            <span class="subtitle text-warning text-uppercase fw-bold small">School Happenings</span>
            <h2 class="title mb-0 fs-3">Upcoming Events & News</h2>
          </div>
          <a routerLink="/events" class="btn btn-outline-gold btn-sm">View All Events</a>
        </div>

        <div class="row g-4">
          @for (event of events; track event.id) {
            <div class="col-md-6">
              <div class="glass-card p-3 p-md-4 d-flex gap-3 align-items-center">
                <div class="date-badge text-center bg-dark text-warning p-2 p-md-3 rounded-3 border border-warning flex-shrink-0">
                  <div class="fs-4 fw-bold mb-0">{{ event.event_date | date:'dd' }}</div>
                  <div class="small text-uppercase">{{ event.event_date | date:'MMM' }}</div>
                </div>
                <div>
                  <span class="badge bg-secondary mb-1">{{ event.category }}</span>
                  <h5 class="fw-bold mb-1 fs-6 fs-md-5">{{ event.title }}</h5>
                  <p class="text-muted small mb-0"><i class="fa-solid fa-location-dot me-1"></i>{{ event.location }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-img {
      height: 75vh;
      min-height: 480px;
      object-fit: cover;
    }
    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15,32,39,0.75) 0%, rgba(15,32,39,0.92) 100%);
    }
    .carousel-caption {
      left: 6% !important;
      right: 6% !important;
      bottom: 3rem !important;
      width: auto !important;
      max-width: 90vw !important;
      padding: 0 !important;
    }
    .hero-title {
      font-size: clamp(1.5rem, 5vw, 3.2rem) !important;
      line-height: 1.2 !important;
    }
    .hero-desc {
      font-size: clamp(0.85rem, 2.5vw, 1.2rem) !important;
    }
    .feature-icon-wrapper {
      width: 56px;
      height: 56px;
      background: rgba(212, 175, 55, 0.12);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .bg-primary-navy {
      background: #0F2027;
    }

    @media (max-width: 768px) {
      .hero-img {
        height: 60vh;
        min-height: 420px;
      }
      .carousel-caption {
        left: 4% !important;
        right: 4% !important;
        bottom: 1.5rem !important;
      }
      .feature-icon-wrapper {
        width: 46px;
        height: 46px;
      }
    }
  `]

})
export class HomeComponent implements OnInit {
  apiService = inject(ApiService);

  slides: HeroSlide[] = [];
  announcements: Announcement[] = [];
  events: EventItem[] = [];

  whyChooseUsCards = [
    { title: 'Smart Classrooms', icon: 'fa-solid fa-laptop-code', desc: 'Interactive digital boards and multimedia learning tools.' },
    { title: 'STEM & Robotics Lab', icon: 'fa-solid fa-microchip', desc: 'Hands-on coding, 3D printing, and automated robotics kits.' },
    { title: 'Rich Central Library', icon: 'fa-solid fa-book-open', desc: 'Over 15,000 reference books, journals, and digital e-resources.' },
    { title: 'Sports & Athletics', icon: 'fa-solid fa-trophy', desc: 'Expert coaching in football, basketball, cricket, and gymnastics.' }
  ];

  ngOnInit() {
    this.apiService.getHeroSlides().subscribe(data => this.slides = data);
    this.apiService.getAnnouncements().subscribe(data => this.announcements = data);
    this.apiService.getEvents().subscribe(data => this.events = data);
  }
}
