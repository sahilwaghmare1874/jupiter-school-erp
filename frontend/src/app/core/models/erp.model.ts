export interface SchoolInfo {
  name: string;
  tagline: string;
  establishment_year: number;
  address: string;
  email: string;
  phone: string;
  principal_message: string;
  trustee_message: string;
  logo_url?: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  order: number;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'General' | 'Admission' | 'Exam' | 'Circular' | string;
  target_role: string;
  posted_at: string;
  is_active: boolean;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  image_url?: string;
  is_upcoming: boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: 'Sports' | 'Annual Day' | 'Science' | 'Classroom' | 'Celebration' | string;
  media_type: 'Image' | 'Video' | string;
  url: string;
  thumbnail?: string;
}

export interface Facility {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  icon_name?: string;
  is_active?: boolean;
}

export interface TeacherProfile {
  id: number;
  user?: {
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  employee_id?: string;
  designation?: string;
  qualification?: string;
  experience_years?: number;
  subject_specialization?: string;
  bio?: string;
  photo_url?: string;
}

export interface AdmissionApplication {
  id?: number;
  application_number?: string;
  applicant_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  applying_for_class: number;
  class_name?: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  previous_school?: string;
  previous_marks_percentage?: number;
  status?: 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected' | string;
  remarks?: string;
}

export interface AttendanceRecord {
  id: number;
  student_name: string;
  gr_number: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | string;
  remarks?: string;
}

export interface GradeResult {
  id: number;
  subject_name: string;
  subject_code?: string;
  exam_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage?: number;
  grade: string;
  remarks: string;
  academic_year: string;
}

export interface FeePayment {
  id: number;
  invoice_number: string;
  student_name: string;
  gr_number: string;
  title: string;
  total_amount: number;
  paid_amount: number;
  balance_due?: number;
  due_date: string;
  payment_status: 'Paid' | 'Partial' | 'Pending' | 'Overdue' | string;
  payment_mode: string;
  transaction_id?: string;
}

export interface DocumentRequest {
  id: number;
  request_number: string;
  student_name: string;
  gr_number: string;
  document_type: 'Bonafide' | 'Leaving' | 'Transfer' | 'ID_Card' | 'Hall_Ticket' | 'Marksheet' | string;
  doc_type_display: string;
  purpose: string;
  status: 'Applied' | 'Under_Review' | 'Approved' | 'Rejected' | 'Issued' | string;
  admin_remarks?: string;
  applied_at: string;
}

// Bug Fix #16: Added missing clerk_specific, trustee_specific, principal_specific fields
export interface DashboardAnalytics {
  role: string;
  total_students?: number;
  total_teachers?: number;
  pending_admissions?: number;
  pending_doc_requests?: number;
  total_collected_fees?: number;
  total_events?: number;
  upcoming_events?: number;
  student_specific?: {
    gr_number: string;
    class_name: string;
    section: string;
    attendance_percentage: number;
    present_days: number;
    total_days: number;
    pending_fees: number;
    active_requests: number;
    total_homeworks: number;
    latest_grade: string;
    latest_exam: string;
  };
  teacher_specific?: {
    my_sections: number;
    total_students_in_class: number;
    pending_leaves: number;
  };
  clerk_specific?: {
    new_visitors_today: number;
    uncontacted_leads: number;
    new_messages_today: number;
    total_visitor_leads: number;
    doc_requests_applied: number;
    doc_requests_approved_today: number;
    total_contact_messages: number;
    unresolved_messages: number;
  };
  trustee_specific?: {
    total_fee_target: number;
    total_fee_pending: number;
    approved_admissions: number;
    total_admissions: number;
    total_visitor_leads: number;
    overdue_fee_students: number;
  };
  principal_specific?: {
    pending_student_leaves: number;
    pending_teacher_leaves: number;
    active_homework: number;
    published_results: number;
    total_sections: number;
    total_subjects: number;
  };
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  achievement_type: 'Student' | 'Teacher' | 'School' | 'Sports' | string;
  achieved_by: string;
  competition_name?: string;
  position?: string;
  date_achieved: string;
  image_url?: string;
}

export interface Timetable {
  id: number;
  section: number;
  section_name: string;
  subject: number;
  subject_name: string;
  teacher: number;
  teacher_name: string;
  day: string;
  start_time: string;
  end_time: string;
  period_number: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  is_resolved: boolean;
  admin_notes?: string;
}

export interface SiteVisitorLog {
  id: number;
  /** Primary contact field — shown prominently on Clerk dashboard */
  phone: string;
  name: string;
  email?: string;
  purpose: 'Admission' | 'General' | 'Visit' | 'Fee' | 'Other' | string;
  purpose_display?: string;
  message?: string;
  page_visited?: string;
  ip_address?: string;
  visited_at: string;
  visited_at_formatted?: string;
  is_contacted: boolean;
  contacted_notes?: string;
}

export interface HomeworkItem {
  id: number;
  section: number;
  section_display?: string;
  subject: number;
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  created_by_name?: string;
  created_at: string;
  is_active: boolean;
}

// AI Chat message types
export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiChatResponse {
  reply: string;
  role_context: string;
  fallback?: boolean;
}
