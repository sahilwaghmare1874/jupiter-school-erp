import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { GalleryItem } from '../../core/models/erp.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Photo & Video Gallery</h1>
        <p class="lead text-warning">A Glimpse into Life, Sports, Science & Celebrations at Jupiter School, Shendre Satara</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <!-- Filter Tabs -->
        <div class="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'ALL'" [class.btn-outline-secondary]="selectedCategory !== 'ALL'" (click)="filter('ALL')">All Photos</button>
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'Sports'" [class.btn-outline-secondary]="selectedCategory !== 'Sports'" (click)="filter('Sports')">Sports Day</button>
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'Science'" [class.btn-outline-secondary]="selectedCategory !== 'Science'" (click)="filter('Science')">Science & STEM</button>
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'Annual Day'" [class.btn-outline-secondary]="selectedCategory !== 'Annual Day'" (click)="filter('Annual Day')">Annual Cultural</button>
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'Classroom'" [class.btn-outline-secondary]="selectedCategory !== 'Classroom'" (click)="filter('Classroom')">Smart Classrooms</button>
          <button class="btn btn-sm" [class.btn-gold]="selectedCategory === 'Achievement'" [class.btn-outline-secondary]="selectedCategory !== 'Achievement'" (click)="filter('Achievement')">Achievements</button>
        </div>

        <div class="row g-4">
          @for (item of filteredItems; track item.id) {
            <div class="col-md-6 col-lg-3">
              <div class="gallery-card h-100 position-relative overflow-hidden">
                <img [src]="item.url" [alt]="item.title" class="w-100 gallery-img">
                <div class="gallery-overlay d-flex flex-column justify-content-end p-3">
                  <span class="badge bg-warning text-dark mb-1 w-auto align-self-start">{{ item.category }}</span>
                  <h6 class="fw-bold mb-0 text-white">{{ item.title }}</h6>
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredItems.length === 0) {
          <div class="text-center py-5 text-muted">
            <i class="fa-solid fa-images fs-1 mb-3 d-block text-warning opacity-50"></i>
            <h5>No photos in this category yet</h5>
            <p class="small">Check back soon for updates from Jupiter School events!</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .gallery-card {
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      background: #0F2027;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .gallery-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(212,175,55,0.25);
    }
    .gallery-img {
      height: 220px;
      object-fit: cover;
      transition: transform 0.4s ease;
      display: block;
    }
    .gallery-card:hover .gallery-img {
      transform: scale(1.06);
    }
    .gallery-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgba(15,32,39,0.9) 0%, transparent 60%);
    }
  `]
})
export class GalleryComponent implements OnInit {
  apiService = inject(ApiService);

  items: GalleryItem[] = [
    { id: 1, title: 'Satara District Sports Day Sprint Finals', category: 'Sports', media_type: 'Image', url: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'STEM Robotics Lab Experiment Session', category: 'Science', media_type: 'Image', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
    { id: 3, title: 'Annual Cultural Day — Drama Performance', category: 'Annual Day', media_type: 'Image', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
    { id: 4, title: 'Smart Classroom Interactive Digital Board', category: 'Classroom', media_type: 'Image', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80' },
    { id: 5, title: 'Science Olympiad Certificate Distribution', category: 'Achievement', media_type: 'Image', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80' },
    { id: 6, title: 'Basketball Championship — Jupiter Team', category: 'Sports', media_type: 'Image', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80' },
    { id: 7, title: 'Science Fair Student Exhibit', category: 'Science', media_type: 'Image', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80' },
    { id: 8, title: 'Principal Address — Annual Prize Day', category: 'Annual Day', media_type: 'Image', url: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=800&q=80' },
  ];

  filteredItems: GalleryItem[] = [...this.items];
  selectedCategory = 'ALL';

  ngOnInit() {
    this.apiService.getGalleryItems().subscribe(data => {
      if (data && data.length > 0) {
        this.items = data;
        this.filteredItems = data;
      }
    });
  }

  filter(cat: string) {
    this.selectedCategory = cat;
    this.filteredItems = cat === 'ALL' ? this.items : this.items.filter(i => i.category === cat);
  }
}
