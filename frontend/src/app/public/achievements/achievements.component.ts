import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Achievement } from '../../core/models/erp.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Our Pride & Achievements</h1>
        <p class="lead text-warning">Students, Teachers & School Accolades That Define Our Excellence in Satara</p>
      </div>
    </div>

    <!-- Stats Banner -->
    <div class="bg-warning py-4">
      <div class="container">
        <div class="row g-3 text-center text-dark">
          <div class="col-6 col-md-3">
            <div class="fs-2 fw-bold">120+</div>
            <div class="small fw-semibold">State Level Awards</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="fs-2 fw-bold">25+</div>
            <div class="small fw-semibold">Sports Championships</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="fs-2 fw-bold">100%</div>
            <div class="small fw-semibold">Board Exam Results</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="fs-2 fw-bold">15+</div>
            <div class="small fw-semibold">National Olympiad Winners</div>
          </div>
        </div>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-4">
          @for (item of achievements; track $index) {
            <div class="col-md-6">
              <div class="glass-card p-4 h-100 d-flex gap-4 align-items-start">
                <div class="achieve-icon flex-shrink-0">
                  <i [class]="getIcon(item.achievement_type) + ' fs-3 text-warning'"></i>
                </div>
                <div>
                  <span class="badge mb-2" [ngClass]="getBadgeClass(item.achievement_type)">{{ item.achievement_type }}</span>
                  <h5 class="fw-bold mb-1">{{ item.title }}</h5>
                  <p class="text-muted small mb-2">{{ item.description }}</p>
                  <div class="d-flex flex-wrap gap-3 text-muted small">
                    <span><i class="fa-solid fa-user me-1 text-warning"></i>{{ item.achieved_by }}</span>
                    @if (item.position) {
                      <span><i class="fa-solid fa-medal me-1 text-warning"></i>{{ item.position }}</span>
                    }
                    @if (item.date_achieved) {
                      <span><i class="fa-regular fa-calendar me-1 text-warning"></i>{{ item.date_achieved }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .achieve-icon {
      width: 60px;
      height: 60px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(212, 175, 55, 0.3);
      flex-shrink: 0;
    }
  `]
})
export class AchievementsComponent implements OnInit {
  apiService = inject(ApiService);

  achievements: Achievement[] = [
    {
      id: 1, title: 'State Level Science Olympiad — 1st Place',
      description: 'Alex Sharma from Grade 5-A won 1st place at Maharashtra State Science Olympiad 2026 among 5,000+ participants from across the state.',
      achievement_type: 'Student', achieved_by: 'Alex Sharma, Grade 5-A',
      competition_name: 'Maharashtra State Science Olympiad 2026', position: '1st Place', date_achieved: '2026-01-15'
    },
    {
      id: 2, title: 'Best English Medium School — Satara District Award',
      description: 'Jupiter English Medium School received the prestigious Best School Award for holistic academic excellence from Satara Education Board 2025.',
      achievement_type: 'School', achieved_by: 'Jupiter English Medium School, Shendre',
      competition_name: 'Satara District Education Awards 2025', position: 'Best School Award', date_achieved: '2025-12-10'
    },
    {
      id: 3, title: 'Satara District Chess Championship — 3 Gold Medals',
      description: 'Our chess team bagged 3 gold medals and 1 silver medal at the Satara District Inter-School Chess Championship 2026.',
      achievement_type: 'Sports', achieved_by: 'Jupiter Chess Team',
      competition_name: 'Satara District Chess Championship 2026', position: '3 Gold Medals', date_achieved: '2026-01-20'
    },
    {
      id: 4, title: 'Maharashtra Government Best Educator Award',
      description: 'Mrs. Anjali Deshmukh was honored with the State Best Educator Award 2024 in recognition of innovative STEM teaching methods.',
      achievement_type: 'Teacher', achieved_by: 'Mrs. Anjali Deshmukh, Mathematics',
      competition_name: 'Maharashtra Best Educator Awards 2024', position: 'State Level Winner', date_achieved: '2024-09-05'
    },
    {
      id: 5, title: 'Robotics & AI State Championship — Runner Up',
      description: 'Grade 8 students built and presented an autonomous line-following robot at the state-level competition in Pune.',
      achievement_type: 'Student', achieved_by: 'Rohan Mehta & Team, Grade 8-A',
      competition_name: 'Maharashtra Robotics Championship 2026', position: 'Runner Up', date_achieved: '2026-02-01'
    },
    {
      id: 6, title: 'NABARD Regional School Innovation Award',
      description: 'School received recognition for outstanding implementation of digital education tools and paperless ERP governance.',
      achievement_type: 'School', achieved_by: 'Jupiter English Medium School, Shendre Satara',
      competition_name: 'NABARD Regional Education Summit 2025', position: 'Innovation Excellence', date_achieved: '2025-11-14'
    },
  ];

  ngOnInit() {
    // API call replaces mock data when backend is live
    // this.apiService.getAchievements().subscribe(data => { if(data?.length) this.achievements = data; });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'Student': 'fa-solid fa-user-graduate',
      'Teacher': 'fa-solid fa-chalkboard-user',
      'School': 'fa-solid fa-school-flag',
      'Sports': 'fa-solid fa-trophy',
    };
    return icons[type] || 'fa-solid fa-award';
  }

  getBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      'Student': 'bg-primary',
      'Teacher': 'bg-info text-dark',
      'School': 'bg-warning text-dark',
      'Sports': 'bg-success',
    };
    return classes[type] || 'bg-secondary';
  }
}
