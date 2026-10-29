from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from django.db.models import Count, Sum, Q
from django.utils import timezone
import uuid

from .models import (
    CustomUser, SchoolInfo, HeroSlide, Announcement, Event, GalleryItem,
    TeacherProfile, AcademicClass, Section, Subject, StudentProfile,
    AdmissionApplication, Attendance, GradeResult, Homework, FeePayment,
    DocumentRequest, LeaveApplication, ContactMessage, Timetable, Achievement,
    RoleChoices, SiteVisitorLog
)
from .serializers import (
    CustomUserSerializer, SchoolInfoSerializer, HeroSlideSerializer,
    AnnouncementSerializer, EventSerializer, GalleryItemSerializer,
    TeacherProfileSerializer, AcademicClassSerializer, SectionSerializer,
    SubjectSerializer, StudentProfileSerializer, AdmissionApplicationSerializer,
    AttendanceSerializer, GradeResultSerializer, HomeworkSerializer,
    FeePaymentSerializer, DocumentRequestSerializer, LeaveApplicationSerializer,
    ContactMessageSerializer, TimetableSerializer, AchievementSerializer,
    SiteVisitorLogSerializer,
)
from .permissions import (
    IsTrustee, IsPrincipal, IsTeacher, IsClerk, IsStudent,
    IsStaffOrReadOnly, IsTeacherOrStaff, IsClerkOrStaff
)
from .utils import generate_certificate_pdf, generate_fee_receipt_pdf



# ────────────────────────────────────────────────────────────────────────────
# Auth & Profile Views
# ────────────────────────────────────────────────────────────────────────────
class AuthMeView(APIView):
    """Returns full profile of authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = CustomUserSerializer(user).data
        if user.role == RoleChoices.STUDENT and hasattr(user, 'student_profile'):
            data['student_profile'] = StudentProfileSerializer(user.student_profile).data
        elif user.role == RoleChoices.TEACHER and hasattr(user, 'teacher_profile'):
            data['teacher_profile'] = TeacherProfileSerializer(user.teacher_profile).data
        return Response(data)


# ────────────────────────────────────────────────────────────────────────────
# Dashboard Analytics View
# ────────────────────────────────────────────────────────────────────────────
class DashboardAnalyticsView(APIView):
    """Role-aware analytics endpoint for all portal dashboards."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        today = timezone.now().date()

        # Bug Fix #6: Base analytics is now role-aware — students don't get school-wide stats
        if role in [RoleChoices.TRUSTEE, RoleChoices.PRINCIPAL, RoleChoices.TEACHER, RoleChoices.CLERK]:
            base_analytics = {
                'role': role,
                'total_students': StudentProfile.objects.filter(is_active=True).count(),
                'total_teachers': TeacherProfile.objects.count(),
                'pending_admissions': AdmissionApplication.objects.filter(status='Submitted').count(),
                'pending_doc_requests': DocumentRequest.objects.filter(status='Applied').count(),
                'total_collected_fees': float(
                    FeePayment.objects.filter(payment_status='Paid').aggregate(
                        total=Sum('paid_amount')
                    )['total'] or 0
                ),
                'total_events': Event.objects.count(),
                'upcoming_events': Event.objects.filter(is_upcoming=True).count(),
            }
        else:
            # Students only get minimal base info
            base_analytics = {
                'role': role,
                'total_events': Event.objects.count(),
                'upcoming_events': Event.objects.filter(is_upcoming=True).count(),
            }

        # ── STUDENT ──────────────────────────────────────────────────────────
        if role == RoleChoices.STUDENT and hasattr(user, 'student_profile'):
            sp = user.student_profile
            attendances = Attendance.objects.filter(student=sp)
            total_days = attendances.count()
            present_days = attendances.filter(status='Present').count()
            att_pct = round(present_days / total_days * 100, 1) if total_days > 0 else 0.0

            pending_fees = FeePayment.objects.filter(
                student=sp, payment_status__in=['Pending', 'Overdue']
            ).aggregate(total=Sum('total_amount'))['total'] or 0

            latest_grade = GradeResult.objects.filter(
                student=sp, published=True
            ).order_by('-id').first()

            base_analytics['student_specific'] = {
                'gr_number': sp.gr_number,
                'class_name': sp.section.academic_class.name if sp.section else 'N/A',
                'section': sp.section.name if sp.section else 'N/A',
                'attendance_percentage': att_pct,
                'present_days': present_days,
                'total_days': total_days,
                'pending_fees': float(pending_fees),
                'active_requests': DocumentRequest.objects.filter(student=sp).count(),
                'total_homeworks': Homework.objects.filter(
                    section=sp.section, is_active=True
                ).count() if sp.section else 0,
                'latest_grade': latest_grade.grade if latest_grade else 'N/A',
                'latest_exam': latest_grade.exam_name if latest_grade else 'N/A',
            }

        # ── TEACHER ──────────────────────────────────────────────────────────
        elif role == RoleChoices.TEACHER and hasattr(user, 'teacher_profile'):
            tp = user.teacher_profile
            my_sections = Section.objects.filter(class_teacher=tp)
            base_analytics['teacher_specific'] = {
                'my_sections': my_sections.count(),
                'total_students_in_class': StudentProfile.objects.filter(
                    section__in=my_sections
                ).count(),
                'pending_leaves': LeaveApplication.objects.filter(
                    applicant__role=RoleChoices.STUDENT, status='Pending'
                ).count(),
            }

        # ── CLERK ─────────────────────────────────────────────────────────────
        elif role == RoleChoices.CLERK:
            new_visitors_today = SiteVisitorLog.objects.filter(
                visited_at__date=today
            ).count()
            uncontacted_leads = SiteVisitorLog.objects.filter(is_contacted=False).count()
            new_messages_today = ContactMessage.objects.filter(
                created_at__date=today
            ).count()
            base_analytics['clerk_specific'] = {
                'new_visitors_today': new_visitors_today,
                'uncontacted_leads': uncontacted_leads,
                'new_messages_today': new_messages_today,
                'total_visitor_leads': SiteVisitorLog.objects.count(),
                'doc_requests_applied': DocumentRequest.objects.filter(status='Applied').count(),
                'doc_requests_approved_today': DocumentRequest.objects.filter(
                    status='Approved', approved_at__date=today
                ).count(),
                'total_contact_messages': ContactMessage.objects.count(),
                'unresolved_messages': ContactMessage.objects.filter(is_resolved=False).count(),
            }

        # ── TRUSTEE ───────────────────────────────────────────────────────────
        elif role == RoleChoices.TRUSTEE:
            total_fee_target = float(
                FeePayment.objects.aggregate(total=Sum('total_amount'))['total'] or 0
            )
            pending_fees = float(
                FeePayment.objects.filter(
                    payment_status__in=['Pending', 'Overdue']
                ).aggregate(total=Sum('total_amount'))['total'] or 0
            )
            base_analytics['trustee_specific'] = {
                'total_fee_target': total_fee_target,
                'total_fee_pending': pending_fees,
                'approved_admissions': AdmissionApplication.objects.filter(status='Approved').count(),
                'total_admissions': AdmissionApplication.objects.count(),
                'total_visitor_leads': SiteVisitorLog.objects.count(),
                'overdue_fee_students': FeePayment.objects.filter(payment_status='Overdue').values('student').distinct().count(),
            }

        # ── PRINCIPAL ─────────────────────────────────────────────────────────
        elif role == RoleChoices.PRINCIPAL:
            base_analytics['principal_specific'] = {
                'pending_student_leaves': LeaveApplication.objects.filter(
                    applicant__role=RoleChoices.STUDENT, status='Pending'
                ).count(),
                'pending_teacher_leaves': LeaveApplication.objects.filter(
                    applicant__role=RoleChoices.TEACHER, status='Pending'
                ).count(),
                'active_homework': Homework.objects.filter(is_active=True).count(),
                'published_results': GradeResult.objects.filter(published=True).count(),
                'total_sections': Section.objects.count(),
                'total_subjects': Subject.objects.count(),
            }

        return Response(base_analytics)


# ────────────────────────────────────────────────────────────────────────────
# CMS ViewSets
# ────────────────────────────────────────────────────────────────────────────
class SchoolInfoViewSet(viewsets.ModelViewSet):
    queryset = SchoolInfo.objects.all()
    serializer_class = SchoolInfoSerializer
    permission_classes = [IsStaffOrReadOnly]

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def singleton(self, request):
        """Return the first/only SchoolInfo record without needing to know the ID."""
        info = SchoolInfo.objects.first()
        if not info:
            return Response({'error': 'School info not configured.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SchoolInfoSerializer(info).data)


class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    permission_classes = [IsStaffOrReadOnly]


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.filter(is_active=True)
    serializer_class = AnnouncementSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            qs = qs.filter(is_upcoming=True)
        elif upcoming == 'false':
            qs = qs.filter(is_upcoming=False)
        return qs


class GalleryItemViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all()
    serializer_class = GalleryItemSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return qs


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsStaffOrReadOnly]


# ────────────────────────────────────────────────────────────────────────────
# Faculty & Academic ViewSets
# ────────────────────────────────────────────────────────────────────────────
class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.select_related('user').all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsStaffOrReadOnly]


class AcademicClassViewSet(viewsets.ModelViewSet):
    queryset = AcademicClass.objects.all()
    serializer_class = AcademicClassSerializer
    permission_classes = [IsStaffOrReadOnly]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related('academic_class', 'class_teacher').all()
    serializer_class = SectionSerializer
    permission_classes = [IsStaffOrReadOnly]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.select_related('academic_class').all()
    serializer_class = SubjectSerializer
    permission_classes = [IsStaffOrReadOnly]


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.select_related('section', 'subject', 'teacher').all()
    serializer_class = TimetableSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        return qs


# ────────────────────────────────────────────────────────────────────────────
# Student ViewSet
# ────────────────────────────────────────────────────────────────────────────
class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related('user', 'section').all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == RoleChoices.STUDENT:
            return StudentProfile.objects.filter(user=user)
        return super().get_queryset()


# ────────────────────────────────────────────────────────────────────────────
# Admission ViewSet
# ────────────────────────────────────────────────────────────────────────────
class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    queryset = AdmissionApplication.objects.select_related('applying_for_class').all()
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Bug Fix #4: Use uuid4 instead of count() to avoid race-condition duplicates
        app_number = f"ADM-2026-{str(uuid.uuid4())[:8].upper()}"
        serializer.save(application_number=app_number)

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffOrReadOnly])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in AdmissionApplication.STATUS_CHOICES]
        if new_status in valid_statuses:
            app.status = new_status
            app.remarks = request.data.get('remarks', app.remarks)
            app.save()
            return Response({'message': f'Application {app.application_number} updated to {new_status}.'})
        return Response({'error': f'Invalid status. Valid: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)


# ────────────────────────────────────────────────────────────────────────────
# Attendance ViewSet
# ────────────────────────────────────────────────────────────────────────────
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'marked_by').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsTeacherOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == RoleChoices.STUDENT:
            return qs.filter(student__user=user)
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(student__section_id=section_id)
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(date=date)
        return qs

    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student')
        date = request.data.get('date')
        if student_id and date:
            instance = Attendance.objects.filter(student_id=student_id, date=date).first()
            if instance:
                serializer = self.get_serializer(instance, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save(marked_by=request.user)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)


# ────────────────────────────────────────────────────────────────────────────
# Grade Results ViewSet
# ────────────────────────────────────────────────────────────────────────────
class GradeResultViewSet(viewsets.ModelViewSet):
    queryset = GradeResult.objects.select_related('student', 'subject').all()
    serializer_class = GradeResultSerializer
    permission_classes = [IsTeacherOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == RoleChoices.STUDENT:
            return qs.filter(student__user=user, published=True)
        return qs


class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.select_related('section', 'subject', 'created_by').all()
    serializer_class = HomeworkSerializer
    permission_classes = [IsTeacherOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().filter(is_active=True)
        if user.role == RoleChoices.STUDENT and hasattr(user, 'student_profile'):
            sp = user.student_profile
            if sp.section:
                return qs.filter(section=sp.section)
            return qs.none()
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ────────────────────────────────────────────────────────────────────────────
# Fee Payments ViewSet
# ────────────────────────────────────────────────────────────────────────────
class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.select_related('student').all()
    serializer_class = FeePaymentSerializer
    permission_classes = [IsClerkOrStaff]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == RoleChoices.STUDENT:
            return qs.filter(student__user=user)
        status_filter = self.request.query_params.get('payment_status')
        if status_filter:
            qs = qs.filter(payment_status=status_filter)
        return qs

    def perform_create(self, serializer):
        invoice_num = f"INV-2026-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(invoice_number=invoice_num)

    @action(detail=False, methods=['get'], url_path=r'download-receipt/(?P<invoice_number>[^/.]+)', permission_classes=[permissions.AllowAny])
    def download_receipt(self, request, invoice_number=None):
        """Stream a generated PDF fee receipt by invoice number."""
        user = request.user
        if not (user and user.is_authenticated):
            token = request.query_params.get('token')
            if token:
                from rest_framework_simplejwt.authentication import JWTAuthentication
                try:
                    jwt_auth = JWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(token)
                    user = jwt_auth.get_user(validated_token)
                except Exception:
                    pass
        if not (user and user.is_authenticated):
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        payment = FeePayment.objects.filter(invoice_number=invoice_number).first()
        if not payment:
            return Response({'error': f'Invoice {invoice_number} not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.role == RoleChoices.STUDENT:
            if not hasattr(user, 'student_profile') or payment.student != user.student_profile:
                return Response(
                    {'error': 'You do not have permission to download this fee receipt.'},
                    status=status.HTTP_403_FORBIDDEN
                )


        student = payment.student
        student_name = student.user.get_full_name()
        gr_number = student.gr_number
        class_name = student.section.academic_class.name if student.section and student.section.academic_class else 'Primary Section'

        pdf_bytes = generate_fee_receipt_pdf(
            invoice_number=payment.invoice_number,
            student_name=student_name,
            gr_number=gr_number,
            class_name=class_name,
            title=payment.title,
            total_amount=float(payment.total_amount),
            paid_amount=float(payment.paid_amount),
            due_date=str(payment.due_date),
            payment_status=payment.payment_status,
            payment_mode=payment.payment_mode or 'Online NEFT / UPI',
            transaction_id=payment.transaction_id,
            paid_at=payment.paid_at.strftime('%d-%b-%Y %I:%M %p') if payment.paid_at else None
        )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f"{payment.invoice_number}_Receipt.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response



# ────────────────────────────────────────────────────────────────────────────
# Document Requests ViewSet (Core Feature)
# ────────────────────────────────────────────────────────────────────────────
class DocumentRequestViewSet(viewsets.ModelViewSet):
    queryset = DocumentRequest.objects.select_related('student', 'approved_by').all()
    serializer_class = DocumentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user and user.is_authenticated and user.role == RoleChoices.STUDENT:
            return qs.filter(student__user=user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'student_profile'):
            # Bug Fix #4: Use uuid4 to avoid race-condition duplicate request numbers
            req_num = f"REQ-{str(uuid.uuid4())[:8].upper()}"
            serializer.save(student=user.student_profile, request_number=req_num)
        else:
            serializer.save(request_number=f"REQ-{str(uuid.uuid4())[:8].upper()}")

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrReadOnly])
    def approve(self, request, pk=None):
        doc_req = self.get_object()
        doc_req.status = 'Approved'
        doc_req.admin_remarks = request.data.get('remarks', 'Approved by Administration')
        doc_req.approved_by = request.user
        doc_req.approved_at = timezone.now()
        doc_req.save()
        return Response({'message': f'Document request {doc_req.request_number} approved successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrReadOnly])
    def reject(self, request, pk=None):
        doc_req = self.get_object()
        doc_req.status = 'Rejected'
        doc_req.admin_remarks = request.data.get('remarks', 'Rejected by Administration')
        doc_req.save()
        return Response({'message': f'Document request {doc_req.request_number} rejected.'})

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def download_pdf(self, request, pk=None):
        """Stream a generated PDF certificate for the document request."""
        user = request.user
        if not (user and user.is_authenticated):
            token = request.query_params.get('token')
            if token:
                from rest_framework_simplejwt.authentication import JWTAuthentication
                try:
                    jwt_auth = JWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(token)
                    user = jwt_auth.get_user(validated_token)
                    request.user = user
                except Exception:
                    pass
        if not (user and user.is_authenticated):
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        doc_req = self.get_object()

        # Bug Fix #5: Students can only download their own certificates
        if user.role == RoleChoices.STUDENT:
            if not hasattr(user, 'student_profile') or \
               doc_req.student != user.student_profile:
                return Response(
                    {'error': 'You do not have permission to download this certificate.'},
                    status=status.HTTP_403_FORBIDDEN
                )


        student = doc_req.student
        student_name = student.user.get_full_name()
        gr_number = student.gr_number
        class_name = student.section.academic_class.name if student.section else 'Primary Section'

        pdf_bytes = generate_certificate_pdf(
            student_name=student_name,
            gr_number=gr_number,
            class_name=class_name,
            doc_type=doc_req.get_document_type_display(),
            purpose=doc_req.purpose,
            issued_date=timezone.now().strftime('%d-%b-%Y')
        )

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        filename = f"{doc_req.request_number}_{doc_req.document_type}_Certificate.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response


# ────────────────────────────────────────────────────────────────────────────
# Leave Applications ViewSet
# ────────────────────────────────────────────────────────────────────────────
class LeaveApplicationViewSet(viewsets.ModelViewSet):
    queryset = LeaveApplication.objects.select_related('applicant', 'reviewed_by').all()
    serializer_class = LeaveApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role in [RoleChoices.STUDENT, RoleChoices.TEACHER]:
            return qs.filter(applicant=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsPrincipal])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'Approved'
        leave.reviewed_by = request.user
        leave.save()
        return Response({'message': 'Leave application approved.'})

    @action(detail=True, methods=['post'], permission_classes=[IsPrincipal])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'Rejected'
        leave.reviewed_by = request.user
        leave.save()
        return Response({'message': 'Leave application rejected.'})


# ────────────────────────────────────────────────────────────────────────────
# Contact Messages ViewSet
# ────────────────────────────────────────────────────────────────────────────
class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        # Bug Fix #10: Contact messages should require staff auth for list/retrieve
        # Anonymous users can only POST (submit a message)
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffOrReadOnly()]


# ────────────────────────────────────────────────────────────────────────────
# Site Visitor Leads ViewSet (Core Clerk Feature)
# ────────────────────────────────────────────────────────────────────────────
class SiteVisitorLogViewSet(viewsets.ModelViewSet):
    """
    POST  — AllowAny (public enquiry widget submission).
    GET   — Staff / Clerk only.
    The phone number is the primary field prominently displayed on the Clerk dashboard.
    """
    queryset = SiteVisitorLog.objects.all()
    serializer_class = SiteVisitorLogSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffOrReadOnly()]

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def perform_create(self, serializer):
        ip = self.get_client_ip(self.request)
        referer = self.request.META.get('HTTP_REFERER', 'Direct / Unknown')
        serializer.save(ip_address=ip, page_visited=referer)

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffOrReadOnly])
    def mark_contacted(self, request, pk=None):
        """Clerk marks a visitor lead as contacted after calling them."""
        visitor = self.get_object()
        visitor.is_contacted = True
        visitor.contacted_notes = request.data.get('notes', '')
        visitor.save()
        return Response({'message': f'Visitor {visitor.name} marked as contacted.'})
