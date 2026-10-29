from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import (
    RoleChoices, AcademicClass, Section, StudentProfile,
    AdmissionApplication, ContactMessage, DocumentRequest,
    SchoolInfo, Announcement
)

User = get_user_model()

class ApiEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.academic_class = AcademicClass.objects.create(name="Grade 5")
        self.section = Section.objects.create(name="A", academic_class=self.academic_class)
        self.student_user = User.objects.create_user(
            username="student_api", email="stu_api@test.com", password="Pass123!", role=RoleChoices.STUDENT
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            gr_number="GR-API-001",
            roll_number="21"
        )
        self.clerk_user = User.objects.create_user(
            username="clerk_api", email="clerk_api@test.com", password="Pass123!", role=RoleChoices.CLERK
        )

    def test_public_admission_submission(self):
        """Public admission submission should create application with unique ADM-2026 application number."""
        data = {
            "applicant_name": "Rohan Deshmukh",
            "date_of_birth": "2015-06-15",
            "gender": "Male",
            "applying_for_class": self.academic_class.id,
            "parent_name": "Suresh Deshmukh",
            "parent_phone": "+91 98220 99999",
            "parent_email": "suresh.d@gmail.com",
            "address": "Shendre, Satara"
        }
        res = self.client.post("/api/admissions/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["application_number"].startswith("ADM-2026-"))
        self.assertEqual(res.data["applicant_name"], "Rohan Deshmukh")

    def test_contact_message_submission_and_sanitization(self):
        """Contact message should save successfully and strip any HTML tags."""
        data = {
            "name": "Mahesh Patil",
            "email": "mahesh.patil@yahoo.com",
            "phone": "+91 99887 76655",
            "subject": "Campus Tour Request",
            "message": "Hello, <script>alert('xss')</script>I would like to visit the campus."
        }
        res = self.client.post("/api/contact-messages/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        msg = ContactMessage.objects.get(id=res.data["id"])
        self.assertNotIn("<script>", msg.message)
        self.assertIn("I would like to visit the campus", msg.message)

    def test_student_document_request(self):
        """Authenticated student should be able to submit a document request."""
        self.client.force_authenticate(user=self.student_user)
        data = {
            "student": self.student_profile.id,
            "document_type": "Bonafide",
            "purpose": "Passport Application"
        }
        res = self.client.post("/api/document-requests/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["request_number"].startswith("REQ-"))

    def test_school_info_singleton(self):
        """School info singleton endpoint should return school configuration."""
        SchoolInfo.objects.create(
            name="Jupiter English Medium School",
            email="info@jupiterschoolsatara.org",
            phone="+91 2162 270123",
            address="NH-4, Shendre, Satara"
        )
        res = self.client.get("/api/school-info/singleton/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Jupiter English Medium School")

    def test_announcements_list(self):
        """Active announcements should be publicly listed."""
        Announcement.objects.create(
            title="School Annual Gathering 2026",
            content="Annual gathering preparations have begun.",
            category="Event",
            target_role="ALL",
            is_active=True
        )
        res = self.client.get("/api/announcements/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data) >= 1)
