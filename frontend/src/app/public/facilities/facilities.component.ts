import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">World-Class Facilities</h1>
        <p class="lead text-warning">Infrastructure Designed for 21st-Century Learning</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-4">
          @for (facility of facilities; track facility.title) {
            <div class="col-md-6 col-lg-4">
              <div class="spm-card h-100 text-center">
                <div class="facility-icon mx-auto mb-3">
                  <i [class]="facility.icon + ' fs-2 text-warning'"></i>
                </div>
                <h4 class="fw-bold mb-2">{{ facility.title }}</h4>
                <p class="text-muted small mb-0">{{ facility.desc }}</p>
              </div>
            </div>
          }
        </div>

        <div class="mt-5 p-4 rounded-4 bg-primary text-white text-center">
          <h3 class="fw-bold mb-2">Want to experience our campus live?</h3>
          <p class="mb-3">Schedule a guided school tour or apply online for admission today.</p>
          <a routerLink="/admission" class="btn btn-warning text-dark fw-bold px-4 py-2">Apply for Admission</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .facility-icon {
      width: 70px;
      height: 70px;
      background: rgba(212, 175, 55, 0.12);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(212, 175, 55, 0.25);
    }
  `]
})
export class FacilitiesComponent {
  facilities = [
    { title: 'STEM & Robotics Lab', icon: 'fa-solid fa-microchip', desc: 'State-of-the-art robotics kits, coding stations, 3D printers, and AI experimentation modules for Grades 4–10.' },
    { title: 'Digital Smart Classrooms', icon: 'fa-solid fa-laptop-code', desc: 'Interactive flat-panel displays, multimedia projectors, and digital annotation tools in every classroom.' },
    { title: 'Central Library', icon: 'fa-solid fa-book-open', desc: 'Over 15,000 books, educational journals, digital e-library access, and dedicated silent reading zones.' },
    { title: 'Physics & Chemistry Labs', icon: 'fa-solid fa-flask', desc: 'Fully equipped science laboratories with modern apparatus, fume hoods, and safety stations.' },
    { title: 'Sports Complex', icon: 'fa-solid fa-trophy', desc: 'Expert coaching in football, basketball, cricket, badminton, and gymnastics with certified sports coaches.' },
    { title: 'Medical & Health Room', icon: 'fa-solid fa-heart-pulse', desc: 'Qualified school nurse on duty, first aid station, and regular health checkup programs.' },
    { title: 'CCTV & Security', icon: 'fa-solid fa-shield-halved', desc: '360° HD CCTV surveillance covering all buildings, corridors, and campus entry/exit points.' },
    { title: 'Fleet Transport', icon: 'fa-solid fa-bus', desc: 'GPS-tracked school buses covering all major routes in Pune city with dedicated trained drivers.' },
    { title: 'Computer Lab', icon: 'fa-solid fa-desktop', desc: 'High-speed internet-connected computer labs with 80+ workstations for digital literacy and programming.' },
  ];
}
