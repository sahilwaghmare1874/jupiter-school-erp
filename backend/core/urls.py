from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AuthMeView, DashboardAnalyticsView,
    SchoolInfoViewSet, HeroSlideViewSet, AnnouncementViewSet, EventViewSet,
    GalleryItemViewSet, AchievementViewSet,
    TeacherProfileViewSet, AcademicClassViewSet, SectionViewSet, SubjectViewSet,
    TimetableViewSet, StudentProfileViewSet, AdmissionApplicationViewSet,
    AttendanceViewSet, GradeResultViewSet, HomeworkViewSet,
    FeePaymentViewSet, DocumentRequestViewSet,
    LeaveApplicationViewSet, ContactMessageViewSet,
    SiteVisitorLogViewSet,
)
from .ai_views import AIChatView

router = DefaultRouter()

# CMS Endpoints
router.register(r'school-info', SchoolInfoViewSet, basename='school-info')
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slides')
router.register(r'announcements', AnnouncementViewSet, basename='announcements')
router.register(r'events', EventViewSet, basename='events')
router.register(r'gallery', GalleryItemViewSet, basename='gallery')
router.register(r'achievements', AchievementViewSet, basename='achievements')

# Academic Endpoints
router.register(r'teachers', TeacherProfileViewSet, basename='teachers')
router.register(r'academic-classes', AcademicClassViewSet, basename='academic-classes')
router.register(r'sections', SectionViewSet, basename='sections')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'timetable', TimetableViewSet, basename='timetable')

# Student & ERP Endpoints
router.register(r'students', StudentProfileViewSet, basename='students')
router.register(r'admissions', AdmissionApplicationViewSet, basename='admissions')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'grades', GradeResultViewSet, basename='grades')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'fee-payments', FeePaymentViewSet, basename='fee-payments')
router.register(r'document-requests', DocumentRequestViewSet, basename='document-requests')
router.register(r'leave-applications', LeaveApplicationViewSet, basename='leave-applications')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-messages')
router.register(r'visitor-logs', SiteVisitorLogViewSet, basename='visitor-logs')

urlpatterns = [
    # JWT Auth
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', AuthMeView.as_view(), name='auth_me'),

    # Dashboard Analytics
    path('analytics/dashboard/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),

    # AI Chat Endpoint (role-aware Gemini assistant)
    path('ai/chat/', AIChatView.as_view(), name='ai_chat'),

    # All router-registered endpoints
    path('', include(router.urls)),
]
