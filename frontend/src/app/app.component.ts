import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { VisitorEnquiryWidgetComponent } from './shared/components/visitor-enquiry-widget/visitor-enquiry-widget.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, VisitorEnquiryWidgetComponent, ToastComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-navbar></app-navbar>
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <!-- Floating visitor enquiry widget — auto-hides on portal/login pages -->
      <app-visitor-enquiry-widget></app-visitor-enquiry-widget>
      <!-- Global toast notifications (SDLC: API error reporting layer) -->
      <app-toast></app-toast>
    </div>
  `
})
export class AppComponent {
  title = 'Jupiter English Medium School ERP';
}
