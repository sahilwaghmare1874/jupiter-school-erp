import { Routes } from '@angular/router';
import { authGuard, adminGuard, studentGuard } from './core/guards/auth.guard';
import { HomeComponent } from './public/home/home.component';
import { AboutComponent } from './public/about/about.component';
import { AcademicsComponent } from './public/academics/academics.component';
import { AdmissionsComponent } from './public/admissions/admissions.component';
import { EventsComponent } from './public/events/events.component';
import { GalleryComponent } from './public/gallery/gallery.component';
import { TeachersComponent } from './public/teachers/teachers.component';
import { FacilitiesComponent } from './public/facilities/facilities.component';
import { AchievementsComponent } from './public/achievements/achievements.component';
import { ContactComponent } from './public/contact/contact.component';
import { LoginComponent } from './public/login/login.component';
import { StudentPortalComponent } from './student-portal/student-portal.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';

export const routes: Routes = [
  // Public routes (no auth required)
  { path: '', component: HomeComponent, title: 'Jupiter English Medium School, Shendre Satara — Home' },
  { path: 'about', component: AboutComponent, title: 'About Us — Jupiter English Medium School' },
  { path: 'academics', component: AcademicsComponent, title: 'Academics — Jupiter English Medium School' },
  { path: 'admissions', component: AdmissionsComponent, title: 'Online Admissions 2026-27 — Jupiter School' },
  { path: 'events', component: EventsComponent, title: 'Events & Activities — Jupiter English Medium School' },
  { path: 'gallery', component: GalleryComponent, title: 'Photo Gallery — Jupiter English Medium School' },
  { path: 'teachers', component: TeachersComponent, title: 'Our Faculty — Jupiter English Medium School' },
  { path: 'facilities', component: FacilitiesComponent, title: 'World-Class Facilities — Jupiter School Satara' },
  { path: 'achievements', component: AchievementsComponent, title: 'Achievements & Awards — Jupiter School' },
  { path: 'contact', component: ContactComponent, title: 'Contact Us — Jupiter English Medium School' },
  { path: 'login', component: LoginComponent, title: 'ERP Portal Login — Jupiter English Medium School' },

  // Bug Fix #15: Student portal — only STUDENT role allowed
  {
    path: 'student-portal',
    component: StudentPortalComponent,
    canActivate: [studentGuard],
    title: 'Student ERP Portal — Jupiter English Medium School'
  },

  // Bug Fix #15: Admin portal — only staff roles allowed (TRUSTEE, PRINCIPAL, TEACHER, CLERK)
  {
    path: 'admin-portal',
    component: AdminPortalComponent,
    canActivate: [adminGuard],
    title: 'Admin Management Portal — Jupiter English Medium School'
  },

  // Redirect unknown routes to home
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
