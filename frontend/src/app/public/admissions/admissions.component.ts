import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AdmissionApplication } from '../../core/models/erp.model';


@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="py-5 bg-dark text-white text-center">
      <div class="container py-4">
        <h1 class="display-4 fw-bold">Online Admission Portal 2026-2027</h1>
        <p class="lead text-warning">Enroll Your Child in Satara's Premier English Medium Institution</p>
      </div>
    </div>

    <section class="py-5">
      <div class="container py-4">
        <!-- Admission Steps Wizard Nav -->
        <div class="glass-card p-4 mb-5">
          <div class="row text-center g-2">
            <div class="col" [class.text-warning]="currentStep === 1">
              <div class="step-num mx-auto" [class.bg-warning]="currentStep === 1" [class.text-dark]="currentStep === 1">1</div>
              <small class="fw-bold d-block mt-1">Student Info</small>
            </div>
            <div class="col" [class.text-warning]="currentStep === 2">
              <div class="step-num mx-auto" [class.bg-warning]="currentStep === 2" [class.text-dark]="currentStep === 2">2</div>
              <small class="fw-bold d-block mt-1">Parent Info</small>
            </div>
            <div class="col" [class.text-warning]="currentStep === 3">
              <div class="step-num mx-auto" [class.bg-warning]="currentStep === 3" [class.text-dark]="currentStep === 3">3</div>
              <small class="fw-bold d-block mt-1">Previous School</small>
            </div>
            <div class="col" [class.text-warning]="currentStep === 4">
              <div class="step-num mx-auto" [class.bg-warning]="currentStep === 4" [class.text-dark]="currentStep === 4">4</div>
              <small class="fw-bold d-block mt-1">Documents Upload</small>
            </div>
            <div class="col" [class.text-warning]="currentStep === 5">
              <div class="step-num mx-auto" [class.bg-warning]="currentStep === 5" [class.text-dark]="currentStep === 5">5</div>
              <small class="fw-bold d-block mt-1">Review & Submit</small>
            </div>
          </div>
        </div>

        <!-- Wizard Form -->
        <div class="spm-card p-4 p-md-5">
          @if (submittedAppNumber) {
            <div class="text-center py-5">
              <div class="display-1 text-warning mb-3"><i class="fa-solid fa-circle-check"></i></div>
              <h2 class="fw-bold">Application Submitted Successfully!</h2>
              <p class="lead mb-4">Your Application Registration Number is: <strong class="text-warning">{{ submittedAppNumber }}</strong></p>
              <p class="text-muted">A confirmation SMS and email have been sent to your registered contact details. Please keep this registration number for tracking.</p>
              <button class="btn btn-gold" (click)="resetForm()">Submit Another Application</button>
            </div>
          } @else {
            @if (validationError()) {
              <div class="alert alert-danger d-flex align-items-center gap-2 mb-4 py-2">
                <i class="fa-solid fa-triangle-exclamation fs-5"></i>
                <span class="small fw-semibold">{{ validationError() }}</span>
              </div>
            }
            <form (ngSubmit)="submitForm()">
              <!-- STEP 1: Student Information -->
              @if (currentStep === 1) {
                <div>
                  <h4 class="fw-bold text-warning mb-4"><i class="fa-solid fa-child me-2"></i>Step 1: Student Personal Details</h4>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Applicant Full Name *</label>
                      <input type="text" class="form-control" [(ngModel)]="formData.applicant_name" name="applicant_name" required placeholder="e.g. Rohan Rajesh Mehta">
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Date of Birth *</label>
                      <input type="date" class="form-control" [(ngModel)]="formData.date_of_birth" name="date_of_birth" required>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Gender *</label>
                      <select class="form-select" [(ngModel)]="formData.gender" name="gender">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Applying For Class *</label>
                      <select class="form-select" [(ngModel)]="formData.applying_for_class" name="applying_for_class">
                        @for (cls of academicClasses; track cls.id) {
                          <option [ngValue]="cls.id">{{ cls.name }}</option>
                        }
                      </select>
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 2: Parent Information -->
              @if (currentStep === 2) {
                <div>
                  <h4 class="fw-bold text-warning mb-4"><i class="fa-solid fa-users me-2"></i>Step 2: Parent / Guardian Details</h4>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold">Parent / Guardian Full Name *</label>
                      <input type="text" class="form-control" [(ngModel)]="formData.parent_name" name="parent_name" required placeholder="e.g. Rajesh Mehta">
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Contact Phone Number *</label>
                      <input type="tel" class="form-control" [(ngModel)]="formData.parent_phone" name="parent_phone" required placeholder="+91 98220 00000">
                    </div>
                    <div class="col-md-3">
                      <label class="form-label fw-semibold">Email Address *</label>
                      <input type="email" class="form-control" [(ngModel)]="formData.parent_email" name="parent_email" required placeholder="parent@gmail.com">
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-semibold">Residential Address *</label>
                      <textarea class="form-control" rows="3" [(ngModel)]="formData.address" name="address" placeholder="Full residential address in Pune"></textarea>
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 3: Previous Academic Record -->
              @if (currentStep === 3) {
                <div>
                  <h4 class="fw-bold text-warning mb-4"><i class="fa-solid fa-school me-2"></i>Step 3: Previous Academic Details</h4>
                  <div class="row g-3">
                    <div class="col-md-8">
                      <label class="form-label fw-semibold">Previous School Attended (If any)</label>
                      <input type="text" class="form-control" [(ngModel)]="formData.previous_school" name="previous_school" placeholder="e.g. Little Scholars Nursery Pune">
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold">Previous Marks / Grade (%)</label>
                      <input type="number" class="form-control" [(ngModel)]="formData.previous_marks_percentage" name="previous_marks_percentage" placeholder="88.5">
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 4: Documents Upload Simulation -->
              @if (currentStep === 4) {
                <div>
                  <h4 class="fw-bold text-warning mb-4"><i class="fa-solid fa-cloud-arrow-up me-2"></i>Step 4: Upload Required Documents</h4>
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="border border-dashed p-3 rounded text-center">
                        <i class="fa-solid fa-user-tie fs-3 text-warning mb-2"></i>
                        <h6>Student Passport Photograph *</h6>
                        <input type="file" class="form-control form-control-sm">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="border border-dashed p-3 rounded text-center">
                        <i class="fa-solid fa-file-certificate fs-3 text-warning mb-2"></i>
                        <h6>Birth Certificate / Leaving Cert *</h6>
                        <input type="file" class="form-control form-control-sm">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="border border-dashed p-3 rounded text-center">
                        <i class="fa-solid fa-id-card fs-3 text-warning mb-2"></i>
                        <h6>Aadhar Card Copy *</h6>
                        <input type="file" class="form-control form-control-sm">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="border border-dashed p-3 rounded text-center">
                        <i class="fa-solid fa-signature fs-3 text-warning mb-2"></i>
                        <h6>Parent Signature *</h6>
                        <input type="file" class="form-control form-control-sm">
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 5: Preview & Final Submission -->
              @if (currentStep === 5) {
                <div>
                  <h4 class="fw-bold text-warning mb-4"><i class="fa-solid fa-clipboard-check me-2"></i>Step 5: Review & Submit Application</h4>
                  <div class="glass-card p-4 mb-4">
                    <div class="row g-3">
                      <div class="col-md-6"><strong>Student Name:</strong> {{ formData.applicant_name }}</div>
                      <div class="col-md-3"><strong>DOB:</strong> {{ formData.date_of_birth }}</div>
                      <div class="col-md-3"><strong>Gender:</strong> {{ formData.gender }}</div>
                      <div class="col-md-6"><strong>Parent:</strong> {{ formData.parent_name }}</div>
                      <div class="col-md-6"><strong>Phone / Email:</strong> {{ formData.parent_phone }} | {{ formData.parent_email }}</div>
                      <div class="col-12"><strong>Address:</strong> {{ formData.address }}</div>
                    </div>
                  </div>
                </div>
              }

              <!-- Wizard Controls -->
              <div class="d-flex justify-content-between align-items-center mt-5">
                <button type="button" class="btn btn-outline-secondary" (click)="prevStep()" [disabled]="currentStep === 1">
                  <i class="fa-solid fa-arrow-left me-1"></i> Previous
                </button>

                @if (currentStep < 5) {
                  <button type="button" class="btn btn-gold" (click)="nextStep()">
                    Next Step <i class="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                } @else {
                  <button type="submit" class="btn btn-gold btn-lg">
                    <i class="fa-solid fa-paper-plane me-2"></i> Submit Application
                  </button>
                }
              </div>
            </form>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .step-num {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      border: 1px solid var(--primary-gold);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
  `]
})
export class AdmissionsComponent implements OnInit {
  apiService = inject(ApiService);

  currentStep = 1;
  submittedAppNumber: string | null = null;
  validationError = signal<string>('');
  submitting = signal<boolean>(false);
  academicClasses: any[] = [];

  formData: AdmissionApplication = {
    applicant_name: '',
    date_of_birth: '2019-06-15',
    gender: 'Male',
    applying_for_class: 1,
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    previous_school: '',
    previous_marks_percentage: undefined
  };

  ngOnInit() {
    this.apiService.getAcademicClasses().subscribe(classes => {
      this.academicClasses = classes;
      if (classes.length > 0 && !this.formData.applying_for_class) {
        this.formData.applying_for_class = classes[0].id;
      }
    });
  }

  validateCurrentStep(): boolean {
    this.validationError.set('');

    if (this.currentStep === 1) {
      if (!this.formData.applicant_name?.trim() || this.formData.applicant_name.trim().length < 2) {
        this.validationError.set('Please enter the student\'s full name (at least 2 characters).');
        return false;
      }
      if (!this.formData.date_of_birth) {
        this.validationError.set('Please select a valid date of birth.');
        return false;
      }
      const dob = new Date(this.formData.date_of_birth);
      if (dob >= new Date()) {
        this.validationError.set('Date of birth must be in the past.');
        return false;
      }
    } else if (this.currentStep === 2) {
      if (!this.formData.parent_name?.trim() || this.formData.parent_name.trim().length < 2) {
        this.validationError.set('Please enter the parent/guardian full name.');
        return false;
      }
      const phone = this.formData.parent_phone?.replace(/\D/g, '') || '';
      if (phone.length < 10) {
        this.validationError.set('Please enter a valid 10-digit mobile number.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.formData.parent_email || !emailRegex.test(this.formData.parent_email.trim())) {
        this.validationError.set('Please enter a valid email address.');
        return false;
      }
      if (!this.formData.address?.trim() || this.formData.address.trim().length < 5) {
        this.validationError.set('Please enter the full residential address.');
        return false;
      }
    } else if (this.currentStep === 3) {
      if (this.formData.previous_marks_percentage !== undefined && this.formData.previous_marks_percentage !== null) {
        const pct = Number(this.formData.previous_marks_percentage);
        if (pct < 0 || pct > 100) {
          this.validationError.set('Previous marks percentage must be between 0% and 100%.');
          return false;
        }
      }
    }

    return true;
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.validationError.set('');
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitForm() {
    if (!this.validateCurrentStep()) return;

    this.submitting.set(true);
    this.validationError.set('');

    this.apiService.submitAdmission(this.formData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.submittedAppNumber = res.application_number || 'ADM-2026-8912';
      },
      error: () => {
        this.submitting.set(false);
        this.validationError.set('Failed to submit application. Please verify all details and ensure the backend server is reachable.');
      }
    });
  }

  resetForm() {
    this.submittedAppNumber = null;
    this.currentStep = 1;
    this.validationError.set('');
    this.formData = {
      applicant_name: '',
      date_of_birth: '2019-06-15',
      gender: 'Male',
      applying_for_class: this.academicClasses.length > 0 ? this.academicClasses[0].id : 1,
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      address: '',
      previous_school: '',
      previous_marks_percentage: undefined
    };
  }
}
