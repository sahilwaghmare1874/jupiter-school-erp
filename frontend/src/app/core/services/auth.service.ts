import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;


  token = signal<string | null>(localStorage.getItem('jupiter_jwt_token'));
  refreshTokenValue = signal<string | null>(localStorage.getItem('jupiter_refresh_token'));
  currentUser = signal<User | null>(null);

  isLoggedIn = computed(() => !!this.token());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor(private http: HttpClient, private router: Router) {
    if (this.token()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/token/`, credentials).pipe(
      tap(res => {
        this.setSession(res.access, res.refresh);
        this.fetchCurrentUser().subscribe(user => {
          // Bug Fix #15: Role-based redirect after login
          if (user) {
            this.redirectByRole(user.role);
          }
        });
      })
    );
  }

  /** Redirect user to the correct portal based on their role */
  redirectByRole(role: UserRole): void {
    if (role === 'STUDENT') {
      this.router.navigate(['/student-portal']);
    } else if (['TRUSTEE', 'PRINCIPAL', 'TEACHER', 'CLERK'].includes(role)) {
      this.router.navigate(['/admin-portal']);
    }
  }

  /**
   * Quick Demo Login for instant testing across 5 roles.
   * Uses real API credentials to get a valid JWT token.
   */
  quickDemoLogin(role: UserRole): Observable<any> {
    const demoCredentials: Record<UserRole, { username: string; password: string }> = {
      TRUSTEE:   { username: 'trustee_admin',   password: 'SchoolPass123!' },
      PRINCIPAL: { username: 'principal_user',  password: 'SchoolPass123!' },
      TEACHER:   { username: 'teacher_anjali',  password: 'SchoolPass123!' },
      CLERK:     { username: 'clerk_mahesh',    password: 'SchoolPass123!' },
      STUDENT:   { username: 'student_alex',    password: 'SchoolPass123!' },
    };

    return this.login(demoCredentials[role]);
  }

  /** Attempt to refresh access token using stored refresh token */
  refreshToken(): Observable<string | null> {
    const refresh = this.refreshTokenValue();
    if (!refresh) return of(null);

    return this.http.post<{ access: string }>(`${this.apiUrl}/auth/token/refresh/`, { refresh }).pipe(
      map(res => {
        localStorage.setItem('jupiter_jwt_token', res.access);
        this.token.set(res.access);
        return res.access;
      }),
      catchError(() => of(null))
    );
  }

  fetchCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/auth/me/`).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        return of(this.currentUser());
      })
    );
  }

  // Bug Fix #12: logout() now uses Angular Router instead of window.location.href
  logout() {
    localStorage.removeItem('jupiter_jwt_token');
    localStorage.removeItem('jupiter_refresh_token');
    this.token.set(null);
    this.refreshTokenValue.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private setSession(accessToken: string, refreshToken?: string) {
    localStorage.setItem('jupiter_jwt_token', accessToken);
    this.token.set(accessToken);
    if (refreshToken) {
      localStorage.setItem('jupiter_refresh_token', refreshToken);
      this.refreshTokenValue.set(refreshToken);
    }
  }
}
