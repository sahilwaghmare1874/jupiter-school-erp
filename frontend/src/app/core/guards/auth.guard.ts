import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Base auth guard — checks if user is logged in */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Bug Fix #15: Role-based guard for admin portal.
 * Only TRUSTEE, PRINCIPAL, TEACHER, CLERK can access admin portal.
 * Students are redirected to student portal.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const role = authService.userRole();
  const adminRoles = ['TRUSTEE', 'PRINCIPAL', 'TEACHER', 'CLERK'];

  if (role && adminRoles.includes(role)) {
    return true;
  }

  // Students trying to access admin portal → redirect to student portal
  if (role === 'STUDENT') {
    router.navigate(['/student-portal']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Bug Fix #15: Role-based guard for student portal.
 * Only STUDENT role can access student portal.
 * Staff are redirected to admin portal.
 */
export const studentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const role = authService.userRole();

  if (role === 'STUDENT') {
    return true;
  }

  // Staff trying to access student portal → redirect to admin portal
  const adminRoles = ['TRUSTEE', 'PRINCIPAL', 'TEACHER', 'CLERK'];
  if (role && adminRoles.includes(role)) {
    router.navigate(['/admin-portal']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};
