# 🗄️ Jupiter English Medium School — Database ER Diagram

> **School**: Jupiter English Medium School, Shendre, Satara, Maharashtra  
> **Database**: PostgreSQL 15  
> **ORM**: Django 4.2

---

## Entity Relationship Diagram

```mermaid
erDiagram
    CustomUser {
        int id PK
        string username
        string email
        string first_name
        string last_name
        string role
        string phone
        string address
        date date_of_birth
        string gender
    }

    SchoolInfo {
        int id PK
        string name
        string tagline
        int establishment_year
        string address
        string email
        string phone
        text principal_message
        text trustee_message
        string logo_url
    }

    TeacherProfile {
        int id PK
        int user_id FK
        string employee_id
        string qualification
        int experience_years
        string subject_specialization
        string designation
        text awards
        text bio
        date joining_date
    }

    StudentProfile {
        int id PK
        int user_id FK
        string gr_number
        string roll_number
        int section_id FK
        string father_name
        string mother_name
        string guardian_contact
        string blood_group
        date admission_date
        string house
        bool is_active
    }

    AcademicClass {
        int id PK
        string name
        string level_type
        string stream
        decimal annual_fee
        text description
    }

    Section {
        int id PK
        int academic_class_id FK
        string name
        string room_number
        int class_teacher_id FK
        int max_students
    }

    Subject {
        int id PK
        string name
        string code
        int academic_class_id FK
        int teacher_id FK
        decimal passing_marks
        decimal total_marks
    }

    HeroSlide {
        int id PK
        string title
        text subtitle
        string image_url
        int order
        string cta_text
        string cta_link
        bool is_active
    }

    Announcement {
        int id PK
        string title
        text content
        string category
        string target_role
        datetime posted_at
        bool is_active
    }

    Event {
        int id PK
        string title
        text description
        date event_date
        date end_date
        string location
        string category
        string image_url
        bool is_upcoming
    }

    GalleryItem {
        int id PK
        string title
        string category
        string media_type
        string url
        string thumbnail
        string album_name
        datetime uploaded_at
    }

    Achievement {
        int id PK
        string title
        text description
        string achievement_type
        string achieved_by
        string competition_name
        string position
        date date_achieved
        string image_url
    }

    AdmissionApplication {
        int id PK
        string application_number
        string applicant_name
        date date_of_birth
        string gender
        int applying_for_class FK
        string parent_name
        string parent_phone
        string parent_email
        text address
        string previous_school
        string status
        text remarks
        datetime created_at
    }

    Attendance {
        int id PK
        int student_id FK
        date date
        string status
        string remarks
        int marked_by FK
    }

    GradeResult {
        int id PK
        int student_id FK
        int subject_id FK
        string exam_name
        decimal marks_obtained
        decimal total_marks
        string grade
        string remarks
        string academic_year
        bool published
    }

    Homework {
        int id PK
        int section_id FK
        int subject_id FK
        string title
        text description
        date due_date
        int created_by FK
        datetime created_at
    }

    FeePayment {
        int id PK
        string invoice_number
        int student_id FK
        string title
        decimal total_amount
        decimal paid_amount
        date due_date
        string payment_status
        string payment_mode
        string transaction_id
        datetime paid_at
    }

    DocumentRequest {
        int id PK
        string request_number
        int student_id FK
        string document_type
        text purpose
        string status
        text admin_remarks
        int approved_by FK
        datetime applied_at
        datetime approved_at
    }

    LeaveApplication {
        int id PK
        int applicant_id FK
        string leave_type
        text reason
        date start_date
        date end_date
        string status
        int reviewed_by FK
        datetime applied_at
    }

    Timetable {
        int id PK
        int section_id FK
        int subject_id FK
        int teacher_id FK
        string day
        time start_time
        time end_time
        int period_number
    }

    ContactMessage {
        int id PK
        string name
        string email
        string phone
        string subject
        text message
        datetime created_at
        bool is_resolved
        text admin_notes
    }

    CustomUser ||--o| TeacherProfile : "has teacher profile"
    CustomUser ||--o| StudentProfile : "has student profile"
    StudentProfile }o--|| Section : "enrolled in"
    Section }o--|| AcademicClass : "belongs to"
    Section }o--o| TeacherProfile : "class teacher"
    Subject }o--|| AcademicClass : "taught in"
    Subject }o--o| TeacherProfile : "taught by"
    Attendance }o--|| StudentProfile : "belongs to student"
    Attendance }o--o| CustomUser : "marked by"
    GradeResult }o--|| StudentProfile : "scored by"
    GradeResult }o--|| Subject : "for subject"
    Homework }o--|| Section : "assigned to"
    Homework }o--|| Subject : "for subject"
    Homework }o--|| CustomUser : "created by"
    FeePayment }o--|| StudentProfile : "billed to"
    DocumentRequest }o--|| StudentProfile : "requested by"
    DocumentRequest }o--o| CustomUser : "approved by"
    LeaveApplication }o--|| CustomUser : "applied by"
    LeaveApplication }o--o| CustomUser : "reviewed by"
    Timetable }o--|| Section : "for section"
    Timetable }o--|| Subject : "for subject"
    Timetable }o--|| TeacherProfile : "taken by"
    AdmissionApplication }o--|| AcademicClass : "applying for"
```

---

## 📊 Table Summary

| Model | Records (Est.) | Description |
|-------|---------------|-------------|
| CustomUser | 1,400+ | Students, Teachers, Staff, Admin |
| SchoolInfo | 1 | Singleton school identity record |
| TeacherProfile | 68+ | Extended teacher data |
| StudentProfile | 1,250+ | Active enrolled students |
| AcademicClass | 14 | Mini KG to Grade 10 |
| Section | 35+ | Class-wise sections |
| Subject | 100+ | All subjects per class |
| HeroSlide | 3–5 | Homepage hero banners |
| Announcement | 50+ | Notices and circulars |
| Event | 30+ | Annual calendar events |
| GalleryItem | 200+ | Photos and videos |
| Achievement | 50+ | Awards and records |
| AdmissionApplication | 500+ | Yearly applications |
| Attendance | 300,000+ | Daily per-student records |
| GradeResult | 50,000+ | Exam marks per subject |
| Homework | 2,000+ | Teacher assignments |
| FeePayment | 5,000+ | Annual invoices |
| DocumentRequest | 300+ | Certificate applications |
| LeaveApplication | 500+ | Annual leave requests |
| Timetable | 500+ | Weekly period entries |
| ContactMessage | 200+ | Public enquiries |

---

*© 2026 Jupiter Education Trust — Jupiter English Medium School, Shendre, Satara, Maharashtra*
