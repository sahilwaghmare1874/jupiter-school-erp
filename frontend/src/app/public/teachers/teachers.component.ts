import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { TeacherProfile } from '../../core/models/user.model';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Our Esteemed Faculty</h1>
        <p class="lead text-warning">Inspiring Minds with Dedicated Expertise, Integrity & Modern Pedagogy</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-4">
          @for (teacher of teachers; track teacher.id) {
            <div class="col-md-6 col-lg-4">
              <div class="spm-card text-center h-100">
                <div class="avatar-box mb-3 mx-auto">
                  <i class="fa-solid fa-chalkboard-user fs-1 text-warning"></i>
                </div>
                <h4 class="fw-bold mb-1">{{ teacher.user?.first_name || 'Educator' }} {{ teacher.user?.last_name || '' }}</h4>
                <span class="badge bg-warning text-dark mb-2">{{ teacher.designation }}</span>
                <p class="text-muted small mb-2"><strong>Specialization:</strong> {{ teacher.subject_specialization }}</p>
                <p class="text-muted small mb-3"><strong>Qualification:</strong> {{ teacher.qualification }} ({{ teacher.experience_years }}+ Yrs Exp)</p>
                @if (teacher.awards) {
                  <div class="badge bg-gold text-dark mb-3"><i class="fa-solid fa-award me-1"></i>{{ teacher.awards }}</div>
                }
                <p class="small text-muted mb-0 border-top pt-2">{{ teacher.bio }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .avatar-box {
      width: 90px;
      height: 90px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--primary-gold);
    }
  `]
})
export class TeachersComponent implements OnInit {
  apiService = inject(ApiService);
  teachers: TeacherProfile[] = [];

  ngOnInit() {
    this.apiService.getTeachers().subscribe(data => this.teachers = data);
  }
}
