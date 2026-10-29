"""
core/serializers.py
────────────────────
DRF Serializers with full sanitization and normalization pipeline.

SDLC Phase 3 — Implementation:
  Layer 2: Serializer-level validation, normalization, and HTML stripping
"""
from rest_framework import serializers
from .models import (
    CustomUser, SchoolInfo, HeroSlide, Announcement, Event, GalleryItem,
    TeacherProfile, AcademicClass, Section, Subject, StudentProfile,
    AdmissionApplication, Attendance, GradeResult, Homework, FeePayment,
    DocumentRequest, LeaveApplication, ContactMessage, Timetable, Achievement,
    SiteVisitorLog
)
from .validators import (
    normalize_phone, normalize_email, normalize_name,
    normalize_text, validate_date_range, validate_marks_range, sanitize_url
)


class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        # Exclude password hash from API output
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'phone', 'address', 'date_of_birth', 'gender']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def validate_phone(self, value):
        if value:
            return normalize_phone(value)
        return value

    def validate_email(self, value):
        return normalize_email(value) if value else value

    def validate_first_name(self, value):
        return normalize_name(value) if value else value

    def validate_last_name(self, value):
        return normalize_name(value) if value else value


class SchoolInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolInfo
        fields = '__all__'

    def validate_facebook_url(self, value):
        return sanitize_url(value) if value else value

    def validate_instagram_url(self, value):
        return sanitize_url(value) if value else value

    def validate_youtube_url(self, value):
        return sanitize_url(value) if value else value

    def validate_twitter_url(self, value):
        return sanitize_url(value) if value else value


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = '__all__'

    def validate_title(self, value):
        return normalize_text(value, max_length=200)

    def validate_subtitle(self, value):
        return normalize_text(value, max_length=500)

    def validate_image_url(self, value):
        return sanitize_url(value) if value else value


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

    def validate_title(self, value):
        return normalize_text(value, max_length=200)

    def validate_content(self, value):
        return normalize_text(value, max_length=2000)


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    def validate_title(self, value):
        return normalize_text(value, max_length=200)

    def validate_description(self, value):
        return normalize_text(value, max_length=2000) if value else value


class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'

    def validate_url(self, value):
        return sanitize_url(value) if value else value


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

    def validate_title(self, value):
        return normalize_text(value, max_length=200)

    def validate_description(self, value):
        return normalize_text(value, max_length=2000)


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = '__all__'

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def validate_bio(self, value):
        return normalize_text(value, max_length=1000) if value else value


class AcademicClassSerializer(serializers.ModelSerializer):
    level_type_display = serializers.CharField(source='get_level_type_display', read_only=True)

    class Meta:
        model = AcademicClass
        fields = '__all__'


class SectionSerializer(serializers.ModelSerializer):
    academic_class_name = serializers.CharField(source='academic_class.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = '__all__'

    def get_teacher_name(self, obj):
        if obj.class_teacher and obj.class_teacher.user:
            return obj.class_teacher.user.get_full_name()
        return 'Unassigned'


class SubjectSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='academic_class.name', read_only=True)

    class Meta:
        model = Subject
        fields = '__all__'


class TimetableSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = '__all__'

    def get_teacher_name(self, obj):
        if obj.teacher and obj.teacher.user:
            return obj.teacher.user.get_full_name()
        return 'Unassigned'

    def validate(self, data):
        """Cross-field: start_time must be before end_time."""
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and end <= start:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class_name = serializers.SerializerMethodField()
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'

    def get_class_name(self, obj):
        if obj.section and obj.section.academic_class:
            return obj.section.academic_class.name
        return 'N/A'


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='applying_for_class.name', read_only=True)

    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = ['application_number', 'status']

    def validate_applicant_name(self, value):
        value = normalize_name(value)
        if len(value) < 2:
            raise serializers.ValidationError('Applicant name must be at least 2 characters.')
        return value

    def validate_parent_name(self, value):
        return normalize_name(value)

    def validate_parent_phone(self, value):
        return normalize_phone(value)

    def validate_parent_email(self, value):
        return normalize_email(value)

    def validate_address(self, value):
        return normalize_text(value, max_length=500)

    def validate_previous_marks_percentage(self, value):
        if value is not None and (float(value) < 0 or float(value) > 100):
            raise serializers.ValidationError('Marks percentage must be between 0 and 100.')
        return value

    def validate(self, data):
        """Cross-field: DOB must be in the past; marks in valid range."""
        from datetime import date
        dob = data.get('date_of_birth')
        if dob and dob >= date.today():
            raise serializers.ValidationError({'date_of_birth': 'Date of birth must be in the past.'})
        return data


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    gr_number = serializers.CharField(source='student.gr_number', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def validate_remarks(self, value):
        return normalize_text(value, max_length=200) if value else value


class GradeResultSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    student_name = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = GradeResult
        fields = '__all__'

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_percentage(self, obj):
        if obj.total_marks > 0:
            return round(float(obj.marks_obtained) / float(obj.total_marks) * 100, 2)
        return 0.0

    def validate(self, data):
        """Cross-field: marks_obtained must not exceed total_marks."""
        marks = data.get('marks_obtained')
        total = data.get('total_marks', 100)
        try:
            validate_marks_range(marks, total)
        except Exception as e:
            raise serializers.ValidationError({'marks_obtained': str(e)})
        return data


class HomeworkSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_display = serializers.CharField(source='section.__str__', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = '__all__'
        read_only_fields = ['created_by']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else 'Unknown'

    def validate_title(self, value):
        return normalize_text(value, max_length=255)

    def validate_description(self, value):
        return normalize_text(value, max_length=2000)


class FeePaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(read_only=True, required=False)
    student_name = serializers.SerializerMethodField()
    gr_number = serializers.CharField(source='student.gr_number', read_only=True)
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = FeePayment
        fields = '__all__'
        read_only_fields = ['invoice_number']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_balance_due(self, obj):
        return float(obj.total_amount) - float(obj.paid_amount)

    def validate(self, data):
        """Cross-field: paid_amount must not exceed total_amount."""
        paid = data.get('paid_amount', 0)
        total = data.get('total_amount', 0)
        if paid is not None and total is not None and float(paid) > float(total):
            raise serializers.ValidationError(
                {'paid_amount': 'Paid amount cannot exceed total amount.'}
            )
        return data


class DocumentRequestSerializer(serializers.ModelSerializer):
    request_number = serializers.CharField(read_only=True, required=False)
    student_name = serializers.SerializerMethodField()
    gr_number = serializers.CharField(source='student.gr_number', read_only=True)
    doc_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DocumentRequest
        fields = '__all__'
        read_only_fields = ['request_number', 'status', 'approved_by', 'approved_at', 'certificate_file']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def validate_purpose(self, value):
        value = normalize_text(value, max_length=500)
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Purpose must be at least 10 characters.')
        return value

    def validate_admin_remarks(self, value):
        return normalize_text(value, max_length=500) if value else value


class LeaveApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_role = serializers.CharField(source='applicant.role', read_only=True)
    days_count = serializers.SerializerMethodField()

    class Meta:
        model = LeaveApplication
        fields = '__all__'

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name()

    def get_days_count(self, obj):
        from datetime import timedelta
        delta = obj.end_date - obj.start_date
        return delta.days + 1

    def validate_reason(self, value):
        value = normalize_text(value, max_length=1000)
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Reason must be at least 10 characters long.')
        return value

    def validate(self, data):
        """Cross-field: end_date must be >= start_date."""
        start = data.get('start_date')
        end = data.get('end_date')
        try:
            validate_date_range(start, end)
        except Exception as e:
            raise serializers.ValidationError({'end_date': str(e)})
        return data


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

    def validate_name(self, value):
        return normalize_name(value)

    def validate_email(self, value):
        return normalize_email(value)

    def validate_phone(self, value):
        return normalize_phone(value) if value else value

    def validate_subject(self, value):
        return normalize_text(value, max_length=200)

    def validate_message(self, value):
        """Strip HTML tags to prevent stored XSS and enforce length."""
        value = normalize_text(value, max_length=2000)
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Message must be at least 10 characters long.')
        return value


class SiteVisitorLogSerializer(serializers.ModelSerializer):
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)
    visited_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = SiteVisitorLog
        fields = '__all__'
        read_only_fields = ['ip_address', 'visited_at']

    def get_visited_at_formatted(self, obj):
        return obj.visited_at.strftime('%d-%b-%Y %I:%M %p')

    def validate_phone(self, value):
        return normalize_phone(value)

    def validate_name(self, value):
        return normalize_name(value)

    def validate_email(self, value):
        return normalize_email(value) if value else value

    def validate_message(self, value):
        return normalize_text(value, max_length=1000) if value else value
