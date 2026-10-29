import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import RoleChoices

User = get_user_model()

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "SchoolPass123!"
        
        self.roles = [
            RoleChoices.TRUSTEE,
            RoleChoices.PRINCIPAL,
            RoleChoices.TEACHER,
            RoleChoices.CLERK,
            RoleChoices.STUDENT,
        ]
        self.users = {}
        for role in self.roles:
            username = f"user_{role.lower()}"
            self.users[role] = User.objects.create_user(
                username=username,
                email=f"{username}@school.test",
                password=self.password,
                role=role,
                first_name="Test",
                last_name=role.capitalize(),
            )

    def test_login_all_roles(self):
        """Verify each of the 5 roles can log in and receive JWT tokens."""
        for role, user in self.users.items():
            response = self.client.post("/api/auth/token/", {
                "username": user.username,
                "password": self.password,
            }, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK, f"Login failed for role {role}")
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)

    def test_login_invalid_password(self):
        """Invalid credentials must return 401 Unauthorized."""
        response = self.client.post("/api/auth/token/", {
            "username": "user_student",
            "password": "WrongPassword!",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Refresh token must generate a new access token."""
        login_res = self.client.post("/api/auth/token/", {
            "username": "user_principal",
            "password": self.password,
        }, format="json")
        refresh_token = login_res.data["refresh"]

        refresh_res = self.client.post("/api/auth/token/refresh/", {
            "refresh": refresh_token,
        }, format="json")
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

    def test_auth_me_endpoint(self):
        """Endpoint /api/auth/me/ must return authenticated user's profile."""
        user = self.users[RoleChoices.TEACHER]
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], RoleChoices.TEACHER)
        self.assertEqual(response.data["username"], user.username)
