from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from .validators import phone_validator, validate_not_future_date, validate_date_range, validate_marks_range


class RoleChoices(models.TextChoices):
    TRUSTEE = 'TRUSTEE', 'Trustee'
    PRINCIPAL = 'PRINCIPAL', 'Principal'
    TEACHER = 'TEACHER', 'Teacher'
    CLERK = 'CLERK', 'Clerk'
    STUDENT = 'STUDENT', 'Student'


class CustomUser(AbstractUser):
    """Extended User model with school-specific role and profile data."""
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.STUDENT)
    phone = models.CharField(max_length=20, blank=True, null=True, validators=[phone_validator])
    address = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True, validators=[validate_not_future_date])
    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')],
        default='Male'
    )

    class Meta:
        verbose_name = 'School User'
        verbose_name_plural = 'School Users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username


class SchoolInfo(models.Model):
    """Singleton model storing school identity & contact details for CMS."""
    name = models.CharField(max_length=200, default='Jupiter English Medium School')
    tagline = models.CharField(max_length=300, default='Empowering Minds, Shaping Futures in Satara')
    establishment_year = models.IntegerField(default=1998)
    address = models.TextField(default='NH-4 Highway, Shendre, Satara, Maharashtra 415001')
    email = models.EmailField(default='info@jupiterschoolsatara.org')
    phone = models.CharField(max_length=20, default='+91 2162 270123')
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    principal_message = models.TextField(
        default='Welcome to Jupiter English Medium School, Shendre Satara. We provide an environment that fosters curiosity, discipline, and modern scientific knowledge for students of Satara district.'
    )
    trustee_message = models.TextField(
        default='Jupiter Education Trust is committed to delivering affordable world-class English medium education rooted in rich cultural values for students along the NH-4 highway belt in Satara.'
    )
    logo_url = models.CharField(max_length=500, blank=True, null=True)
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'School Info'

    def __str__(self):
        return self.name


class HeroSlide(models.Model):
    """Homepage carousel slides managed via CMS."""
    title = models.CharField(max_length=200)
    subtitle = models.TextField()
    image_url = models.CharField(max_length=500)
    order = models.IntegerField(default=0)
    cta_text = models.CharField(max_length=50, default='Apply Now')
    cta_link = models.CharField(max_length=200, default='/admissions')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Hero Slide'

    def __str__(self):
        return self.title


class Announcement(models.Model):
    """School notices, circulars, and news items."""
    CATEGORY_CHOICES = [
        ('General', 'General Notice'),
        ('Admission', 'Admission Notice'),
        ('Exam', 'Exam Announcement'),
        ('Circular', 'Official Circular'),
        ('Holiday', 'Holiday / Vacation'),
        ('Event', 'Event Announcement'),
    ]
    TARGET_CHOICES = [
        ('ALL', 'All Users'),
        ('STUDENT', 'Students Only'),
        ('TEACHER', 'Teachers Only'),
        ('PARENT', 'Parents Only'),
    ]
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    target_role = models.CharField(max_length=20, choices=TARGET_CHOICES, default='ALL')
    posted_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    attachment = models.FileField(upload_to='announcements/', blank=True, null=True)

    class Meta:
        ordering = ['-posted_at']
        verbose_name = 'Announcement / Circular'

    def __str__(self):
        return f"{self.category}: {self.title}"


class Event(models.Model):
    """School events - upcoming and past."""
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=200, default='School Auditorium')
    category = models.CharField(max_length=50, default='Academic', choices=[
        ('Academic', 'Academic'), ('Sports', 'Sports'), ('Cultural', 'Cultural'),
        ('Science', 'Science Fair'), ('Holiday', 'Holiday'), ('Exam', 'Examination'),
    ])
    image_url = models.CharField(max_length=500, blank=True, null=True)
    is_upcoming = models.BooleanField(default=True)
    registration_link = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['-event_date']

    def __str__(self):
        return self.title


class GalleryItem(models.Model):
    """Photo and video gallery items filterable by category."""
    CATEGORY_CHOICES = [
        ('Sports', 'Sports Day'),
        ('Annual Day', 'Annual Cultural Fest'),
        ('Science', 'Science Fair'),
        ('Classroom', 'Digital Classrooms'),
        ('Celebration', 'Festivals & Events'),
        ('Achievement', 'Achievements'),
        ('Trip', 'Educational Trips'),
    ]
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='Sports')
    media_type = models.CharField(max_length=10, choices=[('Image', 'Image'), ('Video', 'Video')], default='Image')
    url = models.CharField(max_length=500)
    thumbnail = models.CharField(max_length=500, blank=True, null=True)
    album_name = models.CharField(max_length=100, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.category})"


class TeacherProfile(models.Model):
    """Extended teacher-specific profile data."""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    qualification = models.CharField(max_length=200)
    experience_years = models.IntegerField(default=5, validators=[MinValueValidator(0), MaxValueValidator(50)])
    subject_specialization = models.CharField(max_length=200)
    designation = models.CharField(max_length=100, default='Senior Secondary Teacher')
    awards = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    demo_video_url = models.CharField(max_length=500, blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.subject_specialization}"


class LevelTypeChoices(models.TextChoices):
    PRE_PRIMARY = 'PRE_PRIMARY', 'Pre Primary'
    PRIMARY = 'PRIMARY', 'Primary'
    SECONDARY = 'SECONDARY', 'Secondary'
    HIGHER_SECONDARY = 'HIGHER_SECONDARY', 'Higher Secondary'


class AcademicClass(models.Model):
    """School class levels (Mini KG, Grade 1..10, etc.)."""
    name = models.CharField(max_length=50)
    level_type = models.CharField(max_length=20, choices=LevelTypeChoices.choices, default=LevelTypeChoices.PRIMARY)
    stream = models.CharField(max_length=50, default='General')
    annual_fee = models.DecimalField(max_digits=10, decimal_places=2, default=45000.00)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.get_level_type_display()})"


class Section(models.Model):
    """Class section (e.g., Grade 5 - Section A)."""
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=10)
    room_number = models.CharField(max_length=20, default='Room 101')
    class_teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, blank=True)
    max_students = models.IntegerField(default=40)

    def __str__(self):
        return f"{self.academic_class.name} - Section {self.name}"


class Subject(models.Model):
    """Academic subject belonging to a class."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    academic_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE, related_name='subjects')
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='subjects_taught')
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2, default=35.00)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)

    def __str__(self):
        return f"{self.name} ({self.code})"


class StudentProfile(models.Model):
    """Student-specific profile linked to the CustomUser."""
    BLOOD_GROUPS = [('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),
                    ('AB+','AB+'),('AB-','AB-'),('O+','O+'),('O-','O-')]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    gr_number = models.CharField(max_length=50, unique=True)
    roll_number = models.CharField(max_length=20)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, related_name='students')
    father_name = models.CharField(max_length=150)
    mother_name = models.CharField(max_length=150)
    guardian_contact = models.CharField(max_length=20)
    guardian_email = models.EmailField(blank=True, null=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, default='O+')
    admission_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    religion = models.CharField(max_length=50, default='Hindu')
    nationality = models.CharField(max_length=50, default='Indian')
    aadhar_number = models.CharField(max_length=20, blank=True, null=True)
    house = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('Red', 'Red House'), ('Blue', 'Blue House'), ('Green', 'Green House'), ('Yellow', 'Yellow House')
    ])

    def __str__(self):
        return f"{self.user.get_full_name()} (GR: {self.gr_number})"


class AdmissionApplication(models.Model):
    """Multi-step online admission application form data."""
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
        ('Under_Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Waitlisted', 'Waitlisted'),
    ]
    application_number = models.CharField(max_length=50, unique=True)
    applicant_name = models.CharField(max_length=200)
    date_of_birth = models.DateField(validators=[validate_not_future_date])
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    applying_for_class = models.ForeignKey(AcademicClass, on_delete=models.CASCADE)
    parent_name = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=20, validators=[phone_validator])
    parent_email = models.EmailField()
    address = models.TextField()
    previous_school = models.CharField(max_length=200, blank=True, null=True)
    previous_marks_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=85.00, blank=True, null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    remarks = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='admissions/photos/', blank=True, null=True)
    birth_certificate = models.FileField(upload_to='admissions/docs/', blank=True, null=True)
    aadhar_copy = models.FileField(upload_to='admissions/docs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.application_number} - {self.applicant_name} ({self.status})"


class Attendance(models.Model):
    """Daily student attendance records."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[
        ('Present', 'Present'), ('Absent', 'Absent'), ('Late', 'Late'), ('Holiday', 'Holiday')
    ], default='Present')
    remarks = models.CharField(max_length=200, blank=True, null=True)
    marked_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.user.username} - {self.date}: {self.status}"


class GradeResult(models.Model):
    """Subject-wise exam result for a student."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_name = models.CharField(max_length=100, default='Term 1 Exam 2026')
    marks_obtained = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    total_marks = models.DecimalField(
        max_digits=5, decimal_places=2, default=100.00,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    grade = models.CharField(max_length=5, default='A')
    remarks = models.CharField(max_length=200, default='Good')
    academic_year = models.CharField(max_length=20, default='2025-2026')
    published = models.BooleanField(default=True)

    def clean(self):
        """Cross-field validation: marks_obtained must not exceed total_marks."""
        validate_marks_range(self.marks_obtained, self.total_marks)

    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name}: {self.marks_obtained}/{self.total_marks}"


class Homework(models.Model):
    """Homework assignment issued by teacher to a class section."""
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='homeworks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    attachment = models.FileField(upload_to='homework/', blank=True, null=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.subject.name} HW for {self.section} due {self.due_date}"


class FeePayment(models.Model):
    """Fee invoice and payment tracking per student."""
    STATUS_CHOICES = [('Paid', 'Paid'), ('Partial', 'Partial'), ('Pending', 'Pending'), ('Overdue', 'Overdue')]
    invoice_number = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='fee_payments')
    title = models.CharField(max_length=200, default='Academic Fee')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    due_date = models.DateField()
    payment_status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    payment_mode = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    receipt_path = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.student.user.username} ({self.payment_status})"


class DocumentRequest(models.Model):
    """Student requests for official school certificates and documents."""
    DOC_TYPES = [
        ('Bonafide', 'Bonafide Certificate'),
        ('Leaving', 'School Leaving Certificate'),
        ('Transfer', 'Transfer Certificate'),
        ('ID_Card', 'Duplicate ID Card'),
        ('Hall_Ticket', 'Exam Hall Ticket'),
        ('Marksheet', 'Certified Marksheet Copy'),
    ]
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Under_Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Issued', 'Issued & Ready'),
    ]
    request_number = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='document_requests')
    document_type = models.CharField(max_length=30, choices=DOC_TYPES)
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    admin_remarks = models.TextField(blank=True, null=True)
    approved_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_docs'
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.request_number} - {self.get_document_type_display()} ({self.status})"


class LeaveApplication(models.Model):
    """Leave applications filed by students and teachers."""
    applicant = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='leave_applications')
    leave_type = models.CharField(max_length=30, choices=[
        ('Sick', 'Sick Leave'), ('Personal', 'Personal Leave'),
        ('Family', 'Family Emergency'), ('Other', 'Other Reason')
    ], default='Sick')
    reason = models.TextField(max_length=1000)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')
    ], default='Pending')
    reviewed_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves'
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        """Cross-field: end_date must not be before start_date."""
        validate_date_range(self.start_date, self.end_date)
        if self.start_date and self.start_date < __import__('datetime').date.today():
            pass  # Historical leaves allowed; only future consistency checked

    def __str__(self):
        return f"Leave: {self.applicant.username} ({self.start_date} to {self.end_date}) - {self.status}"


class ContactMessage(models.Model):
    """Public contact form submissions."""
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, validators=[phone_validator])
    subject = models.CharField(max_length=200)
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True, null=True, max_length=1000)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"


class Timetable(models.Model):
    """Weekly class timetable per section."""
    DAYS = [
        ('Monday','Monday'), ('Tuesday','Tuesday'), ('Wednesday','Wednesday'),
        ('Thursday','Thursday'), ('Friday','Friday'), ('Saturday','Saturday'),
    ]
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='timetable')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    period_number = models.IntegerField(default=1)

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"{self.section} | {self.day} | {self.subject.name} | {self.start_time}"


class Achievement(models.Model):
    """Student, teacher, and school achievements."""
    ACHIEVEMENT_TYPE = [
        ('Student', 'Student Achievement'),
        ('Teacher', 'Teacher Recognition'),
        ('School', 'School Award'),
        ('Sports', 'Sports Championship'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPE, default='Student')
    achieved_by = models.CharField(max_length=200)
    competition_name = models.CharField(max_length=200, blank=True, null=True)
    position = models.CharField(max_length=50, blank=True, null=True, default='1st Place')
    date_achieved = models.DateField()
    image_url = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.achieved_by}"


class SiteVisitorLog(models.Model):
    """Captures every website visitor who submits an enquiry via the public widget.
    The phone field is the primary contact detail shown prominently on the Clerk's dashboard."""
    PURPOSE_CHOICES = [
        ('Admission', 'Admission Enquiry'),
        ('General', 'General Information'),
        ('Visit', 'Schedule School Visit'),
        ('Fee', 'Fee / Scholarship Info'),
        ('Other', 'Other'),
    ]
    # Primary contact — shown first and prominently in Clerk dashboard
    phone = models.CharField(max_length=20, validators=[phone_validator])
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='General')
    message = models.TextField(blank=True, null=True)
    page_visited = models.CharField(max_length=200, default='Home Page')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    visited_at = models.DateTimeField(auto_now_add=True)
    is_contacted = models.BooleanField(
        default=False,
        help_text='Clerk marks this True after following up with the visitor.'
    )
    contacted_notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-visited_at']
        verbose_name = 'Site Visitor Lead'
        verbose_name_plural = 'Site Visitor Leads'

    def __str__(self):
        return f"{self.name} | 📱 {self.phone} | {self.purpose} | {self.visited_at.strftime('%d-%b-%Y %H:%M')}"
