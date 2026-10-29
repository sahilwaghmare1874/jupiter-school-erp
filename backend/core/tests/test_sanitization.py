from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import (
    RoleChoices, AcademicClass, Section, Subject, StudentProfile,
    ContactMessage
)

User = get_user_model()

class SanitizationValidationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.academic_class = AcademicClass.objects.create(name="Grade 5")
        self.section = Section.objects.create(name="A", academic_class=self.academic_class)
        self.subject = Subject.objects.create(name="Mathematics", code="MATH501", academic_class=self.academic_class)
        self.teacher_user = User.objects.create_user(
            username="teacher_sanit",
            email="teacher_sanit@test.com",
            password="Pass123!",
            role=RoleChoices.TEACHER
        )
        self.student_user = User.objects.create_user(
            username="student_sanit",
            email="student_sanit@test.com",
            password="Pass123!",
            role=RoleChoices.STUDENT
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            gr_number="GR-SAN-001",
            roll_number="5"
        )

    def test_marks_obtained_cannot_exceed_total(self):
        """Marks obtained cannot exceed total marks in GradeResult."""
        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.post("/api/grades/", {
            "student": self.student_profile.id,
            "subject": self.subject.id,
            "exam_name": "Unit Test 1",
            "marks_obtained": 120.0,
            "total_marks": 100.0
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_xss_stripped_from_contact_message(self):
        """Dangerous script and iframe tags must be stripped from contact messages."""
        res = self.client.post("/api/contact-messages/", {
            "name": "Attacker",
            "email": "attacker@evil.com",
            "phone": "+91 99999 88888",
            "subject": "Inquiry",
            "message": "Dangerous text <script>document.cookie</script> and <iframe src='evil.com'></iframe> clean text"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        msg = ContactMessage.objects.get(id=res.data["id"])
        self.assertNotIn("<script>", msg.message)
        self.assertNotIn("<iframe", msg.message)
        self.assertIn("Dangerous text", msg.message)
        self.assertIn("clean text", msg.message)

    def test_admission_invalid_date_rejected(self):
        """Admissions with invalid date format must be rejected with 400."""
        res = self.client.post("/api/admissions/", {
            "applicant_name": "Test Child",
            "date_of_birth": "invalid-date-format",
            "gender": "Male",
            "applying_for_class": self.academic_class.id,
            "parent_name": "Test Parent",
            "parent_phone": "9876543210",
            "parent_email": "parent@test.com"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
