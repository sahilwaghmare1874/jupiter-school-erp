import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, tap, throwError } from 'rxjs';
import {
  SchoolInfo, HeroSlide, Announcement, EventItem, GalleryItem,
  AdmissionApplication, AttendanceRecord, GradeResult, FeePayment,
  DocumentRequest, DashboardAnalytics, SiteVisitorLog, ContactMessage,
  HomeworkItem
} from '../models/erp.model';
import { TeacherProfile } from '../models/user.model';
import { ToastService } from './toast.service';
import { normalizePhone, normalizeEmail } from '../utils/form-validators';
import { environment } from '../../../environments/environment';

export interface LeaveApp {
  id: number;
  applicant_name: string;
  role: 'STUDENT' | 'TEACHER' | string;
  leave_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: string;
  reviewed_by?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private toast = inject(ToastService);


  // Live Reactive Data Stores
  private initialDocs: DocumentRequest[] = [
    { id: 101, request_number: 'JUP-REQ-1001', student_name: 'Alex Sharma', gr_number: 'JUP-2022-894', document_type: 'Bonafide', doc_type_display: 'Bonafide Certificate', purpose: 'Passport Application', status: 'Applied', applied_at: '2026-02-05' },
    { id: 102, request_number: 'JUP-REQ-1002', student_name: 'Priya Kulkarni', gr_number: 'JUP-2022-895', document_type: 'Leaving', doc_type_display: 'School Leaving Certificate', purpose: 'Transfer to New School', status: 'Applied', applied_at: '2026-02-04' },
    { id: 103, request_number: 'JUP-REQ-1003', student_name: 'Ananya Mehta', gr_number: 'JUP-2021-412', document_type: 'Transfer', doc_type_display: 'Transfer Certificate', purpose: 'College Requirement', status: 'Approved', admin_remarks: 'Verified by Clerk Mahesh Patil', applied_at: '2026-02-03' },
    { id: 104, request_number: 'JUP-REQ-1004', student_name: 'Rahul Deshmukh', gr_number: 'JUP-2023-001', document_type: 'Hall_Ticket', doc_type_display: 'Exam Hall Ticket', purpose: 'Duplicate Hall Ticket for Term 2', status: 'Applied', applied_at: '2026-02-05' }
  ];

  private initialAdmissions: (AdmissionApplication & { class_name?: string })[] = [
    { id: 1, application_number: 'JUP-ADM-2026-001', applicant_name: 'Rohan Mehta', date_of_birth: '2018-05-12', gender: 'Male', applying_for_class: 1, class_name: 'Grade 1', parent_name: 'Sanjay Mehta', parent_phone: '+91 98220 11223', parent_email: 'sanjay.m@gmail.com', address: 'Shendre Village, Satara', previous_school: 'Little Stars Nursery', previous_marks_percentage: 92.0, status: 'Submitted' },
    { id: 2, application_number: 'JUP-ADM-2026-002', applicant_name: 'Priya Shinde', date_of_birth: '2017-08-20', gender: 'Female', applying_for_class: 2, class_name: 'Grade 2', parent_name: 'Ramesh Shinde', parent_phone: '+91 97654 33210', parent_email: 'r.shinde@yahoo.com', address: 'NH-4, Satara', previous_school: 'Satara English School', previous_marks_percentage: 88.5, status: 'Under_Review' },
    { id: 3, application_number: 'JUP-ADM-2026-003', applicant_name: 'Arjun Patil', date_of_birth: '2015-03-11', gender: 'Male', applying_for_class: 4, class_name: 'Grade 4', parent_name: 'Suresh Patil', parent_phone: '+91 90123 45678', parent_email: 's.patil@gmail.com', address: 'Koregaon, Satara', previous_school: 'Koregaon Primary', previous_marks_percentage: 94.0, status: 'Approved' },
    { id: 4, application_number: 'JUP-ADM-2026-004', applicant_name: 'Sneha Jadhav', date_of_birth: '2014-11-30', gender: 'Female', applying_for_class: 5, class_name: 'Grade 5', parent_name: 'Vikas Jadhav', parent_phone: '+91 91234 56789', parent_email: 'v.jadhav@gmail.com', address: 'Satara City', previous_school: 'St. Pauls Satara', previous_marks_percentage: 89.0, status: 'Submitted' },
    { id: 5, application_number: 'JUP-ADM-2026-005', applicant_name: 'Kabir Deshmukh', date_of_birth: '2019-01-14', gender: 'Male', applying_for_class: 1, class_name: 'Mini KG', parent_name: 'Amit Deshmukh', parent_phone: '+91 99887 76655', parent_email: 'amit.d@gmail.com', address: 'Shendre, Satara', previous_school: 'Home Taught', previous_marks_percentage: 95.0, status: 'Submitted' }
  ];

  private initialLeaves: LeaveApp[] = [
    { id: 1, applicant_name: 'Alex Sharma', role: 'STUDENT', leave_type: 'Sick Leave', reason: 'High fever and viral infection', start_date: '2026-02-06', end_date: '2026-02-08', status: 'Pending', applied_at: '2026-02-05' },
    { id: 2, applicant_name: 'Anjali Deshmukh', role: 'TEACHER', leave_type: 'Personal Leave', reason: 'Attending educational seminar in Pune', start_date: '2026-02-10', end_date: '2026-02-11', status: 'Pending', applied_at: '2026-02-04' },
    { id: 3, applicant_name: 'Rahul Deshmukh', role: 'STUDENT', leave_type: 'Family Emergency', reason: 'Grandparent hospital stay', start_date: '2026-01-28', end_date: '2026-01-29', status: 'Approved', applied_at: '2026-01-27', reviewed_by: 'Dr. Sunita Joshi' }
  ];

  documentRequests$ = new BehaviorSubject<DocumentRequest[]>(this.initialDocs);
  admissions$ = new BehaviorSubject<(AdmissionApplication & { class_name?: string })[]>(this.initialAdmissions);
  leaves$ = new BehaviorSubject<LeaveApp[]>(this.initialLeaves);

  // ── Visitor Leads reactive store — Clerk sees these in real-time
  private initialVisitorLogs: SiteVisitorLog[] = [
    {
      id: 1, phone: '+91 98220 34567', name: 'Suresh Patil',
      email: 'suresh.p@gmail.com', purpose: 'Admission',
      purpose_display: 'Admission Enquiry',
      message: 'Interested in Grade 5 admission for my son for 2026-27',
      page_visited: 'Admissions Page', visited_at: new Date(Date.now() - 3600000).toISOString(),
      visited_at_formatted: '05-Aug-2026 02:10 PM', is_contacted: false
    },
    {
      id: 2, phone: '+91 97654 12890', name: 'Meena Jadhav',
      email: 'meena.j@yahoo.com', purpose: 'Visit',
      purpose_display: 'Schedule School Visit',
      message: 'Want to visit the school campus and meet the principal',
      page_visited: 'Contact Page', visited_at: new Date(Date.now() - 7200000).toISOString(),
      visited_at_formatted: '05-Aug-2026 01:05 PM', is_contacted: false
    },
    {
      id: 3, phone: '+91 90123 45678', name: 'Rajesh Shinde',
      purpose: 'Fee', purpose_display: 'Fee / Scholarship Info',
      message: 'Enquiry about scholarship available for Grade 10',
      page_visited: 'Academics Page', visited_at: new Date(Date.now() - 86400000).toISOString(),
      visited_at_formatted: '04-Aug-2026 10:30 AM', is_contacted: true,
      contacted_notes: 'Called and explained scholarship criteria.'
    }
  ];
  visitorLogs$ = new BehaviorSubject<SiteVisitorLog[]>(this.initialVisitorLogs);

  // ── Contact messages reactive store
  private initialContactMessages: ContactMessage[] = [
    { id: 1, name: 'Priya Kulkarni', email: 'priya.k@gmail.com', phone: '+91 99887 11223', subject: 'Admission Query 2026-27', message: 'We would like to know the admission procedure for Mini KG.', created_at: new Date(Date.now() - 3600000).toISOString(), is_resolved: false },
    { id: 2, name: 'Amit Deshmukh', email: 'amit.d@yahoo.com', phone: '+91 98765 43210', subject: 'Fee Structure Enquiry', message: 'Please share the complete fee structure for Grade 6 to 10.', created_at: new Date(Date.now() - 86400000).toISOString(), is_resolved: true },
    { id: 3, name: 'Sanjay Mehta', email: 's.mehta@hotmail.com', phone: '+91 93456 78901', subject: 'Transport Facility', message: 'Is there a school bus available from Koregaon area?', created_at: new Date(Date.now() - 172800000).toISOString(), is_resolved: false },
  ];
  contactMessages$ = new BehaviorSubject<ContactMessage[]>(this.initialContactMessages);

  constructor(private http: HttpClient) {}

  getSchoolInfo(): Observable<SchoolInfo> {
    // Bug Fix #14: Use the singleton action instead of hardcoded ID 1
    return this.http.get<SchoolInfo>(`${this.baseUrl}/school-info/singleton/`).pipe(
      catchError(() => of({
        name: 'Jupiter English Medium School',
        tagline: 'Empowering Minds, Shaping Futures in Satara',
        establishment_year: 1998,
        address: 'NH-4 Highway, Shendre, Satara, Maharashtra 415001',
        email: 'info@jupiterschoolsatara.org',
        phone: '+91 2162 270123 / +91 98220 12345',
        principal_message: 'Welcome to Jupiter English Medium School, Shendre Satara. We nurture academic excellence, moral discipline, and modern scientific thinking.',
        trustee_message: 'Jupiter Education Trust is dedicated to providing world-class, affordable education for future leaders in Satara.'
      }))
    );
  }

  getHeroSlides(): Observable<HeroSlide[]> {
    return this.http.get<HeroSlide[]>(`${this.baseUrl}/hero-slides/`).pipe(
      catchError(() => of([
        {
          id: 1,
          title: 'Excellence in Education at Shendre, Satara',
          subtitle: 'Empowering students with modern STEM curriculum, digital classrooms, and holistic discipline.',
          image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
          order: 1, cta_text: 'Apply Now 2026-27', cta_link: '/admissions', is_active: true
        },
        {
          id: 2,
          title: 'State-of-the-Art Sports & Cultural Hub',
          subtitle: 'Fostering teamwork, leadership, and artistic excellence through comprehensive co-curricular programs.',
          image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
          order: 2, cta_text: 'Explore Campus', cta_link: '/academics', is_active: true
        }
      ]))
    );
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.baseUrl}/announcements/`).pipe(
      catchError(() => of([
        {
          id: 1, title: 'Admissions Open for Academic Year 2026-2027',
          content: 'Online applications are open for Mini KG, Primary, and Secondary grades at Jupiter English Medium School, Shendre.',
          category: 'Admission', target_role: 'ALL', posted_at: '2026-02-01', is_active: true
        },
        {
          id: 2, title: 'Annual Science & Robotics Exhibition 2026',
          content: 'Exhibition date set for February 28th at the Jupiter Science Complex, Shendre.',
          category: 'General', target_role: 'ALL', posted_at: '2026-01-25', is_active: true
        }
      ]))
    );
  }

  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.baseUrl}/events/`).pipe(
      catchError(() => of([
        {
          id: 1, title: 'Inter-School Cultural Fest 2026',
          description: 'Music, drama, and dance competitions across 15 schools in Satara district.',
          event_date: '2026-02-20', location: 'Jupiter Main Auditorium', category: 'Cultural',
          image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          is_upcoming: true
        },
        {
          id: 2, title: 'Satara District Athletic Meet 2026',
          description: 'Track and field championships across all houses.',
          event_date: '2026-01-15', location: 'Jupiter Sports Complex, Shendre', category: 'Sports',
          image_url: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
          is_upcoming: false
        }
      ]))
    );
  }

  getGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.baseUrl}/gallery/`).pipe(
      catchError(() => of([
        { id: 1, title: 'Sports Day Sprint', category: 'Sports', media_type: 'Image', url: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80' },
        { id: 2, title: 'Robotics Lab Experiment', category: 'Science', media_type: 'Image', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
        { id: 3, title: 'Annual Day Performance', category: 'Annual Day', media_type: 'Image', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
        { id: 4, title: 'Smart Classroom Interactive Session', category: 'Classroom', media_type: 'Image', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80' }
      ]))
    );
  }

  getTeachers(): Observable<TeacherProfile[]> {
    return this.http.get<TeacherProfile[]>(`${this.baseUrl}/teachers/`).pipe(
      catchError(() => of([
        {
          id: 1, employee_id: 'JUP-2020-042', qualification: 'M.Sc. Mathematics, B.Ed.',
          experience_years: 8, subject_specialization: 'Mathematics & Physics',
          designation: 'Senior Teacher', awards: 'Best Educator Award Satara 2024',
          bio: 'Passionate about conceptual math learning and practical problem solving.'
        },
        {
          id: 2, employee_id: 'JUP-2018-019', qualification: 'M.A. English Literature, B.Ed.',
          experience_years: 12, subject_specialization: 'English & Public Speaking',
          designation: 'Department Head', awards: 'Excellence in Communication Award',
          bio: 'Dedicated to cultivating fluent English expression and literary appreciation.'
        }
      ]))
    );
  }

  submitAdmission(appData: AdmissionApplication): Observable<AdmissionApplication> {
    const normalized = {
      ...appData,
      applicant_name: appData.applicant_name?.trim(),
      parent_name: appData.parent_name?.trim(),
      parent_email: normalizeEmail(appData.parent_email || ''),
      parent_phone: normalizePhone(appData.parent_phone || '') || appData.parent_phone,
      address: appData.address?.trim(),
    };

    const classNames: Record<number, string> = {
      1: 'Mini KG', 2: 'Jr. KG', 3: 'Grade 1', 4: 'Grade 5', 5: 'Grade 8', 6: 'Grade 10'
    };

    return this.http.post<AdmissionApplication>(`${this.baseUrl}/admissions/`, normalized).pipe(
      tap((savedApp) => {
        const appWithClass = {
          ...savedApp,
          class_name: classNames[savedApp.applying_for_class] || `Class ${savedApp.applying_for_class}`
        };
        this.admissions$.next([appWithClass, ...this.admissions$.value]);
        this.toast.success('Application submitted successfully! We will contact you within 2 business days.', 'Application Received');
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to submit application. Please check your details and try again.');
        return throwError(() => err);
      })
    );
  }

  updateAdmissionStatus(appId: number, status: 'Approved' | 'Rejected' | 'Under_Review', remarks?: string) {
    const current = this.admissions$.value;
    const updated = current.map(item => {
      if (item.id === appId) {
        return { ...item, status, remarks: remarks || item.remarks };
      }
      return item;
    });
    this.admissions$.next(updated);

    // Call backend endpoint as well
    this.http.patch(`${this.baseUrl}/admissions/${appId}/update_status/`, { status, remarks }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.baseUrl}/analytics/dashboard/`).pipe(
      catchError(() => of({
        role: 'TRUSTEE',
        total_students: 1250,
        total_teachers: 68,
        pending_admissions: this.admissions$.value.filter(a => a.status === 'Submitted').length,
        pending_doc_requests: this.documentRequests$.value.filter(d => d.status === 'Applied').length,
        total_collected_fees: 4850000.00
      }))
    );
  }

  submitDocumentRequest(reqData: Partial<DocumentRequest>): Observable<DocumentRequest> {
    return this.http.post<DocumentRequest>(`${this.baseUrl}/document-requests/`, reqData).pipe(
      tap((savedReq) => {
        this.documentRequests$.next([savedReq, ...this.documentRequests$.value]);
        this.toast.success(`Certificate request ${savedReq.request_number} submitted!`);
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to submit certificate request.');
        return throwError(() => err);
      })
    );
  }

  updateDocumentStatus(docId: number, status: 'Approved' | 'Rejected' | 'Issued', remarks?: string) {
    const current = this.documentRequests$.value;
    const updated = current.map(item => {
      if (item.id === docId) {
        return { ...item, status, admin_remarks: remarks || item.admin_remarks };
      }
      return item;
    });
    this.documentRequests$.next(updated);

    // Bug Fix #13: Call /reject/ when rejected, otherwise /approve/
    const endpoint = status === 'Rejected' ? 'reject' : 'approve';
    this.http.post(`${this.baseUrl}/document-requests/${docId}/${endpoint}/`, { remarks }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  updateLeaveStatus(leaveId: number, status: 'Approved' | 'Rejected', reviewerName: string = 'Dr. Sunita Joshi') {
    const current = this.leaves$.value;
    const updated = current.map(item => {
      if (item.id === leaveId) {
        return { ...item, status, reviewed_by: reviewerName };
      }
      return item;
    });
    this.leaves$.next(updated);

    // Call backend API endpoint for leave approval/rejection
    const endpoint = status === 'Rejected' ? 'reject' : 'approve';
    this.http.post(`${this.baseUrl}/leave-applications/${leaveId}/${endpoint}/`, {}).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  submitLeave(data: Partial<LeaveApp>): Observable<LeaveApp> {
    return this.http.post<LeaveApp>(`${this.baseUrl}/leave-applications/`, data).pipe(
      tap((savedLeave) => {
        this.leaves$.next([savedLeave, ...this.leaves$.value]);
        this.toast.success('Leave application submitted for approval.');
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to submit leave application.');
        return throwError(() => err);
      })
    );
  }

  getHomework(): Observable<HomeworkItem[]> {
    return this.http.get<HomeworkItem[]>(`${this.baseUrl}/homework/`).pipe(
      catchError(() => of([
        {
          id: 1,
          section: 1,
          section_display: 'Grade 5 - Section A',
          subject: 1,
          subject_name: 'Mathematics',
          title: 'Fractions Exercise 4.2 & Word Problems',
          description: 'Complete questions 1 to 15 from NCERT Mathematics page 78 in homework notebook. Show all steps clearly.',
          due_date: '2026-02-10',
          created_by_name: 'Mrs. Anjali Deshmukh',
          created_at: '2026-02-05',
          is_active: true
        },
        {
          id: 2,
          section: 1,
          section_display: 'Grade 5 - Section A',
          subject: 2,
          subject_name: 'General Science',
          title: 'Plant Cell Diagram & Organelle Labelling',
          description: 'Draw neat labelled diagram of plant cell with 5 major organelles on A4 sheet and explain photosynthesis in 5 lines.',
          due_date: '2026-02-12',
          created_by_name: 'Mr. Ramesh Kulkarni',
          created_at: '2026-02-05',
          is_active: true
        },
        {
          id: 3,
          section: 1,
          section_display: 'Grade 5 - Section A',
          subject: 3,
          subject_name: 'English Literature',
          title: 'Essay: The Importance of Trees & Afforestation',
          description: 'Write a 200-word essay on environmental conservation and tree plantation drives in Satara district.',
          due_date: '2026-02-14',
          created_by_name: 'Dr. Sunita Joshi',
          created_at: '2026-02-06',
          is_active: true
        }
      ]))
    );
  }

  // ── Visitor Log Methods ─────────────────────────────────────────────────

  /**
   * Submit a visitor enquiry from the public floating widget.
   * Updates the reactive store immediately so the Clerk dashboard reflects it in real-time.
   */
  submitVisitorEnquiry(data: {
    phone: string; name: string; email?: string;
    purpose: string; message?: string;
  }): Observable<SiteVisitorLog> {
    const purposeLabels: Record<string, string> = {
      Admission: 'Admission Enquiry', General: 'General Information',
      Visit: 'Schedule School Visit', Fee: 'Fee / Scholarship Info', Other: 'Other'
    };
    const newLog: SiteVisitorLog = {
      id: Date.now(),
      phone: data.phone,
      name: data.name,
      email: data.email,
      purpose: data.purpose,
      purpose_display: purposeLabels[data.purpose] || data.purpose,
      message: data.message,
      page_visited: window.location.pathname || 'Public Website',
      visited_at: new Date().toISOString(),
      visited_at_formatted: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      is_contacted: false
    };

    // Immediately push to reactive store — Clerk sees it without refresh!
    const current = this.visitorLogs$.value;
    this.visitorLogs$.next([newLog, ...current]);

    return this.http.post<SiteVisitorLog>(`${this.baseUrl}/visitor-logs/`, data).pipe(
      catchError(() => of(newLog))
    );
  }

  /** Clerk marks a visitor lead as contacted (called them back). */
  markVisitorContacted(logId: number, notes: string = '') {
    const current = this.visitorLogs$.value;
    const updated = current.map(item =>
      item.id === logId ? { ...item, is_contacted: true, contacted_notes: notes } : item
    );
    this.visitorLogs$.next(updated);

    this.http.patch(`${this.baseUrl}/visitor-logs/${logId}/mark_contacted/`, { notes }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // ── Contact Message Methods ─────────────────────────────────────────────

  submitContactMessage(data: Partial<ContactMessage>): Observable<ContactMessage> {
    // Normalize before sending
    const normalized = {
      ...data,
      name: data.name?.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      email: normalizeEmail(data.email || ''),
      phone: data.phone ? (normalizePhone(data.phone) || data.phone) : data.phone,
      subject: data.subject?.trim(),
      message: data.message?.trim().replace(/<[^>]*>/g, ''), // strip HTML
    };

    const newMsg: ContactMessage = {
      id: Date.now(),
      name: normalized.name || '',
      email: normalized.email || '',
      phone: normalized.phone || '',
      subject: normalized.subject || '',
      message: normalized.message || '',
      created_at: new Date().toISOString(),
      is_resolved: false
    };
    return this.http.post<ContactMessage>(`${this.baseUrl}/contact-messages/`, normalized).pipe(
      tap((savedMsg) => {
        this.contactMessages$.next([savedMsg, ...this.contactMessages$.value]);
        this.toast.success('Your message has been sent! We will respond within 1-2 business days.', 'Message Received');
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to send message. Please check your details.');
        return throwError(() => err);
      })
    );
  }

  resolveContactMessage(msgId: number) {
    const current = this.contactMessages$.value;
    const updated = current.map(item =>
      item.id === msgId ? { ...item, is_resolved: true } : item
    );
    this.contactMessages$.next(updated);
    this.http.patch(`${this.baseUrl}/contact-messages/${msgId}/`, { is_resolved: true }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // ── Backend Hydration — load live data into reactive stores ─────────────

  /**
   * Call once on app startup (or portal init) to hydrate all reactive BehaviorSubject stores
   * from the live backend API. Falls back to in-memory seed data on failure.
   */
  loadDocumentRequestsFromBackend() {
    this.http.get<DocumentRequest[]>(`${this.baseUrl}/document-requests/`).pipe(
      catchError(() => of(this.documentRequests$.value))
    ).subscribe(data => { if (data.length) this.documentRequests$.next(data); });
  }

  loadAdmissionsFromBackend() {
    this.http.get<AdmissionApplication[]>(`${this.baseUrl}/admissions/`).pipe(
      catchError(() => of(this.admissions$.value as any))
    ).subscribe((data: any[]) => { if (data.length) this.admissions$.next(data); });
  }

  loadLeavesFromBackend() {
    this.http.get<LeaveApp[]>(`${this.baseUrl}/leave-applications/`).pipe(
      catchError(() => of(this.leaves$.value))
    ).subscribe(data => { if (data.length) this.leaves$.next(data); });
  }

  loadVisitorLogsFromBackend() {
    this.http.get<SiteVisitorLog[]>(`${this.baseUrl}/visitor-logs/`).pipe(
      catchError(() => of(this.visitorLogs$.value))
    ).subscribe(data => { if (data.length) this.visitorLogs$.next(data); });
  }

  loadContactMessagesFromBackend() {
    this.http.get<ContactMessage[]>(`${this.baseUrl}/contact-messages/`).pipe(
      catchError(() => of(this.contactMessages$.value))
    ).subscribe(data => { if (data.length) this.contactMessages$.next(data); });
  }

  /** Hydrate ALL stores at once — call from portal ngOnInit */
  loadAllPortalData() {
    this.loadDocumentRequestsFromBackend();
    this.loadAdmissionsFromBackend();
    this.loadLeavesFromBackend();
    this.loadVisitorLogsFromBackend();
    this.loadContactMessagesFromBackend();
  }

  // ── Student Portal: Attendance, Grades, Fees, Timetable ─────────────────

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/attendance/`).pipe(
      catchError(() => of([
        { date: '2026-02-04', day: 'Wednesday', status: 'Present', remarks: 'On Time' },
        { date: '2026-02-03', day: 'Tuesday', status: 'Present', remarks: 'On Time' },
        { date: '2026-02-02', day: 'Monday', status: 'Absent', remarks: 'Sick Leave — Medical Certificate Submitted' },
        { date: '2026-01-31', day: 'Saturday', status: 'Present', remarks: 'On Time' },
        { date: '2026-01-30', day: 'Friday', status: 'Present', remarks: 'On Time' },
        { date: '2026-01-29', day: 'Thursday', status: 'Late', remarks: 'Late by 15 min — Traffic' },
        { date: '2026-01-28', day: 'Wednesday', status: 'Present', remarks: 'On Time' },
        { date: '2026-01-27', day: 'Tuesday', status: 'Present', remarks: 'On Time' },
      ] as any[]))
    );
  }

  getGrades(): Observable<GradeResult[]> {
    return this.http.get<GradeResult[]>(`${this.baseUrl}/grades/`).pipe(
      catchError(() => of([
        { id: 1, subject_name: 'Mathematics', marks_obtained: 92.5, total_marks: 100, grade: 'A+', remarks: 'Outstanding Concept Clarity', exam_name: 'Term 1 Exam 2026' },
        { id: 2, subject_name: 'General Science', marks_obtained: 88.0, total_marks: 100, grade: 'A', remarks: 'Excellent Practical Work', exam_name: 'Term 1 Exam 2026' },
        { id: 3, subject_name: 'English Language & Literature', marks_obtained: 90.0, total_marks: 100, grade: 'A+', remarks: 'Fluent Expression, Excellent Essays', exam_name: 'Term 1 Exam 2026' },
        { id: 4, subject_name: 'Marathi', marks_obtained: 85.0, total_marks: 100, grade: 'A', remarks: 'Good Grammar & Writing Skills', exam_name: 'Term 1 Exam 2026' },
        { id: 5, subject_name: 'Hindi', marks_obtained: 87.0, total_marks: 100, grade: 'A', remarks: 'Very Good Comprehension', exam_name: 'Term 1 Exam 2026' },
        { id: 6, subject_name: 'Environmental Science (EVS)', marks_obtained: 91.0, total_marks: 100, grade: 'A+', remarks: 'Excellent Project Work', exam_name: 'Term 1 Exam 2026' },
        { id: 7, subject_name: 'Drawing & Art', marks_obtained: 95.0, total_marks: 100, grade: 'A+', remarks: 'Exceptional Creative Talent', exam_name: 'Term 1 Exam 2026' },
      ] as any[]))
    );
  }

  getFeePayments(): Observable<FeePayment[]> {
    return this.http.get<FeePayment[]>(`${this.baseUrl}/fee-payments/`).pipe(
      catchError(() => of([
        { id: 1, invoice_number: 'JUP-INV-2026-1049', title: 'Annual Academic Fee — Term 1 (2025–26)', total_amount: 22500, paid_amount: 22500, due_date: '2025-07-15', payment_status: 'Paid' },
        { id: 2, invoice_number: 'JUP-INV-2026-1088', title: 'Annual Academic Fee — Term 2 (2025–26)', total_amount: 22500, paid_amount: 0, due_date: '2026-01-15', payment_status: 'Pending' },
        { id: 3, invoice_number: 'JUP-INV-2026-1102', title: 'Sports Day & Activity Fee', total_amount: 1500, paid_amount: 1500, due_date: '2026-02-01', payment_status: 'Paid' },
      ] as any[]))
    );
  }

  getTimetable(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/timetable/`).pipe(
      catchError(() => of([]))
    );
  }

  // ── Document & Receipt Authenticated Blob Downloads ────────────────────
  downloadDocumentPdfBlob(docId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/document-requests/${docId}/download_pdf/`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${docId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to download certificate PDF.');
        return throwError(() => err);
      })
    );
  }

  downloadFeeReceiptBlob(invoiceNumber: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/fee-payments/download-receipt/${invoiceNumber}/`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNumber}_Receipt.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to download fee receipt PDF.');
        return throwError(() => err);
      })
    );
  }

  // ── Academic Classes ───────────────────────────────────────────────────
  getAcademicClasses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/academic-classes/`).pipe(
      catchError(() => of([
        { id: 1, name: 'Mini KG' },
        { id: 2, name: 'Jr. KG' },
        { id: 3, name: 'Grade 1' },
        { id: 4, name: 'Grade 5' },
        { id: 5, name: 'Grade 8' },
        { id: 6, name: 'Grade 10' }
      ]))
    );
  }

  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subjects/`).pipe(
      catchError(() => of([
        { id: 1, name: 'Mathematics', code: 'MATH501' },
        { id: 2, name: 'General Science', code: 'SCI501' },
        { id: 3, name: 'English Literature', code: 'ENG501' },
        { id: 4, name: 'Environmental Studies', code: 'EVS501' }
      ]))
    );
  }

  // ── Teacher & Section Operations ──────────────────────────────────────
  getSections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sections/`).pipe(
      catchError(() => of([
        { id: 1, name: 'A', academic_class_name: 'Grade 5', room_number: 'Room 201', max_students: 40 },
        { id: 2, name: 'A', academic_class_name: 'Grade 10', room_number: 'Room 302', max_students: 35 }
      ]))
    );
  }

  getStudents(params?: { section?: number }): Observable<any[]> {
    let url = `${this.baseUrl}/students/`;
    if (params?.section) {
      url += `?section=${params.section}`;
    }
    return this.http.get<any[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  markAttendanceRecord(data: { student: number; date: string; status: string; remarks?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance/`, data).pipe(
      tap(() => this.toast.success('Attendance recorded successfully!')),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to record attendance.');
        return throwError(() => err);
      })
    );
  }

  createHomework(data: { section: number; subject: number; title: string; description: string; due_date: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/homework/`, data).pipe(
      tap(() => this.toast.success('Homework assignment posted successfully!')),
      catchError(err => {
        this.toast.fromHttpError(err, 'Failed to post homework.');
        return throwError(() => err);
      })
    );
  }
}




