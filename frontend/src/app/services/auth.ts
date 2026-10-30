import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-config';
import { SessionState } from './session-state';

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

function parseLoginResponse(response: unknown): LoginResponse {
  if (typeof response !== 'object' || response === null || !('token' in response)
    || typeof response.token !== 'string' || response.token.trim().length === 0) {
    throw new Error('Invalid authentication response: expected a non-empty token.');
  }
  return { token: response.token.trim() };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly usernameStorageKey = 'username';
  private readonly session = inject(SessionState);

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/login`, credentials).pipe(
      map(parseLoginResponse),
      tap((response) => this.storeSession(response, credentials.username)),
    );
  }

  register(credentials: RegisterCredentials): Observable<LoginResponse> {
    return this.http.post<unknown>(`${this.apiBaseUrl}/register`, credentials).pipe(
      map(parseLoginResponse),
      tap((response) => this.storeSession(response, credentials.username)),
    );
  }

  private storeSession(response: LoginResponse, username: string): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem(this.usernameStorageKey, username);
    this.session.markAuthenticated();
  }

  logout(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post<void>(`${this.apiBaseUrl}/logout`, null).subscribe({
        error: (error: unknown) => console.error('Unable to revoke the authentication session', error),
      });
    }
    this.session.clear();
  }

  isLoggedIn(): boolean {
    // This only checks whether a token exists; the backend remains the authority on its validity.
    return this.session.isAuthenticated();
  }

  getCurrentUsername(): string | null {
    return localStorage.getItem(this.usernameStorageKey);
  }
}
