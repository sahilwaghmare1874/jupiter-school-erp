export type UserRole = 'TRUSTEE' | 'PRINCIPAL' | 'TEACHER' | 'CLERK' | 'STUDENT';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  student_profile?: StudentProfile;
  teacher_profile?: TeacherProfile;
}

export interface StudentProfile {
  id: number;
  gr_number: string;
  roll_number: string;
  class_name?: string;
  section_name?: string;
  father_name: string;
  mother_name: string;
  guardian_contact: string;
  blood_group: string;
  admission_date: string;
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
  employee_id: string;
  qualification: string;
  experience_years: number;
  subject_specialization: string;
  designation: string;
  awards?: string;
  bio?: string;
  demo_video_url?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}
