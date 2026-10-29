import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly usernameStorageKey = 'username';

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/login`, credentials).pipe(
      map((response): LoginResponse => {
        if (
          typeof response !== 'object'
          || response === null
          || !('token' in response)
          || typeof response.token !== 'string'
          || response.token.trim().length === 0
        ) {
          throw new Error('Invalid login response: expected a non-empty token.');
        }

        return { token: response.token.trim() };
      }),
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem(this.usernameStorageKey, credentials.username);
      }),
    );
  }

  register(credentials: RegisterCredentials): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/register`, credentials);
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post<void>(`${this.apiBaseUrl}/logout`, null).subscribe({
        error: (error: unknown) => console.error('Unable to revoke the authentication session', error),
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem(this.usernameStorageKey);
  }

  isLoggedIn(): boolean {
    // This only checks whether a token exists; the backend remains the authority on its validity.
    return !!localStorage.getItem('token');
  }

  getCurrentUsername(): string | null {
    return localStorage.getItem(this.usernameStorageKey);
  }
}
