from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, SchoolInfo, HeroSlide, Announcement, Event, GalleryItem,
    TeacherProfile, AcademicClass, Section, Subject, StudentProfile,
    AdmissionApplication, Attendance, GradeResult, Homework, FeePayment,
    DocumentRequest, LeaveApplication, ContactMessage, SiteVisitorLog
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('School Role', {'fields': ('role', 'phone', 'address', 'profile_photo', 'date_of_birth', 'gender')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('School Role', {'fields': ('role', 'phone')}),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(SchoolInfo)
class SchoolInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone')


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_editable = ('order', 'is_active')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'target_role', 'posted_at', 'is_active')
    list_filter = ('category', 'target_role', 'is_active')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_date', 'location', 'is_upcoming')
    list_filter = ('is_upcoming', 'category')


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'media_type')
    list_filter = ('category', 'media_type')


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'subject_specialization', 'experience_years', 'designation')
    search_fields = ('user__username', 'employee_id', 'subject_specialization')


@admin.register(AcademicClass)
class AcademicClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'level_type', 'stream', 'annual_fee')
    list_filter = ('level_type',)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('academic_class', 'name', 'room_number', 'class_teacher')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'academic_class')
    list_filter = ('academic_class',)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gr_number', 'roll_number', 'section', 'admission_date')
    search_fields = ('user__username', 'gr_number', 'father_name')


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_number', 'applicant_name', 'applying_for_class', 'status', 'created_at')
    list_filter = ('status', 'gender')
    search_fields = ('application_number', 'applicant_name', 'parent_email')
    list_editable = ('status',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'status', 'marked_by')
    list_filter = ('status', 'date')
    date_hierarchy = 'date'


@admin.register(GradeResult)
class GradeResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'exam_name', 'marks_obtained', 'total_marks', 'grade')
    list_filter = ('exam_name', 'academic_year', 'grade')


@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'section', 'due_date', 'created_by')
    list_filter = ('due_date', 'subject')


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'student', 'title', 'total_amount', 'paid_amount', 'payment_status', 'due_date')
    list_filter = ('payment_status',)
    search_fields = ('invoice_number', 'student__gr_number')


@admin.register(DocumentRequest)
class DocumentRequestAdmin(admin.ModelAdmin):
    list_display = ('request_number', 'student', 'document_type', 'status', 'applied_at')
    list_filter = ('status', 'document_type')
    list_editable = ('status',)


@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'start_date', 'end_date', 'status', 'applied_at')
    list_filter = ('status',)
    list_editable = ('status',)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_resolved')
    list_filter = ('is_resolved',)
    list_editable = ('is_resolved',)


@admin.register(SiteVisitorLog)
class SiteVisitorLogAdmin(admin.ModelAdmin):
    """Clerk-facing admin view — phone is the first and most prominent column."""
    list_display = ('phone', 'name', 'email', 'purpose', 'page_visited', 'visited_at', 'is_contacted')
    list_filter = ('purpose', 'is_contacted', 'visited_at')
    list_editable = ('is_contacted',)
    search_fields = ('phone', 'name', 'email')
    date_hierarchy = 'visited_at'
    readonly_fields = ('visited_at', 'ip_address', 'page_visited')
    fieldsets = (
        ('📱 Primary Contact (Phone First)', {
            'fields': ('phone', 'name', 'email')
        }),
        ('Enquiry Details', {
            'fields': ('purpose', 'message')
        }),
        ('Tracking Info', {
            'fields': ('page_visited', 'ip_address', 'visited_at'),
            'classes': ('collapse',)
        }),
        ('Clerk Follow-up', {
            'fields': ('is_contacted', 'contacted_notes')
        }),
    )
