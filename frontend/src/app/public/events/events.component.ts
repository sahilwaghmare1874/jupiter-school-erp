import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { EventItem } from '../../core/models/erp.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">School Events & Activities</h1>
        <p class="lead text-warning">Celebrating Cultural Fests, Sports Meets, and Academic Competitions at Jupiter School, Shendre Satara</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">

        <!-- Upcoming Events Section -->
        @if (upcomingEvents.length > 0) {
          <div class="mb-5">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="badge bg-warning text-dark px-3 py-2 fs-6"><i class="fa-solid fa-calendar-plus me-1"></i>Upcoming</div>
              <h2 class="fw-bold mb-0">Upcoming Events</h2>
            </div>
            <div class="row g-4">
              @for (event of upcomingEvents; track event.id) {
                <div class="col-md-6">
                  <div class="event-card upcoming-card h-100 overflow-hidden">
                    @if (event.image_url) {
                      <img [src]="event.image_url" [alt]="event.title" class="w-100 event-img">
                    }
                    <div class="p-4">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-warning text-dark">{{ event.category }}</span>
                        <span class="badge bg-success">Upcoming</span>
                      </div>
                      <h4 class="fw-bold mb-2">{{ event.title }}</h4>
                      <p class="text-muted small mb-3">{{ event.description }}</p>
                      <div class="d-flex justify-content-between align-items-center text-muted small border-top pt-3">
                        <span><i class="fa-solid fa-calendar text-warning me-2"></i>{{ event.event_date | date:'mediumDate' }}</span>
                        <span><i class="fa-solid fa-location-dot text-warning me-2"></i>{{ event.location }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Past Events Section -->
        <div>
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="badge bg-secondary px-3 py-2 fs-6"><i class="fa-solid fa-clock-rotate-left me-1"></i>Past</div>
            <h2 class="fw-bold mb-0">Past Events</h2>
          </div>
          <div class="row g-4">
            @for (event of pastEvents; track event.id) {
              <div class="col-md-6">
                <div class="event-card h-100 overflow-hidden">
                  @if (event.image_url) {
                    <img [src]="event.image_url" [alt]="event.title" class="w-100 event-img opacity-75">
                  }
                  <div class="p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <span class="badge bg-secondary">{{ event.category }}</span>
                      <span class="badge bg-dark border border-secondary text-muted">Completed</span>
                    </div>
                    <h4 class="fw-bold mb-2">{{ event.title }}</h4>
                    <p class="text-muted small mb-3">{{ event.description }}</p>
                    <div class="d-flex justify-content-between align-items-center text-muted small border-top pt-3">
                      <span><i class="fa-solid fa-calendar me-2"></i>{{ event.event_date | date:'mediumDate' }}</span>
                      <span><i class="fa-solid fa-location-dot me-2"></i>{{ event.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .event-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    }
    .upcoming-card {
      border-left: 4px solid #D4AF37;
    }
    .event-img {
      height: 220px;
      object-fit: cover;
      display: block;
    }
  `]
})
export class EventsComponent implements OnInit {
  apiService = inject(ApiService);
  events: EventItem[] = [];

  get upcomingEvents() { return this.events.filter(e => e.is_upcoming); }
  get pastEvents() { return this.events.filter(e => !e.is_upcoming); }

  ngOnInit() {
    this.apiService.getEvents().subscribe(data => this.events = data);
  }
}
