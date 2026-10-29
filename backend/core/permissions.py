from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import RoleChoices

class IsTrustee(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.TRUSTEE)

class IsPrincipal(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [RoleChoices.TRUSTEE, RoleChoices.PRINCIPAL])

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [RoleChoices.TRUSTEE, RoleChoices.PRINCIPAL, RoleChoices.TEACHER])

class IsClerk(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [RoleChoices.TRUSTEE, RoleChoices.PRINCIPAL, RoleChoices.CLERK])

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleChoices.STUDENT)

class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role in [RoleChoices.TRUSTEE, RoleChoices.PRINCIPAL, RoleChoices.TEACHER, RoleChoices.CLERK])


class IsTeacherOrStaff(BasePermission):
    """Allows safe methods for any authenticated user, but write actions only for Teacher, Principal, or Trustee."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in [RoleChoices.TEACHER, RoleChoices.PRINCIPAL, RoleChoices.TRUSTEE]


class IsClerkOrStaff(BasePermission):
    """Allows safe methods for authenticated users, but fee/doc administration only for Clerk, Principal, Trustee."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in [RoleChoices.CLERK, RoleChoices.PRINCIPAL, RoleChoices.TRUSTEE]

