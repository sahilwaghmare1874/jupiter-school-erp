from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from core.models import (
    RoleChoices, AcademicClass, Section, StudentProfile,
    DocumentRequest, FeePayment
)
from core.utils import generate_certificate_pdf, generate_fee_receipt_pdf

User = get_user_model()

class PdfGenerationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.academic_class = AcademicClass.objects.create(name="Grade 5")
        self.section = Section.objects.create(name="A", academic_class=self.academic_class)
        self.student_user = User.objects.create_user(
            username="student_pdf",
            email="stu_pdf@test.com",
            password="Pass123!",
            role=RoleChoices.STUDENT,
            first_name="Alex",
            last_name="Sharma"
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            section=self.section,
            gr_number="GR-PDF-101",
            roll_number="15"
        )
        self.doc_req = DocumentRequest.objects.create(
            student=self.student_profile,
            document_type="Bonafide",
            purpose="Passport Verification",
            status="Approved"
        )
        self.fee_payment = FeePayment.objects.create(
            invoice_number="INV-2026-TEST01",
            student=self.student_profile,
            title="Term 1 Tuition Fee",
            total_amount=22500.00,
            paid_amount=22500.00,
            payment_status="Paid",
            due_date="2026-01-15",
            payment_mode="Online"
        )

    def test_generate_certificate_pdf_bytes(self):
        """ReportLab certificate generator must produce valid PDF binary."""
        pdf_bytes = generate_certificate_pdf(
            student_name="Alex Sharma",
            gr_number="GR-PDF-101",
            class_name="Grade 5",
            doc_type="Bonafide Certificate"
        )
        self.assertTrue(len(pdf_bytes) > 0)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_generate_fee_receipt_pdf_bytes(self):
        """ReportLab fee receipt generator must produce valid PDF binary."""
        pdf_bytes = generate_fee_receipt_pdf(
            invoice_number=self.fee_payment.invoice_number,
            student_name="Alex Sharma",
            gr_number="GR-PDF-101",
            class_name="Grade 5",
            title="Term 1 Tuition Fee",
            total_amount=float(self.fee_payment.total_amount),
            paid_amount=float(self.fee_payment.paid_amount),
            due_date=str(self.fee_payment.due_date),
            payment_status=self.fee_payment.payment_status
        )
        self.assertTrue(len(pdf_bytes) > 0)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

    def test_download_certificate_endpoint_authenticated(self):
        """Authenticated GET /api/document-requests/<id>/download_pdf/ must return PDF."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get(f"/api/document-requests/{self.doc_req.id}/download_pdf/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res["Content-Type"], "application/pdf")
        self.assertTrue(res.content.startswith(b"%PDF"))

    def test_download_fee_receipt_endpoint_authenticated(self):
        """Authenticated GET /api/fee-payments/download-receipt/<invoice>/ must return PDF."""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get(f"/api/fee-payments/download-receipt/{self.fee_payment.invoice_number}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res["Content-Type"], "application/pdf")
        self.assertTrue(res.content.startswith(b"%PDF"))

    def test_download_certificate_with_token_query_param(self):
        """Unauthenticated client with valid ?token= query param must be allowed to download certificate."""
        token = str(AccessToken.for_user(self.student_user))
        res = self.client.get(f"/api/document-requests/{self.doc_req.id}/download_pdf/?token={token}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res["Content-Type"], "application/pdf")
