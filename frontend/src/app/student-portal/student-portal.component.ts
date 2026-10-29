import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ApiService, LeaveApp } from '../core/services/api.service';
import { DocumentRequest, GradeResult, FeePayment, DashboardAnalytics, HomeworkItem } from '../core/models/erp.model';
import { AiAssistantComponent } from '../shared/components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-student-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, AiAssistantComponent],
  template: `
    <!-- Portal Header Bar -->
    <div class="portal-header">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-box">
            <i class="fa-solid fa-user-graduate fs-3 text-warning"></i>
          </div>
          <div>
            <h3 class="fw-bold mb-0 text-white">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</h3>
            <span class="badge bg-warning text-dark me-2">GR: {{ studentProfile?.gr_number || 'JUP-2022-894' }}</span>
            <span class="small text-white-50">Class: {{ studentProfile?.class_name || 'Grade 5' }} — Section {{ studentProfile?.section_name || 'A' }}</span>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="small text-white-50 me-2"><i class="fa-solid fa-school text-warning me-1"></i>Jupiter English Medium School, Shendre Satara</span>
          <button class="btn btn-outline-danger btn-sm" (click)="authService.logout()">
            <i class="fa-solid fa-power-off me-1"></i> Logout
          </button>
        </div>
      </div>
    </div>

    <div class="container py-5">
      <!-- Portal Navigation Tabs -->
      <ul class="nav nav-pills custom-pills mb-4 flex-wrap">
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'"><i class="fa-solid fa-gauge me-2"></i>Dashboard</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'"><i class="fa-solid fa-calendar-check me-2"></i>Attendance</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'homework'" (click)="activeTab = 'homework'"><i class="fa-solid fa-book-open me-2"></i>Homework</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'timetable'" (click)="activeTab = 'timetable'"><i class="fa-solid fa-clock me-2"></i>Timetable</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'fees'" (click)="activeTab = 'fees'"><i class="fa-solid fa-receipt me-2"></i>Fees & Receipts</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'results'" (click)="activeTab = 'results'"><i class="fa-solid fa-chart-line me-2"></i>Exam Results</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'"><i class="fa-solid fa-file-contract me-2"></i>Certificates</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" [class.active]="activeTab === 'leaves'" (click)="activeTab = 'leaves'"><i class="fa-solid fa-calendar-minus me-2"></i>Apply Leave</button>
        </li>
      </ul>

      <!-- TAB 1: DASHBOARD -->
      @if (activeTab === 'dashboard') {
        <div class="animate-fade-in">
          <div class="row g-4 mb-4">
            <div class="col-6 col-md-3">
              <div class="stat-card text-center">
                <div class="stat-icon bg-warning-subtle"><i class="fa-solid fa-calendar-check fs-3 text-warning"></i></div>
                <h3 class="fw-bold mb-0 mt-2">{{ analytics?.student_specific?.attendance_percentage ?? 94.5 }}%</h3>
                <p class="text-muted small mb-0">Attendance Rate</p>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card text-center">
                <div class="stat-icon bg-success-subtle"><i class="fa-solid fa-wallet fs-3 text-success"></i></div>
                <h3 class="fw-bold mb-0 mt-2">₹ {{ (analytics?.student_specific?.pending_fees ?? 0) | number:'1.0-0' }}</h3>
                <p class="text-muted small mb-0">Pending Dues</p>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card text-center">
                <div class="stat-icon bg-primary-subtle"><i class="fa-solid fa-medal fs-3 text-primary"></i></div>
                <h3 class="fw-bold mb-0 mt-2">{{ analytics?.student_specific?.latest_grade ?? 'A+' }} Grade</h3>
                <p class="text-muted small mb-0">Latest Term</p>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-card text-center">
                <div class="stat-icon bg-info-subtle"><i class="fa-solid fa-file-circle-check fs-3 text-info"></i></div>
                <h3 class="fw-bold mb-0 mt-2">{{ docRequests.length }}</h3>
                <p class="text-muted small mb-0">Certificates</p>
              </div>
            </div>
          </div>

          <!-- Student Info Card -->
          <div class="row g-4">
            <div class="col-md-6">
              <div class="spm-card">
                <h5 class="fw-bold mb-3"><i class="fa-solid fa-id-card text-warning me-2"></i>Student Profile</h5>
                <table class="table table-borderless table-sm">
                  <tbody>
                    <tr><td class="text-muted" style="width:40%">Full Name</td><td class="fw-semibold">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</td></tr>
                    <tr><td class="text-muted">GR Number</td><td class="fw-semibold">{{ studentProfile?.gr_number || 'JUP-2022-894' }}</td></tr>
                    <tr><td class="text-muted">Class / Section</td><td class="fw-semibold">{{ studentProfile?.class_name || 'Grade 5' }} — Section {{ studentProfile?.section_name || 'A' }}</td></tr>
                    <tr><td class="text-muted">Father's Name</td><td class="fw-semibold">{{ studentProfile?.father_name || 'Rajesh Sharma' }}</td></tr>
                    <tr><td class="text-muted">Mother's Name</td><td class="fw-semibold">{{ studentProfile?.mother_name || 'Priya Sharma' }}</td></tr>
                    <tr><td class="text-muted">Blood Group</td><td class="fw-semibold"><span class="badge bg-danger">{{ studentProfile?.blood_group || 'B+' }}</span></td></tr>
                    <tr><td class="text-muted">Guardian Contact</td><td class="fw-semibold">{{ studentProfile?.guardian_contact || '+91 98765 43210' }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="col-md-6">
              <div class="spm-card">
                <h5 class="fw-bold mb-3"><i class="fa-solid fa-bell text-warning me-2"></i>School Notices</h5>
                <div class="notice-item border-start border-warning border-3 ps-3 mb-3 py-1">
                  <div class="small fw-bold">Annual Sports Day 2026</div>
                  <div class="small text-muted">Scheduled for March 15, 2026 at Jupiter School Grounds</div>
                </div>
                <div class="notice-item border-start border-info border-3 ps-3 mb-3 py-1">
                  <div class="small fw-bold">Term 2 Exam Date Sheet</div>
                  <div class="small text-muted">Exams commence February 20, 2026. Download hall tickets from portal.</div>
                </div>
                <div class="notice-item border-start border-success border-3 ps-3 mb-3 py-1">
                  <div class="small fw-bold">Fee Last Date Reminder</div>
                  <div class="small text-muted">Term 2 fee payment due by February 28, 2026. Pay online to avoid late fees.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: ATTENDANCE -->
      @if (activeTab === 'attendance') {
        <div class="spm-card animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <h4 class="fw-bold mb-0"><i class="fa-solid fa-calendar-days text-warning me-2"></i>Monthly Attendance Record</h4>
            <div class="d-flex align-items-center gap-3 small">
              <span class="d-flex align-items-center gap-1"><span class="badge bg-success">P</span> Present</span>
              <span class="d-flex align-items-center gap-1"><span class="badge bg-danger">A</span> Absent</span>
              <span class="d-flex align-items-center gap-1"><span class="badge bg-warning text-dark">L</span> Late</span>
            </div>
          </div>

          <!-- Summary Row -->
          <div class="row g-3 mb-4">
            <div class="col-4 text-center p-3 bg-success bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-success">22</div><div class="small text-muted">Present Days</div>
            </div>
            <div class="col-4 text-center p-3 bg-danger bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-danger">1</div><div class="small text-muted">Absent Days</div>
            </div>
            <div class="col-4 text-center p-3 bg-warning bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-warning">{{ analytics?.student_specific?.attendance_percentage ?? 94.5 }}%</div><div class="small text-muted">Attendance %</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-dark">
                <tr><th>Date</th><th>Day</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                @for (a of attendanceRecords; track a.date) {
                  <tr>
                    <td>{{ a.date }}</td>
                    <td>{{ a.day }}</td>
                    <td>
                      <span class="badge" [ngClass]="a.status === 'Present' ? 'bg-success' : a.status === 'Late' ? 'bg-warning text-dark' : 'bg-danger'">
                        {{ a.status }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ a.remarks }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: TIMETABLE -->
      @if (activeTab === 'timetable') {
        <div class="spm-card animate-fade-in">
          <h4 class="fw-bold mb-4"><i class="fa-solid fa-table-cells text-warning me-2"></i>Weekly Class Timetable — Grade 5 Section A</h4>
          <div class="table-responsive">
            <table class="table table-bordered align-middle text-center">
              <thead class="table-dark">
                <tr>
                  <th style="width:80px">Period</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                </tr>
              </thead>
              <tbody>
                @for (period of timetable; track period.period) {
                  <tr>
                    <td class="fw-bold text-muted small">
                      <div>P{{ period.period }}</div>
                      <div class="badge bg-dark">{{ period.time }}</div>
                    </td>
                    @for (sub of period.subjects; track $index) {
                      <td [class]="'timetable-cell ' + sub.colorClass">
                        <div class="fw-semibold small">{{ sub.subject }}</div>
                        <div class="text-muted" style="font-size:0.72rem">{{ sub.teacher }}</div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: FEES & RECEIPTS -->
      @if (activeTab === 'fees') {
        <div class="spm-card animate-fade-in">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <h4 class="fw-bold mb-0"><i class="fa-solid fa-file-invoice-dollar text-warning me-2"></i>Fee Payment History & Receipts</h4>
            <div class="text-muted small"><i class="fa-solid fa-circle-check text-success me-1"></i>All dues cleared</div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-dark">
                <tr><th>Invoice No</th><th>Description</th><th>Total Amount</th><th>Paid</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                @for (fee of feeRecords; track fee.invoice_number) {
                  <tr>
                    <td><strong>{{ fee.invoice_number }}</strong></td>
                    <td>{{ fee.title }}</td>
                    <td>₹ {{ fee.total_amount | number:'1.2-2' }}</td>
                    <td>₹ {{ fee.paid_amount | number:'1.2-2' }}</td>
                    <td class="small text-muted">{{ fee.due_date }}</td>
                    <td>
                      <span class="badge" [ngClass]="fee.payment_status === 'Paid' ? 'bg-success' : fee.payment_status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'">
                        {{ fee.payment_status }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-warning" (click)="downloadReceipt(fee.invoice_number || '')">
                        <i class="fa-solid fa-download me-1"></i>PDF
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 5: EXAM RESULTS -->
      @if (activeTab === 'results') {
        <div class="spm-card animate-fade-in">
          <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
            <h4 class="fw-bold mb-0"><i class="fa-solid fa-award text-warning me-2"></i>Academic Marksheet — Term 1 (2025–2026)</h4>
            <span class="badge bg-success px-3 py-2 fs-6">Overall: A+ Grade</span>
          </div>

          <!-- Result Summary -->
          <div class="row g-3 mb-4">
            <div class="col-4 text-center p-3 bg-primary bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-primary">270.5</div><div class="small text-muted">Total Marks</div>
            </div>
            <div class="col-4 text-center p-3 bg-success bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-success">90.2%</div><div class="small text-muted">Percentage</div>
            </div>
            <div class="col-4 text-center p-3 bg-warning bg-opacity-10 rounded-3">
              <div class="fs-4 fw-bold text-warning">3rd</div><div class="small text-muted">Class Rank</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-striped align-middle">
              <thead class="table-dark">
                <tr><th>Subject</th><th>Marks Obtained</th><th>Total Marks</th><th>Percentage</th><th>Grade</th><th>Teacher Remarks</th></tr>
              </thead>
              <tbody>
                @for (r of results; track r.id || r.subject_name || r.subject) {
                  <tr>
                    <td class="fw-semibold">{{ r.subject_name || r.subject }}</td>
                    <td>{{ r.marks_obtained ?? r.marks }}</td>
                    <td>{{ r.total_marks || 100 }}</td>
                    <td>{{ ((r.marks_obtained ?? r.marks) / (r.total_marks || 100) * 100) | number:'1.1-1' }}%</td>
                    <td>
                      <span class="badge" [ngClass]="(r.marks_obtained ?? r.marks) >= 90 ? 'bg-success' : (r.marks_obtained ?? r.marks) >= 75 ? 'bg-primary' : 'bg-warning text-dark'">
                        {{ r.grade || ((r.marks_obtained ?? r.marks) >= 90 ? 'A+' : (r.marks_obtained ?? r.marks) >= 75 ? 'A' : 'B') }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ r.remarks }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 6: DOCUMENT/CERTIFICATE REQUESTS -->
      @if (activeTab === 'documents') {
        <div class="row g-4 animate-fade-in">
          <!-- Request Form -->
          <div class="col-md-5">
            <div class="spm-card">
              <h5 class="fw-bold mb-3"><i class="fa-solid fa-file-pen text-warning me-2"></i>Apply for Certificate</h5>
              <p class="text-muted small mb-3">Request official school certificates. Processing takes 3–5 working days.</p>
              <form (ngSubmit)="applyForDocument()">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Certificate Type <span class="text-danger">*</span></label>
                  <select class="form-select" [(ngModel)]="newDocReq.document_type" name="document_type">
                    <option value="Bonafide">Bonafide Certificate</option>
                    <option value="Leaving">School Leaving Certificate</option>
                    <option value="Transfer">Transfer Certificate</option>
                    <option value="ID_Card">Duplicate ID Card</option>
                    <option value="Hall_Ticket">Exam Hall Ticket</option>
                    <option value="Marksheet">Certified Marksheet Copy</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-semibold">Purpose of Application <span class="text-danger">*</span></label>
                  <textarea class="form-control" rows="3" [(ngModel)]="newDocReq.purpose" name="purpose" placeholder="e.g. Passport Application / Bank Account / Scholarship" required></textarea>
                </div>
                <button type="submit" class="btn btn-gold w-100" [disabled]="!newDocReq.purpose">
                  <i class="fa-solid fa-paper-plane me-2"></i>Submit Application
                </button>
              </form>
            </div>
          </div>

          <!-- Existing Requests + PDF Download -->
          <div class="col-md-7">
            <div class="spm-card">
              <h5 class="fw-bold mb-3"><i class="fa-solid fa-clock-rotate-left text-warning me-2"></i>My Certificate Applications</h5>
              @if (docRequests.length === 0) {
                <div class="text-center py-4 text-muted">
                  <i class="fa-solid fa-folder-open fs-2 mb-2 d-block opacity-50"></i>
                  No applications yet. Use the form to request a certificate.
                </div>
              }
              @if (docRequests.length > 0) {
                <div class="table-responsive">
                  <table class="table table-hover align-middle">
                    <thead class="table-dark">
                      <tr><th>Req No</th><th>Certificate Type</th><th>Applied On</th><th>Status</th><th>Download</th></tr>
                    </thead>
                    <tbody>
                      @for (req of docRequests; track req.id) {
                        <tr>
                          <td><strong>{{ req.request_number }}</strong></td>
                          <td>{{ req.doc_type_display || req.document_type }}</td>
                          <td class="small text-muted">{{ req.applied_at }}</td>
                          <td>
                            <span class="badge" [ngClass]="req.status === 'Approved' || req.status === 'Issued' ? 'bg-success' : req.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'">
                              {{ req.status }}
                            </span>
                          </td>
                          <td>
                            @if (req.status === 'Approved' || req.status === 'Issued') {
                              <button class="btn btn-sm btn-gold" (click)="downloadPdf(req)">
                                <i class="fa-solid fa-file-pdf me-1"></i>Download
                              </button>
                            } @else {
                              <span class="small text-muted">Pending Review</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- TAB: HOMEWORK -->
      @if (activeTab === 'homework') {
        <div class="spm-card animate-fade-in">
          <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h4 class="fw-bold mb-1"><i class="fa-solid fa-book-open text-warning me-2"></i>Active Homework Assignments</h4>
              <p class="text-muted small mb-0">{{ studentProfile?.class_name || 'Grade 5' }} Section {{ studentProfile?.section_name || 'A' }} — Daily assignments and deadlines</p>
            </div>
            <span class="badge bg-warning text-dark px-3 py-2 fs-6">{{ homeworkList.length }} Active Tasks</span>
          </div>

          <div class="row g-4">
            @for (hw of homeworkList; track hw.id) {
              <div class="col-md-6">
                <div class="p-4 border rounded-3 h-100 d-flex flex-column justify-content-between" style="border-color: rgba(212,175,55,0.3) !important; background: rgba(255,255,255,0.03);">
                  <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <span class="badge bg-primary px-3 py-1">{{ hw.subject_name }}</span>
                      <span class="badge bg-danger-subtle text-danger border border-danger">
                        <i class="fa-solid fa-clock me-1"></i>Due: {{ hw.due_date }}
                      </span>
                    </div>
                    <h5 class="fw-bold mb-2 text-white">{{ hw.title }}</h5>
                    <p class="text-white-50 small mb-3">{{ hw.description }}</p>
                  </div>
                  <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 small text-white-50">
                    <span><i class="fa-solid fa-chalkboard-user text-warning me-1"></i>{{ hw.created_by_name || 'Class Teacher' }}</span>
                    <span class="badge bg-success-subtle text-success"><i class="fa-solid fa-circle-check me-1"></i>Assigned</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB: LEAVE APPLICATIONS -->
      @if (activeTab === 'leaves') {
        <div class="spm-card animate-fade-in">
          <div class="row g-4">
            <div class="col-lg-5">
              <h4 class="fw-bold mb-3"><i class="fa-solid fa-calendar-minus text-warning me-2"></i>Apply for Leave</h4>
              <form (ngSubmit)="applyForLeave()">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-white">Leave Type</label>
                  <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="newLeave.leave_type" name="leave_type">
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Family Emergency">Family Emergency</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold text-white">Start Date</label>
                    <input type="date" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newLeave.start_date" name="start_date" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold text-white">End Date</label>
                    <input type="date" class="form-control bg-dark text-white border-secondary" [(ngModel)]="newLeave.end_date" name="end_date" required />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-white">Reason / Details</label>
                  <textarea class="form-control bg-dark text-white border-secondary" rows="3" [(ngModel)]="newLeave.reason" name="reason" placeholder="Detailed reason for leave request..." required></textarea>
                </div>
                <button type="submit" class="btn btn-warning w-100 fw-bold">
                  <i class="fa-solid fa-paper-plane me-2"></i>Submit Leave Application
                </button>
              </form>
            </div>

            <div class="col-lg-7">
              <h5 class="fw-bold mb-3"><i class="fa-solid fa-clock-rotate-left text-warning me-2"></i>My Leave History</h5>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr><th>Type</th><th>Duration</th><th>Reason</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    @for (l of studentLeaves; track l.id) {
                      <tr>
                        <td><strong>{{ l.leave_type }}</strong></td>
                        <td class="small">{{ l.start_date }} to {{ l.end_date }}</td>
                        <td class="small text-muted text-truncate" style="max-width:160px">{{ l.reason }}</td>
                        <td>
                          <span class="badge" [ngClass]="l.status === 'Approved' ? 'bg-success' : l.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'">
                            {{ l.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Floating AI Assistant -->
    <app-ai-assistant></app-ai-assistant>
  `,
  styles: [`
    .portal-header {
      padding: 1rem 0;
      background: linear-gradient(135deg, #0F2027, #203A43);
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
    }
    .avatar-box {
      width: 52px;
      height: 52px;
      background: rgba(212, 175, 55, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--primary-gold);
      flex-shrink: 0;
    }
    .custom-pills .nav-link {
      color: var(--text-main);
      font-weight: 600;
      border-radius: 20px;
      padding: 0.5rem 1.25rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      transition: all 0.25s ease;
      &.active {
        background: var(--primary-gold);
        color: #0F2027;
        box-shadow: 0 4px 12px rgba(212,175,55,0.3);
      }
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
    .timetable-cell {
      padding: 0.6rem 0.4rem;
      font-size: 0.82rem;
      border-radius: 4px;
    }
    .timetable-cell.math { background: rgba(30, 115, 255, 0.08); }
    .timetable-cell.science { background: rgba(5, 150, 105, 0.08); }
    .timetable-cell.english { background: rgba(220, 38, 38, 0.08); }
    .timetable-cell.marathi { background: rgba(245, 158, 11, 0.08); }
    .timetable-cell.evs { background: rgba(139, 92, 246, 0.08); }
    .timetable-cell.pt { background: rgba(236, 72, 153, 0.08); }
    .timetable-cell.library { background: rgba(6, 182, 212, 0.08); }
    .timetable-cell.drawing { background: rgba(249, 115, 22, 0.08); }
    .timetable-cell.hindi { background: rgba(168, 85, 247, 0.08); }
    .notice-item { border-radius: 0 8px 8px 0; }
  `]
})
export class StudentPortalComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  activeTab = 'dashboard';
  studentProfile = this.authService.currentUser()?.student_profile;

  // timetable displayed from API or fallback in template
  timetable: any[] = [];


  docRequests: DocumentRequest[] = [];
  analytics: DashboardAnalytics | null = null;
  homeworkList: HomeworkItem[] = [];
  studentLeaves: LeaveApp[] = [];
  attendanceRecords: any[] = [];
  feeRecords: Partial<FeePayment>[] = [];
  results: any[] = [];

  newDocReq: Partial<DocumentRequest> = { document_type: 'Bonafide', purpose: '' };
  newLeave: Partial<LeaveApp> = {
    leave_type: 'Sick Leave',
    reason: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  };

  ngOnInit() {
    this.studentProfile = this.authService.currentUser()?.student_profile;

    // Load real-time dashboard analytics
    this.apiService.getDashboardAnalytics().subscribe(d => this.analytics = d);

    // Load homework assignments from backend
    this.apiService.getHomework().subscribe(h => this.homeworkList = h);

    // Load attendance from backend
    this.apiService.getAttendance().subscribe(a => this.attendanceRecords = a);

    // Load grades from backend
    this.apiService.getGrades().subscribe(g => this.results = g);

    // Load fee payments from backend
    this.apiService.getFeePayments().subscribe(f => this.feeRecords = f);

    // Hydrate reactive data stores from backend
    this.apiService.loadAllPortalData();

    // Subscribe to document requests
    this.apiService.documentRequests$.subscribe(docs => {
      const studentGr = this.studentProfile?.gr_number || 'GR-2022-894';
      this.docRequests = docs.filter(d => d.gr_number === studentGr || d.student_name.includes(this.authService.currentUser()?.first_name || 'Alex'));
    });

    // Subscribe to leaves for this student
    this.apiService.leaves$.subscribe(leaves => {
      this.studentLeaves = leaves.filter(l => l.role === 'STUDENT' || l.applicant_name.includes(this.authService.currentUser()?.first_name || 'Alex'));
    });
  }

  applyForLeave() {
    if (!this.newLeave.reason?.trim() || !this.newLeave.start_date || !this.newLeave.end_date) {
      alert('Please fill all required fields for your leave application.');
      return;
    }
    const currentUser = this.authService.currentUser();
    const studentName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Alex Sharma';

    this.apiService.submitLeave({
      applicant_name: studentName,
      role: 'STUDENT',
      leave_type: this.newLeave.leave_type || 'Sick Leave',
      reason: this.newLeave.reason,
      start_date: this.newLeave.start_date,
      end_date: this.newLeave.end_date,
    }).subscribe({
      next: () => {
        this.newLeave.reason = '';
        alert('✅ Leave application submitted successfully! It has been forwarded to the Principal for review.');
      },
      error: () => {
        alert('❌ Failed to submit leave application. Please verify dates and try again.');
      }
    });
  }

  applyForDocument() {
    if (!this.newDocReq.purpose?.trim()) {
      alert('Please enter the purpose for your certificate request.');
      return;
    }
    const currentUser = this.authService.currentUser();
    const studentName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Alex Sharma';
    const grNumber = this.studentProfile?.gr_number || 'JUP-2022-894';

    this.apiService.submitDocumentRequest({
      student_name: studentName,
      gr_number: grNumber,
      document_type: this.newDocReq.document_type || 'Bonafide',
      purpose: this.newDocReq.purpose
    }).subscribe({
      next: (res) => {
        this.newDocReq.purpose = '';
        alert(`✅ Certificate application ${res.request_number} submitted successfully! It is now immediately visible to the School Clerk for approval.`);
      },
      error: () => {
        alert('❌ Failed to submit certificate application. Please check your details and try again.');
      }
    });
  }

  downloadPdf(req: DocumentRequest) {
    this.apiService.downloadDocumentPdfBlob(req.id).subscribe();
  }

  downloadReceipt(invNo: string) {
    this.apiService.downloadFeeReceiptBlob(invNo).subscribe();
  }
}
