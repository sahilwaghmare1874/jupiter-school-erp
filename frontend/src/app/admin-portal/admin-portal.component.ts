import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { ApiService, LeaveApp } from '../core/services/api.service';
import {
  DashboardAnalytics, AdmissionApplication, DocumentRequest,
  HeroSlide, SiteVisitorLog, ContactMessage
} from '../core/models/erp.model';
import { AiAssistantComponent } from '../shared/components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, AiAssistantComponent],
  template: `
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- PORTAL HEADER -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="portal-header">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-box">
            <i [class]="roleIcon + ' fs-3 text-warning'"></i>
          </div>
          <div>
            <h3 class="fw-bold mb-0 text-white">
              {{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}
            </h3>
            <span class="badge me-2 role-badge">{{ roleLabel }}</span>
            <span class="small text-white-50">Jupiter English Medium School — ERP Management Console</span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Live stats chips -->
          @if (userRole === 'CLERK') {
            <span class="stat-chip bg-danger-subtle text-danger border-danger">
              <i class="fa-solid fa-circle-dot me-1" style="font-size:0.55rem"></i>
              {{ uncontactedLeads }} new leads
            </span>
            <span class="stat-chip bg-warning-subtle text-warning border-warning">
              <i class="fa-solid fa-file-circle-plus me-1"></i>{{ pendingDocCount }} doc requests
            </span>
          }
          @if (userRole === 'TRUSTEE') {
            <span class="stat-chip bg-success-subtle text-success border-success">
              <i class="fa-solid fa-indian-rupee-sign me-1"></i>₹{{ ((analytics?.total_collected_fees ?? 4850000) / 100000) | number:'1.1-1' }}L collected
            </span>
          }
          @if (userRole === 'PRINCIPAL') {
            <span class="stat-chip bg-danger-subtle text-danger border-danger">
              <i class="fa-solid fa-clock me-1"></i>{{ pendingLeavesCount }} leaves pending
            </span>
          }
          @if (userRole === 'TEACHER') {
            <span class="stat-chip bg-primary-subtle text-primary border-primary">
              <i class="fa-solid fa-chalkboard me-1"></i>Faculty Portal
            </span>
            <span class="stat-chip bg-success-subtle text-success border-success">
              <i class="fa-solid fa-user-graduate me-1"></i>Grade 5-A
            </span>
          }
          <span class="badge bg-success px-2 py-1">
            <i class="fa-solid fa-circle me-1" style="font-size:0.5rem"></i>System Online
          </span>
          <button class="btn btn-outline-danger btn-sm" (click)="authService.logout()">
            <i class="fa-solid fa-power-off me-1"></i>Logout
          </button>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- ─── Role Label Banner ─────────────────────────────────────────── -->
      <div class="role-banner mb-4">
        <i [class]="roleIcon + ' me-2'"></i>{{ roleLabel }} Dashboard
        <span class="text-white-50 ms-2 small fw-normal">Academic Year 2025–26</span>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- CLERK DASHBOARD -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (userRole === 'CLERK') {
        <ul class="nav nav-pills custom-pills mb-4 flex-wrap">
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='dash'" (click)="activeTab='dash'"><i class="fa-solid fa-gauge me-2"></i>Dashboard</button></li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab==='visitors'" (click)="activeTab='visitors'">
              <i class="fa-solid fa-mobile-screen-button me-2"></i>Visitor Leads
              @if (uncontactedLeads > 0) { <span class="badge bg-danger ms-1">{{ uncontactedLeads }}</span> }
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab==='documents'" (click)="activeTab='documents'">
              <i class="fa-solid fa-file-circle-check me-2"></i>Doc Requests
              @if (pendingDocCount > 0) { <span class="badge bg-warning text-dark ms-1">{{ pendingDocCount }}</span> }
            </button>
          </li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='messages'" (click)="activeTab='messages'"><i class="fa-solid fa-envelope me-2"></i>Contact Msgs</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='admissions'" (click)="activeTab='admissions'"><i class="fa-solid fa-user-plus me-2"></i>Admissions</button></li>
        </ul>

        <!-- CLERK TAB: Dashboard -->
        @if (activeTab === 'dash') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-danger" (click)="activeTab='visitors'">
                  <div class="kpi-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
                  <div class="kpi-value">{{ uncontactedLeads }}</div>
                  <div class="kpi-label">New Visitor Leads</div>
                  <div class="kpi-sub">Tap to call them 📱</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-warning" (click)="activeTab='documents'">
                  <div class="kpi-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                  <div class="kpi-value">{{ pendingDocCount }}</div>
                  <div class="kpi-label">Doc Requests Pending</div>
                  <div class="kpi-sub">Awaiting your approval</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-info" (click)="activeTab='messages'">
                  <div class="kpi-icon"><i class="fa-solid fa-envelope-open-text"></i></div>
                  <div class="kpi-value">{{ unresolvedMsgs }}</div>
                  <div class="kpi-label">Unresolved Messages</div>
                  <div class="kpi-sub">Contact form enquiries</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-gold" (click)="activeTab='admissions'">
                  <div class="kpi-icon"><i class="fa-solid fa-user-check"></i></div>
                  <div class="kpi-value">{{ pendingAdmissions }}</div>
                  <div class="kpi-label">Pending Admissions</div>
                  <div class="kpi-sub">Submitted applications</div>
                </div>
              </div>
            </div>

            <!-- Recent Visitor Leads Quick View -->
            <div class="spm-card mb-4">
              <h5 class="fw-bold mb-3">
                <i class="fa-solid fa-mobile-screen-button text-danger me-2"></i>
                Latest Visitor Enquiries
                <span class="badge bg-danger ms-2">LIVE</span>
              </h5>
              <div class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th class="text-warning">📱 Mobile Number</th>
                      <th>Name</th>
                      <th>Purpose</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (v of visitorLogs.slice(0,5); track v.id) {
                      <tr [class.table-danger]="!v.is_contacted">
                        <td>
                          <a [href]="'tel:' + v.phone" class="phone-highlight">
                            <i class="fa-solid fa-phone-volume me-2"></i>{{ v.phone }}
                          </a>
                        </td>
                        <td><strong>{{ v.name }}</strong></td>
                        <td><span class="badge bg-secondary">{{ v.purpose_display || v.purpose }}</span></td>
                        <td class="small text-muted">{{ formatTime(v.visited_at) }}</td>
                        <td>
                          <span class="badge" [class.bg-danger]="!v.is_contacted" [class.bg-success]="v.is_contacted">
                            {{ v.is_contacted ? 'Contacted' : 'NEW' }}
                          </span>
                        </td>
                        <td>
                          @if (!v.is_contacted) {
                            <button class="btn btn-sm btn-success" (click)="markContacted(v)">
                              <i class="fa-solid fa-phone-check me-1"></i>Done
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <button class="btn btn-link text-danger p-0 mt-2" (click)="activeTab='visitors'">
                View all {{ visitorLogs.length }} leads →
              </button>
            </div>

            <!-- Quick Actions -->
            <div class="spm-card">
              <h5 class="fw-bold mb-3"><i class="fa-solid fa-bolt text-warning me-2"></i>Quick Actions</h5>
              <div class="row g-3">
                <div class="col-md-4">
                  <button class="btn btn-outline-danger w-100 text-start p-3" (click)="activeTab='visitors'">
                    <i class="fa-solid fa-mobile-screen-button me-2 fs-5"></i>
                    <div class="fw-bold">Call Back {{ uncontactedLeads }} Leads</div>
                    <div class="small text-muted">Visitor phone numbers ready</div>
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="btn btn-outline-warning w-100 text-start p-3" (click)="activeTab='documents'">
                    <i class="fa-solid fa-stamp me-2 fs-5"></i>
                    <div class="fw-bold">Approve {{ pendingDocCount }} Certificates</div>
                    <div class="small text-muted">Student document requests</div>
                  </button>
                </div>
                <div class="col-md-4">
                  <button class="btn btn-outline-info w-100 text-start p-3" (click)="activeTab='messages'">
                    <i class="fa-solid fa-reply me-2 fs-5"></i>
                    <div class="fw-bold">Reply to {{ unresolvedMsgs }} Messages</div>
                    <div class="small text-muted">Contact form submissions</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- CLERK TAB: Visitor Leads (CORE FEATURE) -->
        @if (activeTab === 'visitors') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <div>
                  <h4 class="fw-bold mb-1">
                    <i class="fa-solid fa-mobile-screen-button text-danger me-2"></i>
                    Website Visitor Leads — Live Feed
                  </h4>
                  <p class="text-muted small mb-0">Every visitor who submitted an enquiry — <strong class="text-danger">mobile number shown first</strong> for instant call-back</p>
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <span class="badge bg-danger px-3 py-2">
                    <i class="fa-solid fa-circle me-1" style="font-size:0.5rem"></i>{{ uncontactedLeads }} Uncontacted
                  </span>
                  <span class="badge bg-success px-3 py-2">{{ visitorLogs.length - uncontactedLeads }} Contacted</span>
                </div>
              </div>

              <!-- Filter buttons -->
              <div class="d-flex gap-2 mb-3 flex-wrap">
                <button class="btn btn-sm" [class.btn-danger]="visitorFilter==='all'" [class.btn-outline-secondary]="visitorFilter!=='all'" (click)="visitorFilter='all'">All ({{ visitorLogs.length }})</button>
                <button class="btn btn-sm" [class.btn-danger]="visitorFilter==='new'" [class.btn-outline-secondary]="visitorFilter!=='new'" (click)="visitorFilter='new'">New Only ({{ uncontactedLeads }})</button>
                <button class="btn btn-sm" [class.btn-success]="visitorFilter==='done'" [class.btn-outline-secondary]="visitorFilter!=='done'" (click)="visitorFilter='done'">Contacted</button>
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th class="text-warning fs-6">📱 Mobile Number</th>
                      <th>Visitor Name</th>
                      <th>Email</th>
                      <th>Purpose</th>
                      <th>Message / Enquiry</th>
                      <th>Page Visited</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (v of filteredVisitorLogs; track v.id) {
                      <tr [class.new-lead-row]="!v.is_contacted">
                        <!-- PHONE — MOST PROMINENT COLUMN -->
                        <td>
                          <a [href]="'tel:' + v.phone" class="phone-highlight">
                            <i class="fa-solid fa-phone-volume me-2"></i>
                            <strong>{{ v.phone }}</strong>
                          </a>
                        </td>
                        <td><strong>{{ v.name }}</strong></td>
                        <td class="small text-muted">{{ v.email || '—' }}</td>
                        <td>
                          <span class="badge" [ngClass]="purposeBadge(v.purpose)">
                            {{ v.purpose_display || v.purpose }}
                          </span>
                        </td>
                        <td class="small text-muted" style="max-width:200px">
                          <span class="text-truncate d-block" title="{{ v.message }}">{{ v.message || '—' }}</span>
                        </td>
                        <td class="small text-muted">{{ v.page_visited || '—' }}</td>
                        <td class="small text-muted text-nowrap">{{ formatTime(v.visited_at) }}</td>
                        <td>
                          @if (!v.is_contacted) {
                            <span class="badge bg-danger pulse-badge">🔴 NEW</span>
                          } @else {
                            <span class="badge bg-success">✓ Contacted</span>
                            @if (v.contacted_notes) {
                              <div class="small text-muted mt-1" style="max-width:120px">{{ v.contacted_notes }}</div>
                            }
                          }
                        </td>
                        <td>
                          @if (!v.is_contacted) {
                            <button class="btn btn-sm btn-success me-1" (click)="markContacted(v)" title="Mark as Contacted">
                              <i class="fa-solid fa-phone-check"></i>
                            </button>
                          }
                          <a [href]="'tel:' + v.phone" class="btn btn-sm btn-outline-danger" title="Call Now">
                            <i class="fa-solid fa-phone"></i>
                          </a>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- CLERK TAB: Document Requests -->
        @if (activeTab === 'documents') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <h4 class="fw-bold mb-0">
                  <i class="fa-solid fa-stamp text-warning me-2"></i>Student Certificate & Document Requests
                </h4>
                <div class="d-flex gap-2">
                  <span class="badge bg-warning text-dark px-3 py-2">{{ pendingDocCount }} Pending</span>
                  <span class="badge bg-success px-3 py-2">{{ approvedDocCount }} Approved</span>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Req No</th><th>Student Name</th><th>GR Number</th>
                      <th>Certificate Type</th><th>Purpose</th><th>Applied On</th>
                      <th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (doc of documentRequests; track doc.id) {
                      <tr>
                        <td><strong class="text-warning">{{ doc.request_number }}</strong></td>
                        <td>{{ doc.student_name }}</td>
                        <td><span class="badge bg-secondary">{{ doc.gr_number }}</span></td>
                        <td>{{ doc.doc_type_display || doc.document_type }}</td>
                        <td class="small text-muted">{{ doc.purpose }}</td>
                        <td class="small text-muted">{{ doc.applied_at | date:'dd-MMM-yyyy' }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-warning]="doc.status === 'Applied'"
                            [class.text-dark]="doc.status === 'Applied'"
                            [class.bg-info]="doc.status === 'Under_Review'"
                            [class.bg-success]="doc.status === 'Approved' || doc.status === 'Issued'"
                            [class.bg-danger]="doc.status === 'Rejected'">
                            {{ doc.status }}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-gold me-1" (click)="approveDoc(doc)"
                            [disabled]="doc.status === 'Approved' || doc.status === 'Issued'">
                            <i class="fa-solid fa-stamp me-1"></i>Approve
                          </button>
                          <button class="btn btn-sm btn-outline-danger me-1" (click)="rejectDoc(doc)"
                            [disabled]="doc.status === 'Rejected'">
                            <i class="fa-solid fa-xmark"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-primary" (click)="downloadDocPdf(doc)">
                            <i class="fa-solid fa-file-pdf"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- CLERK TAB: Contact Messages -->
        @if (activeTab === 'messages') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <h4 class="fw-bold mb-4">
                <i class="fa-solid fa-envelope-open-text text-warning me-2"></i>Contact Form Messages
              </h4>
              <div class="row g-3">
                @for (msg of contactMessages; track msg.id) {
                  <div class="col-12">
                    <div class="msg-card" [class.msg-unresolved]="!msg.is_resolved">
                      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                        <div>
                          <div class="fw-bold fs-6">{{ msg.name }}
                            <span class="badge bg-warning text-dark ms-2">{{ msg.subject }}</span>
                          </div>
                          <!-- Phone prominently shown in contact messages too -->
                          <a [href]="'tel:' + msg.phone" class="phone-highlight-sm me-3">
                            <i class="fa-solid fa-phone me-1"></i>{{ msg.phone }}
                          </a>
                          <span class="text-muted small">{{ msg.email }}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <span class="small text-muted">{{ msg.created_at | date:'dd-MMM-yyyy HH:mm' }}</span>
                          @if (!msg.is_resolved) {
                            <button class="btn btn-sm btn-success" (click)="resolveMsg(msg)">
                              <i class="fa-solid fa-check me-1"></i>Mark Resolved
                            </button>
                          } @else {
                            <span class="badge bg-success">Resolved</span>
                          }
                        </div>
                      </div>
                      <p class="mt-2 mb-0 text-muted small">{{ msg.message }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- CLERK TAB: Admissions (read-only view) -->
        @if (activeTab === 'admissions') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <h4 class="fw-bold mb-4">
                <i class="fa-solid fa-user-plus text-warning me-2"></i>Admission Applications 2026–27
              </h4>
              <ng-container *ngTemplateOutlet="admissionsTable"></ng-container>
            </div>
          </div>
        }
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TRUSTEE DASHBOARD -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (userRole === 'TRUSTEE') {
        <ul class="nav nav-pills custom-pills mb-4 flex-wrap">
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='dash'" (click)="activeTab='dash'"><i class="fa-solid fa-chart-line me-2"></i>Executive Overview</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='admissions'" (click)="activeTab='admissions'"><i class="fa-solid fa-user-plus me-2"></i>All Admissions</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='fees'" (click)="activeTab='fees'"><i class="fa-solid fa-indian-rupee-sign me-2"></i>Financial Reports</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='analytics'" (click)="activeTab='analytics'"><i class="fa-solid fa-chart-pie me-2"></i>School Analytics</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='visitors'" (click)="activeTab='visitors'"><i class="fa-solid fa-globe me-2"></i>Website & Leads</button></li>
        </ul>

        <!-- TRUSTEE TAB: Executive Overview -->
        @if (activeTab === 'dash') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-gold">
                  <div class="kpi-icon"><i class="fa-solid fa-user-graduate"></i></div>
                  <div class="kpi-value">{{ analytics?.total_students || 1250 }}</div>
                  <div class="kpi-label">Total Students Enrolled</div>
                  <div class="kpi-sub text-success"><i class="fa-solid fa-arrow-trend-up me-1"></i>+48 this year</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-success">
                  <div class="kpi-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                  <div class="kpi-value">₹44.6L</div>
                  <div class="kpi-label">Fee Collected 2025–26</div>
                  <div class="kpi-sub text-success">92% of target</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-warning">
                  <div class="kpi-icon"><i class="fa-solid fa-file-circle-plus"></i></div>
                  <div class="kpi-value">{{ admissions.length }}</div>
                  <div class="kpi-label">Total Admission Applications</div>
                  <div class="kpi-sub">{{ approvedAdmissionCount }} approved</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-info">
                  <div class="kpi-icon"><i class="fa-solid fa-globe"></i></div>
                  <div class="kpi-value">{{ visitorLogs.length }}</div>
                  <div class="kpi-label">Website Enquiry Leads</div>
                  <div class="kpi-sub">from public visitors</div>
                </div>
              </div>
            </div>

            <!-- Institution Health Summary -->
            <div class="row g-4">
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-4"><i class="fa-solid fa-chart-bar text-warning me-2"></i>Class-wise Enrollment</h5>
                  @for (cls of classStats; track cls.name) {
                    <div class="mb-3">
                      <div class="d-flex justify-content-between small mb-1">
                        <span class="fw-semibold">{{ cls.name }}</span>
                        <span class="text-muted">{{ cls.enrolled }}/{{ cls.capacity }}</span>
                      </div>
                      <div class="progress" style="height:10px">
                        <div class="progress-bar bg-warning"
                          [style.width.%]="(cls.enrolled / cls.capacity) * 100"
                          [class.bg-danger]="(cls.enrolled / cls.capacity) < 0.7">
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-wallet text-warning me-2"></i>Financial Summary</h5>
                  <div class="financial-row">
                    <span>Annual Fee Target</span>
                    <strong class="text-success">₹48,50,000</strong>
                  </div>
                  <div class="financial-row">
                    <span>Collected Till Date</span>
                    <strong class="text-success">₹44,56,500</strong>
                  </div>
                  <div class="financial-row">
                    <span>Pending Collection</span>
                    <strong class="text-warning">₹3,93,500</strong>
                  </div>
                  <div class="financial-row">
                    <span>Overdue Students</span>
                    <strong class="text-danger">32</strong>
                  </div>
                  <div class="financial-row">
                    <span>Collection %</span>
                    <strong class="text-success">92%</strong>
                  </div>
                  <div class="progress mt-3" style="height:12px">
                    <div class="progress-bar bg-success" style="width:92%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TRUSTEE TAB: All Admissions -->
        @if (activeTab === 'admissions') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <h4 class="fw-bold mb-0">
                  <i class="fa-solid fa-user-check text-warning me-2"></i>All Admission Applications — 2026–27
                </h4>
                <div class="d-flex gap-2 flex-wrap">
                  <span class="badge bg-warning text-dark px-3 py-2">{{ submittedAdmissionCount }} Pending</span>
                  <span class="badge bg-success px-3 py-2">{{ approvedAdmissionCount }} Approved</span>
                  <span class="badge bg-secondary px-3 py-2">{{ admissions.length }} Total</span>
                </div>
              </div>
              <ng-container *ngTemplateOutlet="admissionsTable"></ng-container>
            </div>
          </div>
        }

        <!-- TRUSTEE TAB: Financial Reports -->
        @if (activeTab === 'fees') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <div class="col-md-4">
                <div class="spm-card text-center">
                  <i class="fa-solid fa-circle-check fs-2 text-success mb-2"></i>
                  <h4 class="fw-bold">₹44,56,500</h4>
                  <p class="text-muted small">Total Collected (2025–26)</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="spm-card text-center">
                  <i class="fa-solid fa-hourglass-half fs-2 text-warning mb-2"></i>
                  <h4 class="fw-bold">₹3,93,500</h4>
                  <p class="text-muted small">Pending Collection</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="spm-card text-center">
                  <i class="fa-solid fa-calendar-xmark fs-2 text-danger mb-2"></i>
                  <h4 class="fw-bold">32</h4>
                  <p class="text-muted small">Overdue Students</p>
                </div>
              </div>
            </div>
            <div class="spm-card">
              <h5 class="fw-bold mb-4"><i class="fa-solid fa-file-invoice-dollar text-warning me-2"></i>Class-wise Fee Collection</h5>
              @for (cls of classStats; track cls.name) {
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div style="min-width:220px" class="small fw-semibold">{{ cls.name }}</div>
                  <div class="flex-grow-1">
                    <div class="progress" style="height:14px">
                      <div class="progress-bar bg-success" [style.width.%]="cls.feeCollected">
                        <span class="small ms-1">{{ cls.feeCollected }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="small text-muted" style="min-width:80px">{{ cls.enrolled }} students</div>
                </div>
              }
            </div>
          </div>
        }

        <!-- TRUSTEE TAB: School Analytics -->
        @if (activeTab === 'analytics') {
          <div class="animate-fade-in">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-users text-warning me-2"></i>Student Statistics</h5>
                  <div class="stat-row"><span>Active Students</span><strong>{{ analytics?.total_students || 1250 }}</strong></div>
                  <div class="stat-row"><span>Teaching Faculty</span><strong>{{ analytics?.total_teachers || 68 }}</strong></div>
                  <div class="stat-row"><span>Support Staff</span><strong>24</strong></div>
                  <div class="stat-row"><span>Total Classes</span><strong>28</strong></div>
                  <div class="stat-row"><span>Avg Students/Class</span><strong>44.6</strong></div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-trophy text-warning me-2"></i>Academic Performance</h5>
                  <div class="stat-row"><span>Pass % (Last Exam)</span><strong class="text-success">96.8%</strong></div>
                  <div class="stat-row"><span>Distinction Count</span><strong class="text-success">127</strong></div>
                  <div class="stat-row"><span>Avg Attendance</span><strong class="text-info">91.4%</strong></div>
                  <div class="stat-row"><span>Sports Achievements</span><strong>14 medals</strong></div>
                  <div class="stat-row"><span>Events This Year</span><strong>{{ analytics?.total_events || 18 }}</strong></div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TRUSTEE TAB: Website & Visitor Leads -->
        @if (activeTab === 'visitors') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <h4 class="fw-bold mb-4">
                <i class="fa-solid fa-globe text-warning me-2"></i>Website Enquiries & Visitor Leads Summary
              </h4>
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="mini-kpi">
                    <div class="mini-kpi-val">{{ visitorLogs.length }}</div>
                    <div class="mini-kpi-label">Total Leads</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mini-kpi mini-kpi-danger">
                    <div class="mini-kpi-val">{{ uncontactedLeads }}</div>
                    <div class="mini-kpi-label">Pending Follow-up</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mini-kpi mini-kpi-success">
                    <div class="mini-kpi-val">{{ visitorLogs.length - uncontactedLeads }}</div>
                    <div class="mini-kpi-label">Contacted</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="mini-kpi mini-kpi-info">
                    <div class="mini-kpi-val">{{ contactMessages.length }}</div>
                    <div class="mini-kpi-label">Contact Messages</div>
                  </div>
                </div>
              </div>
              <h6 class="fw-bold mb-3">Recent Visitor Enquiries</h6>
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th class="text-warning">📱 Mobile</th><th>Name</th><th>Purpose</th><th>Time</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (v of visitorLogs; track v.id) {
                      <tr>
                        <td><a [href]="'tel:' + v.phone" class="phone-highlight">{{ v.phone }}</a></td>
                        <td>{{ v.name }}</td>
                        <td><span class="badge bg-secondary">{{ v.purpose_display || v.purpose }}</span></td>
                        <td class="small text-muted">{{ formatTime(v.visited_at) }}</td>
                        <td><span class="badge" [class.bg-danger]="!v.is_contacted" [class.bg-success]="v.is_contacted">{{ v.is_contacted ? 'Contacted' : 'New' }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- PRINCIPAL DASHBOARD -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (userRole === 'PRINCIPAL') {
        <ul class="nav nav-pills custom-pills mb-4 flex-wrap">
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='dash'" (click)="activeTab='dash'"><i class="fa-solid fa-gauge me-2"></i>Overview</button></li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab==='leaves'" (click)="activeTab='leaves'">
              <i class="fa-solid fa-calendar-check me-2"></i>Leave Management
              @if (pendingLeavesCount > 0) { <span class="badge bg-danger ms-1">{{ pendingLeavesCount }}</span> }
            </button>
          </li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='documents'" (click)="activeTab='documents'"><i class="fa-solid fa-stamp me-2"></i>Doc Approvals</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='academic'" (click)="activeTab='academic'"><i class="fa-solid fa-graduation-cap me-2"></i>Academics</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='cms'" (click)="activeTab='cms'"><i class="fa-solid fa-sliders me-2"></i>CMS Engine</button></li>
        </ul>

        <!-- PRINCIPAL TAB: Overview -->
        @if (activeTab === 'dash') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-gold">
                  <div class="kpi-icon"><i class="fa-solid fa-user-graduate"></i></div>
                  <div class="kpi-value">{{ analytics?.total_students || 1250 }}</div>
                  <div class="kpi-label">Active Students</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-info">
                  <div class="kpi-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
                  <div class="kpi-value">{{ analytics?.total_teachers || 68 }}</div>
                  <div class="kpi-label">Teaching Faculty</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-danger" (click)="activeTab='leaves'">
                  <div class="kpi-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
                  <div class="kpi-value">{{ pendingLeavesCount }}</div>
                  <div class="kpi-label">Pending Leave Apps</div>
                  <div class="kpi-sub">Click to review ↗</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-warning" (click)="activeTab='documents'">
                  <div class="kpi-icon"><i class="fa-solid fa-file-circle-check"></i></div>
                  <div class="kpi-value">{{ pendingDocCount }}</div>
                  <div class="kpi-label">Doc Requests</div>
                  <div class="kpi-sub">Awaiting approval</div>
                </div>
              </div>
            </div>

            <div class="row g-4">
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-calendar-check text-warning me-2"></i>Pending Leave Applications</h5>
                  @for (leave of pendingLeaves; track leave.id) {
                    <div class="leave-item">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{{ leave.applicant_name }}</strong>
                          <span class="badge ms-2" [class.bg-primary]="leave.role==='TEACHER'" [class.bg-secondary]="leave.role!=='TEACHER'">{{ leave.role }}</span>
                          <div class="small text-muted">{{ leave.leave_type }} | {{ leave.start_date }} to {{ leave.end_date }}</div>
                          <div class="small text-muted mt-1">{{ leave.reason }}</div>
                        </div>
                        <div class="d-flex gap-1">
                          <button class="btn btn-sm btn-success" (click)="approveLeave(leave)">✓</button>
                          <button class="btn btn-sm btn-outline-danger" (click)="rejectLeave(leave)">✗</button>
                        </div>
                      </div>
                    </div>
                  }
                  @if (pendingLeaves.length === 0) {
                    <div class="text-center text-muted py-3"><i class="fa-solid fa-circle-check fs-3 text-success mb-2 d-block"></i>No pending leave applications</div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-chart-bar text-warning me-2"></i>School Snapshot</h5>
                  <div class="stat-row"><span>Upcoming Events</span><strong>{{ analytics?.upcoming_events || 6 }}</strong></div>
                  <div class="stat-row"><span>Active Homeworks</span><strong>18</strong></div>
                  <div class="stat-row"><span>Total Sections</span><strong>28</strong></div>
                  <div class="stat-row"><span>Avg Attendance (Week)</span><strong class="text-success">91.4%</strong></div>
                  <div class="stat-row"><span>Published Results</span><strong>1,820</strong></div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- PRINCIPAL TAB: Leave Management -->
        @if (activeTab === 'leaves') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <h4 class="fw-bold mb-0">
                  <i class="fa-solid fa-calendar-check text-warning me-2"></i>Leave Application Management
                </h4>
                <div class="d-flex gap-2">
                  <span class="badge bg-warning text-dark px-3 py-2">{{ pendingLeavesCount }} Pending</span>
                  <span class="badge bg-success px-3 py-2">{{ approvedLeavesCount }} Approved</span>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Applicant</th><th>Role</th><th>Leave Type</th>
                      <th>Dates</th><th>Reason</th><th>Applied On</th>
                      <th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (leave of leaves; track leave.id) {
                      <tr>
                        <td><strong>{{ leave.applicant_name }}</strong></td>
                        <td>
                          <span class="badge" [class.bg-primary]="leave.role==='TEACHER'" [class.bg-secondary]="leave.role!=='TEACHER'">
                            {{ leave.role }}
                          </span>
                        </td>
                        <td>{{ leave.leave_type }}</td>
                        <td class="small">
                          <i class="fa-solid fa-calendar me-1 text-muted"></i>
                          {{ leave.start_date }} → {{ leave.end_date }}
                        </td>
                        <td class="small text-muted" style="max-width:200px">{{ leave.reason }}</td>
                        <td class="small text-muted">{{ leave.applied_at | date:'dd-MMM-yyyy' }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-warning]="leave.status === 'Pending'"
                            [class.text-dark]="leave.status === 'Pending'"
                            [class.bg-success]="leave.status === 'Approved'"
                            [class.bg-danger]="leave.status === 'Rejected'">
                            {{ leave.status }}
                          </span>
                          @if (leave.reviewed_by) {
                            <div class="small text-muted">by {{ leave.reviewed_by }}</div>
                          }
                        </td>
                        <td>
                          @if (leave.status === 'Pending') {
                            <button class="btn btn-sm btn-success me-1" (click)="approveLeave(leave)">
                              <i class="fa-solid fa-check me-1"></i>Approve
                            </button>
                            <button class="btn btn-sm btn-outline-danger" (click)="rejectLeave(leave)">
                              <i class="fa-solid fa-xmark"></i>
                            </button>
                          } @else {
                            <span class="small text-muted">No action</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- PRINCIPAL TAB: Document Approvals (countersign) -->
        @if (activeTab === 'documents') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <h4 class="fw-bold mb-4">
                <i class="fa-solid fa-stamp text-warning me-2"></i>Certificate & Document Approvals
              </h4>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Req No</th><th>Student</th><th>GR No</th><th>Certificate</th><th>Purpose</th><th>Applied</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (doc of documentRequests; track doc.id) {
                      <tr>
                        <td><strong class="text-warning">{{ doc.request_number }}</strong></td>
                        <td>{{ doc.student_name }}</td>
                        <td><span class="badge bg-secondary">{{ doc.gr_number }}</span></td>
                        <td>{{ doc.doc_type_display || doc.document_type }}</td>
                        <td class="small text-muted">{{ doc.purpose }}</td>
                        <td class="small text-muted">{{ doc.applied_at | date:'dd-MMM-yyyy' }}</td>
                        <td>
                          <span class="badge"
                            [class.bg-warning]="doc.status==='Applied'" [class.text-dark]="doc.status==='Applied'"
                            [class.bg-success]="doc.status==='Approved'||doc.status==='Issued'"
                            [class.bg-danger]="doc.status==='Rejected'">{{ doc.status }}</span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-gold me-1" (click)="approveDoc(doc)"
                            [disabled]="doc.status==='Approved'||doc.status==='Issued'">
                            <i class="fa-solid fa-stamp me-1"></i>Approve
                          </button>
                          <button class="btn btn-sm btn-outline-primary" (click)="downloadDocPdf(doc)">
                            <i class="fa-solid fa-file-pdf"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- PRINCIPAL TAB: Academics -->
        @if (activeTab === 'academic') {
          <div class="animate-fade-in">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-chart-bar text-warning me-2"></i>Class-wise Enrollment</h5>
                  @for (cls of classStats; track cls.name) {
                    <div class="mb-3">
                      <div class="d-flex justify-content-between small mb-1">
                        <span class="fw-semibold">{{ cls.name }}</span>
                        <span class="text-muted">{{ cls.enrolled }}/{{ cls.capacity }}</span>
                      </div>
                      <div class="progress" style="height:10px">
                        <div class="progress-bar bg-warning" [style.width.%]="(cls.enrolled / cls.capacity) * 100"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-book-open text-warning me-2"></i>Academic Summary</h5>
                  <div class="stat-row"><span>Total Classes (Sections)</span><strong>28</strong></div>
                  <div class="stat-row"><span>Active Homework Assignments</span><strong>18</strong></div>
                  <div class="stat-row"><span>Published Exam Results</span><strong>1,820</strong></div>
                  <div class="stat-row"><span>Avg Class Attendance</span><strong class="text-success">91.4%</strong></div>
                  <div class="stat-row"><span>Overall Pass Rate</span><strong class="text-success">96.8%</strong></div>
                  <div class="stat-row"><span>Students with Distinction</span><strong class="text-success">127</strong></div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- PRINCIPAL TAB: CMS Engine -->
        @if (activeTab === 'cms') {
          <div class="animate-fade-in">
            <div class="spm-card mb-4">
              <h4 class="fw-bold mb-2"><i class="fa-solid fa-sliders text-warning me-2"></i>Website Content Management System</h4>
              <p class="text-muted small mb-4">Edit homepage hero banners, notices, and announcements — live, without touching code.</p>

              <div class="border rounded-3 p-4 mb-4 bg-warning bg-opacity-10 border-warning border-opacity-25">
                <h6 class="fw-bold mb-3"><i class="fa-solid fa-bullhorn me-2 text-warning"></i>Post New Announcement</h6>
                <div class="row g-3">
                  <div class="col-md-4">
                    <input type="text" class="form-control" [(ngModel)]="newAnnouncement.title" placeholder="Announcement Title">
                  </div>
                  <div class="col-md-3">
                    <select class="form-select" [(ngModel)]="newAnnouncement.category">
                      <option value="General">General Notice</option>
                      <option value="Exam">Exam Announcement</option>
                      <option value="Holiday">Holiday / Vacation</option>
                      <option value="Admission">Admission Notice</option>
                      <option value="Event">Event Announcement</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <input type="text" class="form-control" [(ngModel)]="newAnnouncement.content" placeholder="Short message content...">
                  </div>
                  <div class="col-md-2">
                    <button class="btn btn-gold w-100" (click)="postAnnouncement()">
                      <i class="fa-solid fa-paper-plane me-1"></i>Post
                    </button>
                  </div>
                </div>
              </div>

              <h6 class="fw-bold mb-3">Current Active Announcements</h6>
              <div class="row g-3 mb-4">
                @for (ann of announcements; track $index) {
                  <div class="col-md-6">
                    <div class="d-flex align-items-start gap-3 p-3 border rounded-3">
                      <span class="badge bg-warning text-dark mt-1">{{ ann.category }}</span>
                      <div class="flex-grow-1">
                        <div class="fw-semibold small">{{ ann.title }}</div>
                        <div class="text-muted" style="font-size:0.78rem">{{ ann.content }}</div>
                      </div>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteAnnouncement($index)">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="spm-card">
              <h5 class="fw-bold mb-3"><i class="fa-solid fa-images text-warning me-2"></i>Homepage Hero Banner Management</h5>
              <div class="row g-4">
                @for (slide of slides; track slide.id) {
                  <div class="col-md-6">
                    <div class="glass-card p-3">
                      <img [src]="slide.image_url" class="w-100 rounded mb-2" style="height:140px;object-fit:cover" [alt]="slide.title">
                      <label class="form-label small fw-semibold">Slide Title</label>
                      <input type="text" class="form-control form-control-sm mb-2" [(ngModel)]="slide.title">
                      <label class="form-label small fw-semibold">Subtitle</label>
                      <input type="text" class="form-control form-control-sm mb-2" [(ngModel)]="slide.subtitle">
                      <button class="btn btn-sm btn-gold w-100" (click)="saveCms(slide)">
                        <i class="fa-solid fa-floppy-disk me-1"></i>Save Banner
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TEACHER DASHBOARD -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (userRole === 'TEACHER') {
        <ul class="nav nav-pills custom-pills mb-4 flex-wrap">
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='dash'" (click)="activeTab='dash'"><i class="fa-solid fa-gauge me-2"></i>Overview</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='attendance'" (click)="activeTab='attendance'"><i class="fa-solid fa-user-check me-2"></i>Mark Attendance</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='homework'" (click)="activeTab='homework'"><i class="fa-solid fa-book me-2"></i>Homework & Assignments</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='timetable'" (click)="activeTab='timetable'"><i class="fa-solid fa-calendar-days me-2"></i>Class Timetable</button></li>
          <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='students'" (click)="activeTab='students'"><i class="fa-solid fa-graduation-cap me-2"></i>Student Roster</button></li>
        </ul>

        <!-- TEACHER TAB: Overview -->
        @if (activeTab === 'dash') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-gold" (click)="activeTab='attendance'">
                  <div class="kpi-icon"><i class="fa-solid fa-user-check"></i></div>
                  <div class="kpi-value">{{ studentsList.length }}</div>
                  <div class="kpi-label">Class Students</div>
                  <div class="kpi-sub text-success">Grade 5 - Section A</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-info" (click)="activeTab='homework'">
                  <div class="kpi-icon"><i class="fa-solid fa-book-open"></i></div>
                  <div class="kpi-value">{{ teacherHomework.length }}</div>
                  <div class="kpi-label">Active Assignments</div>
                  <div class="kpi-sub">Mathematics & Science</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-warning" (click)="activeTab='timetable'">
                  <div class="kpi-icon"><i class="fa-solid fa-clock"></i></div>
                  <div class="kpi-value">5</div>
                  <div class="kpi-label">Periods Today</div>
                  <div class="kpi-sub">Next: Mathematics (10:00 AM)</div>
                </div>
              </div>
              <div class="col-6 col-lg-3">
                <div class="kpi-card kpi-success">
                  <div class="kpi-icon"><i class="fa-solid fa-circle-check"></i></div>
                  <div class="kpi-value">94%</div>
                  <div class="kpi-label">Monthly Attendance</div>
                  <div class="kpi-sub text-success">Class average</div>
                </div>
              </div>
            </div>

            <!-- Quick Action Cards -->
            <div class="row g-4">
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-bolt text-warning me-2"></i>Quick Attendance Action</h5>
                  <p class="text-muted small">Mark daily roll-call for your assigned class section.</p>
                  <div class="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light bg-opacity-10 mb-3">
                    <div>
                      <strong>Grade 5 - Section A</strong>
                      <div class="small text-muted">{{ studentsList.length }} enrolled students</div>
                    </div>
                    <button class="btn btn-gold btn-sm" (click)="activeTab='attendance'">
                      <i class="fa-solid fa-arrow-right me-1"></i>Take Attendance
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3"><i class="fa-solid fa-pen-to-square text-warning me-2"></i>Assign New Homework</h5>
                  <p class="text-muted small">Publish homework and project work directly to the student portal.</p>
                  <div class="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light bg-opacity-10 mb-3">
                    <div>
                      <strong>Post Assignment</strong>
                      <div class="small text-muted">Maths, Science, English, EVS</div>
                    </div>
                    <button class="btn btn-gold btn-sm" (click)="activeTab='homework'">
                      <i class="fa-solid fa-plus me-1"></i>Create Homework
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TEACHER TAB: Attendance -->
        @if (activeTab === 'attendance') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <div>
                  <h4 class="fw-bold mb-1">
                    <i class="fa-solid fa-user-check text-warning me-2"></i>Daily Student Attendance
                  </h4>
                  <div class="text-muted small">Select class, section, and date to mark student presence.</div>
                </div>
                <div class="d-flex gap-2 flex-wrap align-items-center">
                  <div>
                    <label class="form-label small fw-semibold mb-1 d-block">Section</label>
                    <select class="form-select form-select-sm" [(ngModel)]="selectedSection" (change)="loadStudentsForSection()">
                      @for (sec of sections; track sec.id) {
                        <option [value]="sec.id">{{ sec.academic_class_name }} - Section {{ sec.name }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="form-label small fw-semibold mb-1 d-block">Date</label>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="attendanceDate">
                  </div>
                  <div class="align-self-end">
                    <button class="btn btn-gold btn-sm" (click)="saveAllAttendance()">
                      <i class="fa-solid fa-floppy-disk me-1"></i>Save All Attendance
                    </button>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>GR Number</th>
                      <th>Status Selection</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (stu of studentsList; track stu.id) {
                      <tr>
                        <td><strong class="text-warning">#{{ stu.roll_number || stu.id }}</strong></td>
                        <td>
                          <strong>{{ stu.user?.full_name || (stu.user?.first_name + ' ' + stu.user?.last_name) }}</strong>
                          <div class="small text-muted">{{ stu.user?.email }}</div>
                        </td>
                        <td><span class="badge bg-secondary">{{ stu.gr_number }}</span></td>
                        <td>
                          <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn"
                              [class.btn-success]="attendanceStatuses[stu.id] === 'Present'"
                              [class.btn-outline-success]="attendanceStatuses[stu.id] !== 'Present'"
                              (click)="setStudentStatus(stu.id, 'Present')">
                              Present
                            </button>
                            <button type="button" class="btn"
                              [class.btn-danger]="attendanceStatuses[stu.id] === 'Absent'"
                              [class.btn-outline-danger]="attendanceStatuses[stu.id] !== 'Absent'"
                              (click)="setStudentStatus(stu.id, 'Absent')">
                              Absent
                            </button>
                            <button type="button" class="btn"
                              [class.btn-warning]="attendanceStatuses[stu.id] === 'Late'"
                              [class.btn-outline-warning]="attendanceStatuses[stu.id] !== 'Late'"
                              (click)="setStudentStatus(stu.id, 'Late')">
                              Late
                            </button>
                          </div>
                        </td>
                        <td>
                          <input type="text" class="form-control form-control-sm"
                            [(ngModel)]="attendanceRemarks[stu.id]"
                            placeholder="Optional remark">
                        </td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" (click)="saveSingleAttendance(stu)">
                            <i class="fa-solid fa-check"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TEACHER TAB: Homework -->
        @if (activeTab === 'homework') {
          <div class="animate-fade-in">
            <div class="row g-4 mb-4">
              <!-- Create Homework Form -->
              <div class="col-lg-5">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3">
                    <i class="fa-solid fa-plus-circle text-warning me-2"></i>Post New Homework
                  </h5>
                  <form (ngSubmit)="submitHomeworkForm()">
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Class & Section</label>
                      <select class="form-select form-select-sm" [(ngModel)]="newHomework.section" name="hwSection">
                        @for (sec of sections; track sec.id) {
                          <option [value]="sec.id">{{ sec.academic_class_name }} - Section {{ sec.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Subject</label>
                      <select class="form-select form-select-sm" [(ngModel)]="newHomework.subject" name="hwSubject">
                        @for (sub of subjectsList; track sub.id) {
                          <option [value]="sub.id">{{ sub.name }} ({{ sub.code }})</option>
                        }
                      </select>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Assignment Title</label>
                      <input type="text" class="form-control form-control-sm" [(ngModel)]="newHomework.title" name="hwTitle" placeholder="e.g. Chapter 5 Practice Problems" required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Due Date</label>
                      <input type="date" class="form-control form-control-sm" [(ngModel)]="newHomework.due_date" name="hwDueDate" required>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-semibold">Instructions & Description</label>
                      <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="newHomework.description" name="hwDesc" placeholder="Provide detailed instructions for the students..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-gold w-100" [disabled]="!newHomework.title || !newHomework.due_date">
                      <i class="fa-solid fa-paper-plane me-1"></i>Publish Homework
                    </button>
                  </form>
                </div>
              </div>

              <!-- Active Homework List -->
              <div class="col-lg-7">
                <div class="spm-card">
                  <h5 class="fw-bold mb-3">
                    <i class="fa-solid fa-book-open text-warning me-2"></i>Active Homework Assignments
                  </h5>
                  <div class="d-flex flex-column gap-3">
                    @for (hw of teacherHomework; track hw.id) {
                      <div class="p-3 border rounded-3 bg-light bg-opacity-10">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span class="badge bg-primary me-2">{{ hw.subject_name }}</span>
                            <span class="badge bg-secondary">{{ hw.section_display || 'Grade 5 - Section A' }}</span>
                            <h6 class="fw-bold mt-2 mb-1">{{ hw.title }}</h6>
                          </div>
                          <div class="text-end">
                            <div class="small text-danger fw-semibold">
                              <i class="fa-solid fa-clock me-1"></i>Due: {{ hw.due_date }}
                            </div>
                            <span class="badge bg-success mt-1">Active</span>
                          </div>
                        </div>
                        <p class="small text-muted mb-0">{{ hw.description }}</p>
                      </div>
                    }
                    @if (teacherHomework.length === 0) {
                      <div class="text-center text-muted py-4">
                        <i class="fa-solid fa-book-open fs-2 mb-2 d-block text-warning"></i>
                        No homework assignments posted yet.
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TEACHER TAB: Timetable -->
        @if (activeTab === 'timetable') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <h4 class="fw-bold mb-4">
                <i class="fa-solid fa-calendar-days text-warning me-2"></i>Weekly Faculty Schedule & Periods
              </h4>
              <div class="table-responsive">
                <table class="table table-bordered align-middle text-center">
                  <thead class="table-dark">
                    <tr>
                      <th style="width: 15%">Day</th>
                      <th>Period 1<br><small class="fw-normal text-muted">09:00 - 09:45</small></th>
                      <th>Period 2<br><small class="fw-normal text-muted">09:45 - 10:30</small></th>
                      <th class="bg-secondary text-white" style="width:8%">Break<br><small>10:30-10:50</small></th>
                      <th>Period 3<br><small class="fw-normal text-muted">10:50 - 11:35</small></th>
                      <th>Period 4<br><small class="fw-normal text-muted">11:35 - 12:20</small></th>
                      <th>Period 5<br><small class="fw-normal text-muted">01:00 - 01:45</small></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of weeklySchedule; track item.day) {
                      <tr>
                        <td class="fw-bold text-start bg-light bg-opacity-10">{{ item.day }}</td>
                        <td>
                          <span class="fw-semibold text-warning d-block">{{ item.p1.subject }}</span>
                          <small class="text-muted">{{ item.p1.class }}</small>
                        </td>
                        <td>
                          <span class="fw-semibold text-warning d-block">{{ item.p2.subject }}</span>
                          <small class="text-muted">{{ item.p2.class }}</small>
                        </td>
                        <td class="bg-secondary bg-opacity-25 small text-muted">Recess</td>
                        <td>
                          <span class="fw-semibold text-warning d-block">{{ item.p3.subject }}</span>
                          <small class="text-muted">{{ item.p3.class }}</small>
                        </td>
                        <td>
                          <span class="fw-semibold text-warning d-block">{{ item.p4.subject }}</span>
                          <small class="text-muted">{{ item.p4.class }}</small>
                        </td>
                        <td>
                          <span class="fw-semibold text-warning d-block">{{ item.p5.subject }}</span>
                          <small class="text-muted">{{ item.p5.class }}</small>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TEACHER TAB: Student Roster -->
        @if (activeTab === 'students') {
          <div class="animate-fade-in">
            <div class="spm-card">
              <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                <h4 class="fw-bold mb-0">
                  <i class="fa-solid fa-graduation-cap text-warning me-2"></i>Class Student Roster (Grade 5 - Section A)
                </h4>
                <span class="badge bg-gold text-dark px-3 py-2 fw-bold">{{ studentsList.length }} Students Registered</span>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>GR Number</th>
                      <th>Blood Group</th>
                      <th>Father / Guardian</th>
                      <th>Emergency Contact</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (stu of studentsList; track stu.id) {
                      <tr>
                        <td><strong class="text-warning">#{{ stu.roll_number || stu.id }}</strong></td>
                        <td><strong>{{ stu.user?.full_name || (stu.user?.first_name + ' ' + stu.user?.last_name) }}</strong></td>
                        <td><span class="badge bg-secondary">{{ stu.gr_number }}</span></td>
                        <td><span class="badge bg-info text-dark">{{ stu.blood_group || 'O+' }}</span></td>
                        <td>{{ stu.father_name || 'Guardian' }}</td>
                        <td>
                          <a [href]="'tel:' + stu.guardian_contact" class="phone-highlight-sm">
                            <i class="fa-solid fa-phone me-1"></i>{{ stu.guardian_contact }}
                          </a>
                        </td>
                        <td><span class="badge bg-success">Active</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      }

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- FALLBACK: Staff not in specific roles -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      @if (userRole !== 'CLERK' && userRole !== 'TRUSTEE' && userRole !== 'PRINCIPAL' && userRole !== 'TEACHER') {
        <div class="spm-card text-center py-5">
          <i class="fa-solid fa-lock fs-1 text-warning mb-3 d-block"></i>
          <h4>Access Restricted</h4>
          <p class="text-muted">Your role ({{ userRole }}) does not have an admin panel. Please contact the administrator.</p>
        </div>
      }
    </div>

    <!-- Shared Admissions Table Template -->
    <ng-template #admissionsTable>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-dark">
            <tr><th>App No</th><th>Applicant</th><th>Class</th><th>Parent</th><th>Phone</th><th>Prev School</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            @for (app of admissions; track app.id) {
              <tr>
                <td><strong class="text-warning">{{ app.application_number }}</strong></td>
                <td>{{ app.applicant_name }}</td>
                <td><span class="badge bg-secondary">{{ app.class_name || 'Grade 1' }}</span></td>
                <td>{{ app.parent_name }}</td>
                <td>
                  <a [href]="'tel:' + app.parent_phone" class="phone-highlight-sm">{{ app.parent_phone }}</a>
                </td>
                <td class="small text-muted">{{ app.previous_school || '—' }}</td>
                <td>
                  <span class="badge"
                    [class.bg-success]="app.status==='Approved'"
                    [class.bg-danger]="app.status==='Rejected'"
                    [class.bg-info]="app.status==='Under_Review'"
                    [class.bg-warning]="app.status==='Submitted'"
                    [class.text-dark]="app.status==='Submitted'">
                    {{ app.status }}
                  </span>
                </td>
                <td class="small text-muted">{{ app.created_at | date:'dd-MMM-yy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </ng-template>

    <!-- Floating AI Assistant -->
    <app-ai-assistant></app-ai-assistant>
  `,
  styles: [`
    /* ── Portal Header ─────────────────────────────────────── */
    .portal-header {
      padding: 1rem 0;
      background: linear-gradient(135deg, #0F2027 0%, #203A43 60%, #1a2a3a 100%);
      border-bottom: 1px solid rgba(212,175,55,0.25);
    }
    .avatar-box {
      width:52px; height:52px;
      background: rgba(212,175,55,0.15);
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      border:1px solid var(--primary-gold);
      flex-shrink:0;
    }
    .role-badge { background: var(--primary-gold); color:#0F2027; font-size:0.75rem; }
    .stat-chip {
      font-size:0.78rem; font-weight:600;
      padding:0.3rem 0.75rem; border-radius:20px;
      border-width:1px; border-style:solid;
    }

    /* ── Role Banner ───────────────────────────────────────── */
    .role-banner {
      background: linear-gradient(90deg, rgba(212,175,55,0.12), transparent);
      border-left: 4px solid var(--primary-gold);
      padding: 0.75rem 1.25rem;
      border-radius: 0 12px 12px 0;
      font-weight: 700; font-size: 1.1rem;
      color: var(--text-main);
    }

    /* ── Nav Pills ─────────────────────────────────────────── */
    .custom-pills .nav-link {
      color: var(--text-main); font-weight: 600;
      border-radius: 20px; padding: 0.5rem 1.25rem;
      margin-right: 0.5rem; margin-bottom: 0.5rem;
      transition: all 0.25s ease;
    }
    .custom-pills .nav-link.active {
      background: var(--primary-gold); color: #0F2027;
      box-shadow: 0 4px 12px rgba(212,175,55,0.3);
    }

    /* ── KPI Cards ─────────────────────────────────────────── */
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px; padding: 1.5rem 1rem;
      text-align: center;
      transition: all 0.3s ease; cursor: pointer;
      box-shadow: var(--shadow-sm);
    }
    .kpi-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .kpi-icon {
      width:56px; height:56px; border-radius:14px;
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 0.75rem; font-size:1.4rem;
    }
    .kpi-value { font-size:2rem; font-weight:800; color:var(--text-main); }
    .kpi-label { font-size:0.82rem; color:var(--text-muted); margin:0.25rem 0; }
    .kpi-sub { font-size:0.72rem; font-weight:600; margin-top:0.25rem; }

    .kpi-gold .kpi-icon { background:rgba(212,175,55,0.15); color:var(--primary-gold); }
    .kpi-danger .kpi-icon { background:rgba(220,53,69,0.15); color:#dc3545; }
    .kpi-warning .kpi-icon { background:rgba(255,193,7,0.15); color:#ffc107; }
    .kpi-info .kpi-icon { background:rgba(13,202,240,0.15); color:#0dcaf0; }
    .kpi-success .kpi-icon { background:rgba(25,135,84,0.15); color:#198754; }

    /* ── Phone Highlights ──────────────────────────────────── */
    .phone-highlight {
      display: inline-flex; align-items: center;
      background: rgba(220,53,69,0.12);
      color: #ff6b7a;
      border: 1px solid rgba(220,53,69,0.3);
      border-radius: 8px; padding: 0.35rem 0.75rem;
      font-weight: 700; font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .phone-highlight:hover {
      background: rgba(220,53,69,0.25);
      color: #ff4757;
      transform: scale(1.03);
    }
    .phone-highlight-sm {
      color: #ff6b7a; font-weight: 600;
      text-decoration: none;
    }
    .phone-highlight-sm:hover { color: #ff4757; text-decoration: underline; }

    /* ── New Lead Row Highlight ────────────────────────────── */
    .new-lead-row { border-left: 3px solid #dc3545; }
    .pulse-badge {
      animation: pulse-red 1.5s infinite;
    }
    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* ── Content Cards ─────────────────────────────────────── */
    .spm-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px; padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }

    /* ── Stat/Financial Rows ───────────────────────────────── */
    .stat-row, .financial-row {
      display:flex; justify-content:space-between; align-items:center;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.9rem;
    }
    .stat-row:last-child, .financial-row:last-child { border-bottom: none; }

    /* ── Message Card ──────────────────────────────────────── */
    .msg-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px; padding: 1rem 1.25rem;
      transition: border-color 0.2s;
    }
    .msg-unresolved { border-left: 4px solid #dc3545; }

    /* ── Leave Item ────────────────────────────────────────── */
    .leave-item {
      padding: 0.85rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .leave-item:last-child { border-bottom: none; }

    /* ── Mini KPI (Trustee panel) ──────────────────────────── */
    .mini-kpi {
      background: rgba(212,175,55,0.08);
      border: 1px solid rgba(212,175,55,0.2);
      border-radius:12px; padding:1rem; text-align:center;
    }
    .mini-kpi-val { font-size:1.8rem; font-weight:800; color:var(--primary-gold); }
    .mini-kpi-label { font-size:0.78rem; color:var(--text-muted); }
    .mini-kpi-danger .mini-kpi-val { color:#dc3545; }
    .mini-kpi-danger { border-color:rgba(220,53,69,0.2); background:rgba(220,53,69,0.06); }
    .mini-kpi-success .mini-kpi-val { color:#198754; }
    .mini-kpi-success { border-color:rgba(25,135,84,0.2); background:rgba(25,135,84,0.06); }
    .mini-kpi-info .mini-kpi-val { color:#0dcaf0; }
    .mini-kpi-info { border-color:rgba(13,202,240,0.2); background:rgba(13,202,240,0.06); }

    /* ── CMS Glass Card ────────────────────────────────────── */
    .glass-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }

    /* ── Animate ───────────────────────────────────────────── */
    .animate-fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    /* ── Gold Button ───────────────────────────────────────── */
    .btn-gold {
      background: var(--primary-gold); color: #0F2027;
      border: none; font-weight: 600;
    }
    .btn-gold:hover { background: #c8a000; color: #000; }
    .btn-gold:disabled { opacity:0.5; }
  `]
})
export class AdminPortalComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  activeTab = 'dash';
  analytics: DashboardAnalytics | null = null;
  private subs: Subscription[] = [];

  // Role detection
  get userRole(): string {
    return this.authService.currentUser()?.role || 'CLERK';
  }
  get roleLabel(): string {
    const labels: Record<string, string> = {
      CLERK: '🗂️ Clerk', TRUSTEE: '🏛️ Trustee', PRINCIPAL: '🏫 Principal',
      TEACHER: '📚 Teacher'
    };
    return labels[this.userRole] || this.userRole;
  }
  get roleIcon(): string {
    const icons: Record<string, string> = {
      CLERK: 'fa-solid fa-id-badge',
      TRUSTEE: 'fa-solid fa-landmark',
      PRINCIPAL: 'fa-solid fa-school',
      TEACHER: 'fa-solid fa-chalkboard-user',
    };
    return icons[this.userRole] || 'fa-solid fa-shield-halved';
  }

  // Reactive data
  documentRequests: DocumentRequest[] = [];
  admissions: (AdmissionApplication & { class_name?: string; created_at?: string })[] = [];
  visitorLogs: SiteVisitorLog[] = [];
  contactMessages: ContactMessage[] = [];
  leaves: LeaveApp[] = [];
  slides: HeroSlide[] = [];
  announcements: { title: string; category: string; content: string }[] = [
    { title: 'Annual Sports Day 2026', category: 'Event', content: 'Scheduled for March 15, 2026 at Jupiter School Grounds, Shendre Satara.' },
    { title: 'Term 2 Exam Date Sheet Released', category: 'Exam', content: 'Exams commence February 20, 2026. Download hall tickets from ERP portal.' },
    { title: 'School Closed — Republic Day', category: 'Holiday', content: 'School will remain closed on January 26, 2026 for Republic Day celebrations.' },
    { title: 'Online Admissions Open 2026–27', category: 'Admission', content: 'Applications for Nursery to Grade 9 are now open at the school portal.' },
  ];
  newAnnouncement = { title: '', category: 'General', content: '' };

  // Teacher Portal Data
  sections: any[] = [];
  selectedSection: number = 1;
  studentsList: any[] = [];
  subjectsList: any[] = [];
  teacherHomework: any[] = [];
  attendanceDate: string = new Date().toISOString().split('T')[0];
  attendanceStatuses: Record<number, string> = {};
  attendanceRemarks: Record<number, string> = {};
  newHomework = {
    section: 1,
    subject: 1,
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  };

  weeklySchedule = [
    {
      day: 'Monday',
      p1: { subject: 'Mathematics', class: 'Grade 5-A' },
      p2: { subject: 'General Science', class: 'Grade 5-A' },
      p3: { subject: 'Mathematics', class: 'Grade 10-A' },
      p4: { subject: 'Physics Lab', class: 'Grade 10-A' },
      p5: { subject: 'Remedial Math', class: 'Grade 5-A' }
    },
    {
      day: 'Tuesday',
      p1: { subject: 'General Science', class: 'Grade 5-A' },
      p2: { subject: 'Mathematics', class: 'Grade 5-A' },
      p3: { subject: 'Mathematics', class: 'Grade 10-A' },
      p4: { subject: 'Problem Solving', class: 'Grade 10-A' },
      p5: { subject: 'Free / Planning', class: 'Staff Room' }
    },
    {
      day: 'Wednesday',
      p1: { subject: 'Mathematics', class: 'Grade 5-A' },
      p2: { subject: 'Science Lab', class: 'Grade 5-A' },
      p3: { subject: 'Mathematics', class: 'Grade 10-A' },
      p4: { subject: 'Geometry', class: 'Grade 10-A' },
      p5: { subject: 'Activity Period', class: 'Ground' }
    },
    {
      day: 'Thursday',
      p1: { subject: 'Mathematics', class: 'Grade 5-A' },
      p2: { subject: 'Mental Math', class: 'Grade 5-A' },
      p3: { subject: 'Mathematics', class: 'Grade 10-A' },
      p4: { subject: 'Physics', class: 'Grade 10-A' },
      p5: { subject: 'Staff Meeting', class: 'Conference' }
    },
    {
      day: 'Friday',
      p1: { subject: 'General Science', class: 'Grade 5-A' },
      p2: { subject: 'Mathematics', class: 'Grade 5-A' },
      p3: { subject: 'Weekly Quiz', class: 'Grade 5-A' },
      p4: { subject: 'Mathematics', class: 'Grade 10-A' },
      p5: { subject: 'Evaluation', class: 'Staff Room' }
    },
  ];

  visitorFilter: 'all' | 'new' | 'done' = 'all';

  get filteredVisitorLogs() {
    if (this.visitorFilter === 'new') return this.visitorLogs.filter(v => !v.is_contacted);
    if (this.visitorFilter === 'done') return this.visitorLogs.filter(v => v.is_contacted);
    return this.visitorLogs;
  }
  get uncontactedLeads() { return this.visitorLogs.filter(v => !v.is_contacted).length; }
  get pendingDocCount() { return this.documentRequests.filter(d => d.status === 'Applied').length; }
  get approvedDocCount() { return this.documentRequests.filter(d => d.status === 'Approved' || d.status === 'Issued').length; }
  get unresolvedMsgs() { return this.contactMessages.filter(m => !m.is_resolved).length; }
  get pendingAdmissions() { return this.admissions.filter(a => a.status === 'Submitted').length; }
  get approvedAdmissionCount() { return this.admissions.filter(a => a.status === 'Approved').length; }
  get submittedAdmissionCount() { return this.admissions.filter(a => a.status === 'Submitted').length; }
  get pendingLeaves() { return this.leaves.filter(l => l.status === 'Pending'); }
  get pendingLeavesCount() { return this.pendingLeaves.length; }
  get approvedLeavesCount() { return this.leaves.filter(l => l.status === 'Approved').length; }

  classStats = [
    { name: 'Mini KG / Jr. KG / Sr. KG', enrolled: 85, capacity: 90, feeCollected: 94 },
    { name: 'Grade 1 to 3 (Primary)', enrolled: 320, capacity: 360, feeCollected: 91 },
    { name: 'Grade 4 to 5 (Upper Primary)', enrolled: 210, capacity: 240, feeCollected: 88 },
    { name: 'Grade 6 to 8 (Middle School)', enrolled: 390, capacity: 420, feeCollected: 95 },
    { name: 'Grade 9 to 10 (Secondary)', enrolled: 245, capacity: 280, feeCollected: 90 },
  ];

  ngOnInit() {
    this.apiService.getDashboardAnalytics().subscribe(d => this.analytics = d);
    this.apiService.getHeroSlides().subscribe(s => this.slides = s);

    // Hydrate all reactive stores from backend
    this.apiService.loadAllPortalData();

    if (this.userRole === 'TEACHER') {
      this.loadTeacherData();
    }

    this.subs.push(
      this.apiService.documentRequests$.subscribe(d => this.documentRequests = d),
      this.apiService.admissions$.subscribe(a => this.admissions = a as any),
      this.apiService.visitorLogs$.subscribe(v => this.visitorLogs = v),
      this.apiService.contactMessages$.subscribe(m => this.contactMessages = m),
      this.apiService.leaves$.subscribe(l => this.leaves = l),
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  // ── Teacher Portal Operations ─────────────────────────────────────────
  loadTeacherData() {
    this.apiService.getSections().subscribe(secs => {
      this.sections = secs;
      if (secs.length > 0 && !this.selectedSection) {
        this.selectedSection = secs[0].id;
      }
      this.loadStudentsForSection();
    });
    this.apiService.getSubjects().subscribe(subs => {
      this.subjectsList = subs;
      if (subs.length > 0 && !this.newHomework.subject) {
        this.newHomework.subject = subs[0].id;
      }
    });
    this.apiService.getHomework().subscribe(hw => {
      this.teacherHomework = hw;
    });
  }

  loadStudentsForSection() {
    this.apiService.getStudents({ section: this.selectedSection }).subscribe(stus => {
      this.studentsList = stus;
      stus.forEach(s => {
        if (!this.attendanceStatuses[s.id]) {
          this.attendanceStatuses[s.id] = 'Present';
        }
      });
    });
  }

  setStudentStatus(studentId: number, status: string) {
    this.attendanceStatuses[studentId] = status;
  }

  saveSingleAttendance(stu: any) {
    const status = this.attendanceStatuses[stu.id] || 'Present';
    const remarks = this.attendanceRemarks[stu.id] || '';
    this.apiService.markAttendanceRecord({
      student: stu.id,
      date: this.attendanceDate,
      status,
      remarks
    }).subscribe();
  }

  saveAllAttendance() {
    if (!this.studentsList.length) return;
    this.studentsList.forEach(stu => {
      this.saveSingleAttendance(stu);
    });
  }

  submitHomeworkForm() {
    if (!this.newHomework.title || !this.newHomework.due_date) return;
    this.apiService.createHomework({
      section: Number(this.newHomework.section),
      subject: Number(this.newHomework.subject),
      title: this.newHomework.title,
      description: this.newHomework.description,
      due_date: this.newHomework.due_date
    }).subscribe(() => {
      const subObj = this.subjectsList.find(s => s.id === Number(this.newHomework.subject));
      const secObj = this.sections.find(s => s.id === Number(this.newHomework.section));
      this.teacherHomework.unshift({
        id: Date.now(),
        title: this.newHomework.title,
        description: this.newHomework.description,
        subject_name: subObj?.name || 'Mathematics',
        section_display: secObj ? `${secObj.academic_class_name} - Section ${secObj.name}` : 'Grade 5 - Section A',
        due_date: this.newHomework.due_date,
        is_active: true
      });
      this.newHomework.title = '';
      this.newHomework.description = '';
    });
  }

  // ── Visitor Lead Actions ──────────────────────────────────────────────
  markContacted(v: SiteVisitorLog) {
    this.apiService.markVisitorContacted(v.id, 'Followed up by Clerk');
  }

  purposeBadge(purpose: string): string {
    const map: Record<string, string> = {
      Admission: 'bg-primary', Visit: 'bg-info text-dark',
      Fee: 'bg-warning text-dark', General: 'bg-secondary', Other: 'bg-dark'
    };
    return map[purpose] || 'bg-secondary';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Document Request Actions ──────────────────────────────────────────
  approveDoc(doc: DocumentRequest) {
    this.apiService.updateDocumentStatus(doc.id, 'Approved', 'Approved by Administration');
    alert(`✅ Certificate ${doc.request_number} approved! Student can download from their portal.`);
  }

  rejectDoc(doc: DocumentRequest) {
    this.apiService.updateDocumentStatus(doc.id, 'Rejected', 'Insufficient documentation');
    alert(`❌ Certificate ${doc.request_number} rejected.`);
  }

  downloadDocPdf(doc: DocumentRequest) {
    this.apiService.downloadDocumentPdfBlob(doc.id).subscribe();
  }

  // ── Leave Actions (Principal) ─────────────────────────────────────────
  approveLeave(leave: LeaveApp) {
    this.apiService.updateLeaveStatus(leave.id, 'Approved', this.authService.currentUser()?.first_name || 'Principal');
    alert(`✅ Leave approved for ${leave.applicant_name}`);
  }

  rejectLeave(leave: LeaveApp) {
    this.apiService.updateLeaveStatus(leave.id, 'Rejected', this.authService.currentUser()?.first_name || 'Principal');
    alert(`❌ Leave rejected for ${leave.applicant_name}`);
  }

  // ── Contact Message ────────────────────────────────────────────────────
  resolveMsg(msg: ContactMessage) {
    this.apiService.resolveContactMessage(msg.id);
  }

  // ── CMS Actions ───────────────────────────────────────────────────────
  postAnnouncement() {
    if (!this.newAnnouncement.title || !this.newAnnouncement.content) return;
    this.announcements.unshift({ ...this.newAnnouncement });
    this.newAnnouncement = { title: '', category: 'General', content: '' };
    alert('✅ Announcement published!');
  }

  deleteAnnouncement(i: number) { this.announcements.splice(i, 1); }

  saveCms(slide: HeroSlide) {
    alert(`✅ Hero Banner "${slide.title}" updated!`);
  }
}
