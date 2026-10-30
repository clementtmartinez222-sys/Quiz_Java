import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionState {
  private readonly authenticated = signal(typeof localStorage !== 'undefined' && !!localStorage.getItem('token'));
  readonly isAuthenticated = this.authenticated.asReadonly();

  markAuthenticated(): void { this.authenticated.set(true); }

  clear(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.authenticated.set(false);
  }
}
