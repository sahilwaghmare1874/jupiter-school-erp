import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-academics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Academic Curriculum & Wings</h1>
        <p class="lead text-warning">Structured Learning Pathways from Kindergarten to Secondary Board Standards</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="spm-card h-100">
              <span class="badge bg-warning text-dark mb-2">Pre-Primary Section</span>
              <h3 class="fw-bold mb-3">Mini KG, Jr. KG & Sr. KG</h3>
              <p class="text-muted small">Designed around sensory exploration, language acquisition, phonics, and play-way arithmetic. We focus on social bonding and motor coordination.</p>
              <ul class="list-unstyled text-muted small">
                <li><i class="fa-solid fa-check text-warning me-2"></i>Phonics & Vocabulary Building</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>Art, Crafts & Clay Modeling</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>Activity-Based Early Math</li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="spm-card h-100">
              <span class="badge bg-danger mb-2">Primary Section</span>
              <h3 class="fw-bold mb-3">Grades 1 to 5</h3>
              <p class="text-muted small">Emphasis on foundational literacy, STEM curiosity, environmental studies, and English communication skills.</p>
              <ul class="list-unstyled text-muted small">
                <li><i class="fa-solid fa-check text-warning me-2"></i>State Curriculum + Olympiad Coaching</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>Smart Interactive Boards in every class</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>Computer Education & Robotics Basics</li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="spm-card h-100">
              <span class="badge bg-primary mb-2">Secondary Section</span>
              <h3 class="fw-bold mb-3">Grades 6 to 10</h3>
              <p class="text-muted small">Comprehensive board preparation, advanced science experimentations, scholarship exam guidance, and career counseling.</p>
              <ul class="list-unstyled text-muted small">
                <li><i class="fa-solid fa-check text-warning me-2"></i>Full Physics, Chemistry & Biology Labs</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>NTSE & Scholarship Exam Training</li>
                <li><i class="fa-solid fa-check text-warning me-2"></i>Inter-School Debate & Model United Nations</li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <div class="spm-card h-100">
              <span class="badge bg-success mb-2">Academic Calendar</span>
              <h3 class="fw-bold mb-3">Term Structure & Exams</h3>
              <p class="text-muted small">The academic session runs from June to April divided into two terms with continuous comprehensive evaluation (CCE).</p>
              <ul class="list-unstyled text-muted small">
                <li><i class="fa-solid fa-calendar me-2 text-warning"></i>Term 1: June to October</li>
                <li><i class="fa-solid fa-calendar me-2 text-warning"></i>Term 2: November to April</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AcademicsComponent {}
