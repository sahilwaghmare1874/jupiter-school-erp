# 🏫 Jupiter English Medium School — School Management System ERP

> **Production-Ready Enterprise ERP** for Jupiter English Medium School, Shendre, Satara, Maharashtra

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.io)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django)](https://djangoproject.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)

---

## 🏆 About Jupiter English Medium School

**Jupiter English Medium School**, located on **NH-4 Highway, Shendre, Satara, Maharashtra 415001**, is a leading English medium institution providing quality education from **Mini KG to Grade 10** since 1998.

- 📞 Phone: +91 2162 270123 / +91 98220 12345
- 📧 Email: info@jupiterschoolsatara.org
- 📍 Address: NH-4 Highway, Shendre, Satara, Maharashtra 415001
- 🌐 Trust: Jupiter Education Trust

---

## 🚀 Features

### 🌐 Public Website
| Feature | Description |
|---------|------------|
| Hero Carousel | Full-screen dynamic hero banners managed via CMS |
| Live News Ticker | Scrolling announcements and notices |
| About Us | Principal & Trustee messages, history, vision, mission |
| Academics | Curriculum wings: Pre-Primary, Primary, Secondary |
| Facilities | Smart classrooms, STEM labs, library, sports complex |
| Events | Upcoming & past events with filterable view |
| Gallery | Photo gallery with category filters |
| Achievements | Awards tracker with stats banner |
| Teachers | Faculty directory with qualifications |
| Contact | Address, map, working hours, contact form |

### 🎓 Student ERP Portal
| Module | Features |
|--------|---------|
| Dashboard | Profile card, KPI stats, live school notices |
| Attendance | Monthly records, present/absent/late summary |
| Timetable | Weekly class schedule per section |
| Fee Receipts | Full payment history, PDF download |
| Exam Results | Subject-wise marksheet with grades & remarks |
| Certificates | Apply for Bonafide/TC/LC, download approved PDFs |

### 🛡️ Admin / Staff ERP Portal
| Module | Features |
|--------|---------|
| Analytics | KPI cards, class-wise enrollment progress bars |
| Admissions | Review and approve/reject admission applications |
| Student Directory | Search students by name or GR number |
| Fee Management | Fee ledger, collection summary, print receipts |
| Certificate Hub | Approve certificate requests, generate PDFs |
| CMS Engine | Post announcements, edit hero banners live |

### 🔐 Multi-Role Authentication
- **TRUSTEE** — Full system access & analytics
- **PRINCIPAL** — Academic oversight & approvals
- **TEACHER** — Timetable, attendance, homework
- **CLERK** — Fee collection, document processing
- **STUDENT** — Personal portal with self-service

---

## 🛠️ Technology Stack

### Frontend
```
Angular 19 (Standalone Components, Signals API)
TypeScript 5.x
Bootstrap 5.3
SCSS (Custom Design System)
Font Awesome 6 Pro Icons
Google Fonts (Outfit, Inter, Playfair Display)
```

### Backend
```
Python 3.11+
Django 4.2+
Django REST Framework 3.14+
Simple JWT (Token Authentication)
ReportLab (PDF Certificate Generation)
drf-yasg (Swagger API Docs)
django-cors-headers
Pillow (Image Processing)
```

### Infrastructure
```
PostgreSQL 15 (Primary Database)
Nginx (Static Files & Reverse Proxy)
Gunicorn (WSGI Application Server)
Docker + Docker Compose
GitHub Actions (CI/CD)
```

---

## 📁 Project Structure

```
jupiter/
├── backend/                        # Django REST API
│   ├── core/                       # Main application module
│   │   ├── models.py               # 15+ database models
│   │   ├── serializers.py          # DRF serializers
│   │   ├── views.py                # API viewsets
│   │   ├── urls.py                 # API routes
│   │   ├── permissions.py          # Role-based access control
│   │   ├── utils.py                # PDF generation (ReportLab)
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py    # Initial data seeding
│   ├── school_erp/
│   │   ├── settings.py             # Django settings
│   │   └── urls.py                 # Root URL config
│   └── requirements.txt
│
├── frontend/                       # Angular 19 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.config.ts       # App bootstrap config
│   │   │   ├── app.routes.ts       # SPA routing
│   │   │   ├── core/
│   │   │   │   ├── models/         # TypeScript interfaces
│   │   │   │   ├── services/       # API & Auth services
│   │   │   │   ├── guards/         # Route guards
│   │   │   │   └── interceptors/   # HTTP interceptors
│   │   │   ├── shared/
│   │   │   │   └── components/     # Navbar, Footer
│   │   │   ├── public/             # Public website pages
│   │   │   │   ├── home/           # Hero, About, Features
│   │   │   │   ├── about/          # About us page
│   │   │   │   ├── academics/      # Curriculum wings
│   │   │   │   ├── admissions/     # Multi-step wizard
│   │   │   │   ├── events/         # Events & activities
│   │   │   │   ├── gallery/        # Photo gallery
│   │   │   │   ├── facilities/     # Campus facilities
│   │   │   │   ├── achievements/   # Awards tracker
│   │   │   │   ├── teachers/       # Faculty directory
│   │   │   │   ├── contact/        # Contact page
│   │   │   │   └── login/          # ERP portal login
│   │   │   ├── student-portal/     # Student ERP dashboard
│   │   │   └── admin-portal/       # Admin/Staff dashboard
│   │   ├── styles.scss             # Global design system
│   │   └── index.html              # App shell
│   ├── package.json
│   └── angular.json
│
├── docker-compose.yml              # Full-stack container setup
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/jupiter-school-erp
cd jupiter-school-erp

# Start full stack
docker-compose up --build -d

# Seed initial data
docker-compose exec backend python manage.py seed_data
docker-compose exec backend python manage.py createsuperuser

# Access
# Frontend: http://localhost:4200
# API:      http://localhost:8000/api
# Swagger:  http://localhost:8000/swagger
# Admin:    http://localhost:8000/admin
```

### Option 2: Manual Development Setup

```bash
# ── Backend ──────────────────────
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000

# ── Frontend ─────────────────────
cd frontend
npm install
npx ng serve --port 4200
```

---

## 🔐 Demo Login Credentials

| Role | Username | Password | Portal |
|------|----------|----------|--------|
| Trustee | trustee_admin | Jupiter@2026 | Admin Portal |
| Principal | principal_user | Jupiter@2026 | Admin Portal |
| Teacher | teacher_anjali | Jupiter@2026 | Admin Portal |
| Clerk | clerk_mahesh | Jupiter@2026 | Admin Portal |
| Student | student_alex | Jupiter@2026 | Student Portal |

> **Quick Demo**: Use the "Quick Role Login" buttons on the Login page to instantly switch roles without entering passwords.

---

## 📋 API Documentation

Full REST API documentation is available at:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/token/` | JWT Login |
| GET | `/api/auth/me/` | Current User Profile |
| GET | `/api/school-info/` | School Info (CMS) |
| GET | `/api/hero-slides/` | Homepage Banners |
| GET | `/api/announcements/` | School Notices |
| GET | `/api/events/` | Events & Activities |
| GET | `/api/gallery/` | Photo Gallery |
| GET | `/api/teachers/` | Faculty Directory |
| POST | `/api/admissions/` | Submit Admission Form |
| GET | `/api/analytics/dashboard/` | Admin KPI Dashboard |
| POST | `/api/document-requests/` | Apply for Certificate |
| GET | `/api/document-requests/{id}/download_pdf/` | Download Certificate PDF |

---

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 4200 | Angular Nginx SPA |
| `backend` | 8000 | Django Gunicorn API |
| `db` | 5432 | PostgreSQL Database |

---

## 🏗️ Database Models

See [ER_DIAGRAM.md](./ER_DIAGRAM.md) for full entity relationship diagram.

**Core Models:**
- `CustomUser` — Extended user with 5 roles
- `SchoolInfo` — Singleton CMS for school identity
- `HeroSlide` — Homepage carousel banners
- `Announcement` — Notices & circulars
- `Event` — School events calendar
- `GalleryItem` — Photo & video gallery
- `TeacherProfile` — Faculty extended data
- `AcademicClass` — Class levels & fees
- `Section` — Class sections & class teachers
- `Subject` — Subjects per class
- `StudentProfile` — Student extended data
- `AdmissionApplication` — Online admission forms
- `Attendance` — Daily attendance records
- `GradeResult` — Subject-wise exam results
- `FeePayment` — Fee invoices & receipts
- `DocumentRequest` — Certificate applications
- `Timetable` — Weekly class schedules
- `Achievement` — Awards & recognitions
- `ContactMessage` — Website contact submissions

---

## 🔒 Security Features

- JWT Token Authentication (access + refresh tokens)
- Role-Based Access Control (RBAC) on all API endpoints
- Django CORS headers for frontend isolation
- Password hashing via Django's PBKDF2 algorithm
- File upload validation and sandboxing
- Rate limiting via Django REST Framework throttling
- HTTPS-ready Nginx configuration

---

## 📝 License

This software is proprietary and developed exclusively for **Jupiter English Medium School, Shendre, Satara, Maharashtra**.

**© 2026 Jupiter Education Trust — All Rights Reserved**

---

*Built with ❤️ for Jupiter English Medium School, Shendre, Satara, Maharashtra — NH-4 Highway*
