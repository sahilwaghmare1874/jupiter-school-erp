from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seeds comprehensive initial test data for the School ERP System'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🏫 Starting SPM School ERP Data Seeding...'))

        # Import models inside handle to avoid AppRegistryNotReady issues
        from core.models import (
            CustomUser, RoleChoices, SchoolInfo, HeroSlide, Announcement, Event,
            GalleryItem, Achievement, TeacherProfile, AcademicClass, LevelTypeChoices,
            Section, Subject, StudentProfile, AdmissionApplication, Attendance,
            GradeResult, Homework, FeePayment, DocumentRequest, LeaveApplication,
            ContactMessage, Timetable
        )

        # ── 1. School Info ─────────────────────────────────────────────────
        school, _ = SchoolInfo.objects.get_or_create(id=1, defaults={
            'name': 'Jupiter English Medium School',
            'tagline': 'Nurturing Intellect, Character & Excellence in Satara Since 1998',
            'establishment_year': 1998,
            'address': 'NH-4 Highway, Shendre, Satara, Maharashtra 415001',
            'email': 'info@jupiterschoolsatara.org',
            'phone': '+91 2162 270123',
            'alternate_phone': '+91 98220 12345',
            'principal_message': (
                'Welcome to Jupiter English Medium School, Shendre Satara. We are committed to providing '
                'a nurturing environment that fosters curiosity, critical thinking, and '
                'moral character to help our students thrive in a rapidly changing world.'
            ),
            'trustee_message': (
                'Jupiter Education Trust, Shendre Satara is dedicated to making quality '
                'English medium education and STEM learning accessible to every child in Satara district.'
            ),
        })
        self.stdout.write('  ✅ School Info created')

        # ── 2. Hero Slides ─────────────────────────────────────────────────
        if not HeroSlide.objects.exists():
            slides_data = [
                ('Excellence in English Medium Education',
                 'Nurturing global leaders with state-of-the-art STEM labs, digital classrooms, and activity-based learning from KG to Grade 10.',
                 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80', 1),
                ('Holistic Personality Development',
                 'A comprehensive curriculum integrating Academics, Sports, Music, Robotics & Community Service for well-rounded excellence.',
                 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80', 2),
                ('100% Board Exam Results - Year After Year',
                 'Our dedicated faculty and proven pedagogical methods deliver consistent outstanding results across all SSC Board examinations.',
                 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80', 3),
            ]
            for title, sub, img, order in slides_data:
                HeroSlide.objects.create(title=title, subtitle=sub, image_url=img, order=order)
        self.stdout.write('  ✅ Hero Slides created')

        # ── 3. Announcements ────────────────────────────────────────────────
        if not Announcement.objects.exists():
            announcements_data = [
                ('Admissions Open 2026–2027', 'Online admissions now open for Mini KG, Junior KG, and all Primary and Secondary grades. Apply before March 31, 2026.', 'Admission', 'ALL'),
                ('Annual Sports Day — Feb 20, 2026', 'SPM Annual Athletic Championship 2026. All students must report in sports uniform by 7:30 AM.', 'Event', 'STUDENT'),
                ('Board Exam Timetable Released', 'SSC Board Exam timetable for Grade 10 has been released. Students should collect their Hall Tickets from the school office.', 'Exam', 'STUDENT'),
                ('Parent-Teacher Meeting — March 5, 2026', 'All parents of Grade 5 to 10 students are requested to attend the quarterly Parent-Teacher Meeting.', 'General', 'ALL'),
                ('School Closed — Republic Day Holiday', 'School will remain closed on January 26, 2026 on account of Republic Day. Regular schedule resumes January 27.', 'Holiday', 'ALL'),
            ]
            for title, content, cat, target in announcements_data:
                Announcement.objects.create(title=title, content=content, category=cat, target_role=target)
        self.stdout.write('  ✅ Announcements created')

        # ── 4. Events ──────────────────────────────────────────────────────
        if not Event.objects.exists():
            today = date.today()
            events_data = [
                ('Annual Science & Robotics Exhibition 2026', 'Students from Grade 5–10 showcase innovative STEM projects, working robots, and science models.', today + timedelta(days=20), 'Science', True),
                ('Inter-School Cultural Fest 2026', 'Annual music, drama, dance competition among 20 partner schools in Pune region.', today + timedelta(days=35), 'Cultural', True),
                ('Annual Sports Meet & Athletic Championship', 'Track and field championship across Red, Blue, Green, and Yellow Houses.', today - timedelta(days=10), 'Sports', False),
                ('Founders Day Celebration', 'Commemorating the founding of Shikshan Prasarak Mandali with distinguished guest speakers.', today - timedelta(days=30), 'Academic', False),
            ]
            for title, desc, evt_date, cat, is_up in events_data:
                Event.objects.create(title=title, description=desc, event_date=evt_date, category=cat, is_upcoming=is_up)
        self.stdout.write('  ✅ Events created')

        # ── 5. Gallery ─────────────────────────────────────────────────────
        if not GalleryItem.objects.exists():
            gallery_data = [
                ('Annual Sports Day Sprint Finals', 'Sports', 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80'),
                ('Robotics Lab Students Experimenting', 'Science', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'),
                ('Annual Cultural Day Performance', 'Annual Day', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'),
                ('Interactive Smart Classroom Session', 'Classroom', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'),
                ('Prize Distribution & Achievements', 'Achievement', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'),
                ('Educational Trip to Science Museum', 'Trip', 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=800&q=80'),
            ]
            for title, cat, url in gallery_data:
                GalleryItem.objects.create(title=title, category=cat, url=url)
        self.stdout.write('  ✅ Gallery items created')

        # ── 6. Academic Classes ─────────────────────────────────────────────
        c_minikg, _ = AcademicClass.objects.get_or_create(name='Mini KG', defaults={'level_type': LevelTypeChoices.PRE_PRIMARY, 'annual_fee': 32000.00})
        c_jrkg, _ = AcademicClass.objects.get_or_create(name='Jr. KG', defaults={'level_type': LevelTypeChoices.PRE_PRIMARY, 'annual_fee': 34000.00})
        c_g1, _ = AcademicClass.objects.get_or_create(name='Grade 1', defaults={'level_type': LevelTypeChoices.PRIMARY, 'annual_fee': 40000.00})
        c_g5, _ = AcademicClass.objects.get_or_create(name='Grade 5', defaults={'level_type': LevelTypeChoices.PRIMARY, 'annual_fee': 45000.00})
        c_g8, _ = AcademicClass.objects.get_or_create(name='Grade 8', defaults={'level_type': LevelTypeChoices.SECONDARY, 'annual_fee': 50000.00})
        c_g10, _ = AcademicClass.objects.get_or_create(name='Grade 10', defaults={'level_type': LevelTypeChoices.SECONDARY, 'annual_fee': 55000.00})
        self.stdout.write('  ✅ Academic Classes created')

        # ── 7. Users by Role ────────────────────────────────────────────────
        def create_user(username, role, first, last, email, is_staff=False):
            u, created = CustomUser.objects.get_or_create(
                username=username,
                defaults={
                    'role': role, 'first_name': first, 'last_name': last,
                    'email': email, 'is_staff': is_staff, 'is_active': True
                }
            )
            if created:
                u.set_password('SchoolPass123!')
                u.save()
            return u

        u_trustee = create_user('trustee_admin', RoleChoices.TRUSTEE, 'Ramesh', 'Kulkarni', 'trustee@spmenglishschool.org', True)
        u_principal = create_user('principal_user', RoleChoices.PRINCIPAL, 'Dr. Sunita', 'Joshi', 'principal@spmenglishschool.org', True)
        u_teacher1 = create_user('teacher_anjali', RoleChoices.TEACHER, 'Anjali', 'Deshmukh', 'anjali.d@spmenglishschool.org')
        u_teacher2 = create_user('teacher_ravi', RoleChoices.TEACHER, 'Ravi', 'Sharma', 'ravi.s@spmenglishschool.org')
        u_clerk = create_user('clerk_mahesh', RoleChoices.CLERK, 'Mahesh', 'Patil', 'clerk@spmenglishschool.org')
        u_student = create_user('student_alex', RoleChoices.STUDENT, 'Alex', 'Sharma', 'alex.sharma@gmail.com')
        u_student2 = create_user('student_priya', RoleChoices.STUDENT, 'Priya', 'Mehta', 'priya.m@gmail.com')
        self.stdout.write('  ✅ Users created (all 5 roles)')

        # ── 8. Teacher Profiles ─────────────────────────────────────────────
        tp1, _ = TeacherProfile.objects.get_or_create(user=u_teacher1, defaults={
            'employee_id': 'EMP-2020-042', 'qualification': 'M.Sc. Mathematics, B.Ed.',
            'experience_years': 8, 'subject_specialization': 'Mathematics & Physics',
            'designation': 'Senior Primary Teacher', 'awards': 'Best Educator Award 2024',
            'bio': 'Passionate about activity-based math learning and STEM integration.',
            'joining_date': date(2020, 6, 1),
        })
        tp2, _ = TeacherProfile.objects.get_or_create(user=u_teacher2, defaults={
            'employee_id': 'EMP-2018-019', 'qualification': 'M.A. English Literature, B.Ed.',
            'experience_years': 12, 'subject_specialization': 'English & Public Speaking',
            'designation': 'Department Head – English', 'awards': 'Excellence in Communication 2023',
            'bio': 'Dedicated to developing fluent English expression and literary appreciation.',
            'joining_date': date(2018, 7, 15),
        })
        self.stdout.write('  ✅ Teacher Profiles created')

        # ── 9. Sections ─────────────────────────────────────────────────────
        sec_g5a, _ = Section.objects.get_or_create(academic_class=c_g5, name='A', defaults={
            'room_number': 'Room 201', 'class_teacher': tp1, 'max_students': 40
        })
        sec_g10a, _ = Section.objects.get_or_create(academic_class=c_g10, name='A', defaults={
            'room_number': 'Room 302', 'class_teacher': tp2, 'max_students': 35
        })
        self.stdout.write('  ✅ Sections created')

        # ── 10. Subjects ─────────────────────────────────────────────────────
        sub_math5, _ = Subject.objects.get_or_create(name='Mathematics', code='MATH501', academic_class=c_g5, defaults={'teacher': tp1, 'total_marks': 100, 'passing_marks': 35})
        sub_sci5, _ = Subject.objects.get_or_create(name='General Science', code='SCI501', academic_class=c_g5, defaults={'total_marks': 100, 'passing_marks': 35})
        sub_eng5, _ = Subject.objects.get_or_create(name='English', code='ENG501', academic_class=c_g5, defaults={'teacher': tp2, 'total_marks': 100, 'passing_marks': 35})
        sub_evs5, _ = Subject.objects.get_or_create(name='Environmental Studies', code='EVS501', academic_class=c_g5, defaults={'total_marks': 100, 'passing_marks': 35})
        self.stdout.write('  ✅ Subjects created')

        # ── 11. Student Profiles ─────────────────────────────────────────────
        sp1, _ = StudentProfile.objects.get_or_create(user=u_student, defaults={
            'gr_number': 'GR-2022-894', 'roll_number': '15', 'section': sec_g5a,
            'father_name': 'Rajesh Sharma', 'mother_name': 'Priya Sharma',
            'guardian_contact': '+91 98765 43210', 'guardian_email': 'rajesh.s@gmail.com',
            'blood_group': 'B+', 'house': 'Blue', 'religion': 'Hindu',
        })
        sp2, _ = StudentProfile.objects.get_or_create(user=u_student2, defaults={
            'gr_number': 'GR-2022-895', 'roll_number': '16', 'section': sec_g5a,
            'father_name': 'Sanjay Mehta', 'mother_name': 'Anita Mehta',
            'guardian_contact': '+91 98220 55678', 'blood_group': 'A+', 'house': 'Red',
        })
        self.stdout.write('  ✅ Student Profiles created')

        # ── 12. Attendance ───────────────────────────────────────────────────
        for i in range(15):
            d = date.today() - timedelta(days=i)
            if d.weekday() < 5:  # Weekdays only
                att_status = 'Present' if i != 3 and i != 8 else 'Absent'
                Attendance.objects.get_or_create(
                    student=sp1, date=d,
                    defaults={'status': att_status, 'marked_by': u_teacher1}
                )
        self.stdout.write('  ✅ Attendance records created')

        # ── 13. Grade Results ────────────────────────────────────────────────
        grades_data = [
            (sp1, sub_math5, 92.50, 'A+', 'Outstanding Concept Clarity'),
            (sp1, sub_sci5, 88.00, 'A', 'Excellent Practical Understanding'),
            (sp1, sub_eng5, 90.00, 'A+', 'Fluent Communication Skills'),
            (sp1, sub_evs5, 85.00, 'A', 'Good Environmental Awareness'),
        ]
        for student, subject, marks, grade, remarks in grades_data:
            GradeResult.objects.get_or_create(
                student=student, subject=subject, exam_name='Term 1 Exam 2026',
                defaults={'marks_obtained': marks, 'total_marks': 100, 'grade': grade,
                          'remarks': remarks, 'academic_year': '2025-2026', 'published': True}
            )
        self.stdout.write('  ✅ Grade Results created')

        # ── 14. Homework ─────────────────────────────────────────────────────
        Homework.objects.get_or_create(
            section=sec_g5a, subject=sub_math5,
            title='Algebra Practice Problems — Chapter 7',
            defaults={
                'description': 'Complete exercises 7.1 to 7.5 from Mathematics textbook. Show all working.',
                'due_date': date.today() + timedelta(days=3),
                'created_by': u_teacher1,
            }
        )
        self.stdout.write('  ✅ Homework created')

        # ── 15. Fee Payments ─────────────────────────────────────────────────
        FeePayment.objects.get_or_create(
            invoice_number='INV-2026-1049',
            defaults={
                'student': sp1, 'title': 'Academic Fee - Term 1 (2025-2026)',
                'total_amount': 22500.00, 'paid_amount': 22500.00,
                'due_date': date(2025, 7, 31), 'payment_status': 'Paid',
                'payment_mode': 'Online NEFT', 'transaction_id': 'NEFT20250731998821',
            }
        )
        FeePayment.objects.get_or_create(
            invoice_number='INV-2026-1050',
            defaults={
                'student': sp1, 'title': 'Academic Fee - Term 2 (2025-2026)',
                'total_amount': 22500.00, 'paid_amount': 0.00,
                'due_date': date(2026, 1, 31), 'payment_status': 'Pending',
            }
        )
        self.stdout.write('  ✅ Fee Payment records created')

        # ── 16. Document Requests ────────────────────────────────────────────
        DocumentRequest.objects.get_or_create(
            request_number='REQ-1001',
            defaults={
                'student': sp1, 'document_type': 'Bonafide',
                'purpose': 'Passport Application & Age Proof Requirement',
                'status': 'Approved', 'admin_remarks': 'Verified and approved by Principal',
                'approved_by': u_principal,
            }
        )
        DocumentRequest.objects.get_or_create(
            request_number='REQ-1002',
            defaults={
                'student': sp1, 'document_type': 'Hall_Ticket',
                'purpose': 'Annual Board Examination Hall Ticket',
                'status': 'Issued', 'admin_remarks': 'Hall Ticket issued for Term 2 Exams',
            }
        )
        self.stdout.write('  ✅ Document Requests created')

        # ── 17. Admission Applications ───────────────────────────────────────
        AdmissionApplication.objects.get_or_create(
            application_number='ADM-2026-001',
            defaults={
                'applicant_name': 'Rohan Sanjay Mehta', 'date_of_birth': date(2018, 5, 12),
                'gender': 'Male', 'applying_for_class': c_minikg,
                'parent_name': 'Sanjay Mehta', 'parent_phone': '+91 98220 11223',
                'parent_email': 'sanjay.m@gmail.com', 'address': 'Flat 4B, Kothrud, Pune 411038',
                'status': 'Submitted',
            }
        )
        AdmissionApplication.objects.get_or_create(
            application_number='ADM-2026-002',
            defaults={
                'applicant_name': 'Sneha Rajesh Kulkarni', 'date_of_birth': date(2015, 8, 20),
                'gender': 'Female', 'applying_for_class': c_g1,
                'parent_name': 'Rajesh Kulkarni', 'parent_phone': '+91 97655 88901',
                'parent_email': 'rajesh.k@gmail.com', 'address': 'Baner Road, Pune 411045',
                'status': 'Under_Review',
            }
        )
        self.stdout.write('  ✅ Admission Applications created')

        # ── 18. Achievements ─────────────────────────────────────────────────
        Achievement.objects.get_or_create(
            title='State Level Science Olympiad — 1st Place',
            defaults={
                'description': 'SPM student won 1st place at Maharashtra State Science Olympiad 2026.',
                'achievement_type': 'Student', 'achieved_by': 'Alex Sharma, Grade 5-A',
                'competition_name': 'Maharashtra State Science Olympiad 2026',
                'position': '1st Place', 'date_achieved': date(2026, 1, 15),
            }
        )
        self.stdout.write('  ✅ Achievements created')

        # ── 19. Contact Messages ─────────────────────────────────────────────
        ContactMessage.objects.get_or_create(
            email='parent.query@gmail.com',
            defaults={
                'name': 'Vijay Nair', 'phone': '+91 88001 23456',
                'subject': 'Admission Query for Grade 3',
                'message': 'I would like information about Grade 3 admissions for my son for the academic year 2026-27.',
            }
        )
        self.stdout.write('  ✅ Contact Messages created')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully! Ready for testing.'))
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('🔐 Demo Login Credentials:'))
        self.stdout.write('  Trustee:   trustee_admin  / SchoolPass123!')
        self.stdout.write('  Principal: principal_user  / SchoolPass123!')
        self.stdout.write('  Teacher:   teacher_anjali  / SchoolPass123!')
        self.stdout.write('  Clerk:     clerk_mahesh    / SchoolPass123!')
        self.stdout.write('  Student:   student_alex    / SchoolPass123!')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🌐 API Docs:  http://localhost:8000/api/docs/'))
        self.stdout.write(self.style.SUCCESS('🔧 Django Admin: http://localhost:8000/admin/'))
