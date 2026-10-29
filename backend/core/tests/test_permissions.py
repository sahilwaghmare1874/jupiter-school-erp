from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import (
    RoleChoices, AcademicClass, Section, Subject, StudentProfile,
    Attendance, GradeResult, Homework, FeePayment
)

User = get_user_model()

class PermissionsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "SchoolPass123!"

        # Create users
        self.student_user = User.objects.create_user(
            username="test_student", email="student@test.com", password=self.password, role=RoleChoices.STUDENT
        )
        self.teacher_user = User.objects.create_user(
            username="test_teacher", email="teacher@test.com", password=self.password, role=RoleChoices.TEACHER
        )
        self.clerk_user = User.objects.create_user(
            username="test_clerk", email="clerk@test.com", password=self.password, role=RoleChoices.CLERK
        )
        self.principal_user = User.objects.create_user(
            username="test_principal", email="principal@test.com", password=self.password, role=RoleChoices.PRINCIPAL
        )

        # Academic fixtures
        self.academic_class = AcademicClass.objects.create(name="Grade 5")
        self.section = Section.objects.create(name="A", academic_class=self.academic_class)
        self.subject = Subject.objects.create(name="Mathematics", code="MATH501", academic_class=self.academic_class)
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            gr_number="GR-TEST-001",
            roll_number="1",
        )

    def test_student_cannot_post_attendance(self):
        """Students must be FORBIDDEN from posting attendance."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.post("/api/attendance/", {
            "student": self.student_profile.id,
            "date": "2026-02-15",
            "status": "Present"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_post_grades(self):
        """Students must be FORBIDDEN from submitting grades."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.post("/api/grades/", {
            "student": self.student_profile.id,
            "subject": self.subject.id,
            "exam_name": "Finals",
            "marks_obtained": 100,
            "total_marks": 100
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_post_homework(self):
        """Students must be FORBIDDEN from creating homework."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.post("/api/homework/", {
            "section": self.section.id,
            "subject": self.subject.id,
            "title": "Hacked Homework",
            "due_date": "2026-03-01"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_post_fee_payment(self):
        """Students must be FORBIDDEN from creating/tampering fee payment records."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.post("/api/fee-payments/", {
            "student": self.student_profile.id,
            "title": "Tampered Payment",
            "amount": 5000,
            "total_amount": 5000,
            "paid_amount": 5000,
            "status": "Paid"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_post_attendance(self):
        """Teachers must be authorized to record attendance."""
        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.post("/api/attendance/", {
            "student": self.student_profile.id,
            "date": "2026-02-15",
            "status": "Present",
            "remarks": "On time"
        }, format="json")
        self.assertIn(res.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_teacher_can_post_homework(self):
        """Teachers must be authorized to create homework assignments."""
        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.post("/api/homework/", {
            "section": self.section.id,
            "subject": self.subject.id,
            "title": "Fractions Chapter 4",
            "description": "Complete exercise 4.1",
            "due_date": "2026-02-25"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_clerk_can_create_fee_payment(self):
        """Clerk must be authorized to create fee payment records."""
        self.client.force_authenticate(user=self.clerk_user)
        res = self.client.post("/api/fee-payments/", {
            "student": self.student_profile.id,
            "title": "Term 2 Tuition Fee",
            "amount": 15000,
            "total_amount": 15000,
            "paid_amount": 15000,
            "payment_status": "Paid",
            "due_date": "2026-03-15"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
