import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { API_BASE_URL } from './services/api-config';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080/api' },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  });

  function intercept(url: string): void {
    const request = new HttpRequest('GET', url);
    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      const protectedUrls = [
        'http://localhost:8080/api/quiz/results',
        'http://localhost:8080/api/profile',
        'http://localhost:8080/api/logout',
      ];
      expect(req.headers.get('Authorization')).toBe(
        protectedUrls.includes(url) ? 'Bearer session-token' : null,
      );
      return of(new HttpResponse());
    }));
  }

  it('adds the bearer token only to protected API requests', () => {
    localStorage.setItem('token', 'session-token');
    intercept('http://localhost:8080/api/quiz/results');
    intercept('http://localhost:8080/api/profile');
    intercept('http://localhost:8080/api/logout');
    intercept('http://localhost:8080/api/quiz/themes');
    intercept('http://localhost:8080/api/login');
    intercept('https://example.com/api/quiz/results');
  });

  it('does not add an authorization header when there is no token', () => {
    const request = new HttpRequest('GET', 'http://localhost:8080/api/quiz/results');
    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      expect(req.headers.has('Authorization')).toBe(false);
      return of(new HttpResponse());
    }));
  });

  it('clears expired credentials and redirects after a protected request returns 401', () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('username', 'alice');
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const request = new HttpRequest('GET', 'http://localhost:8080/api/profile');

    TestBed.runInInjectionContext(() => authInterceptor(request, () =>
      throwError(() => new HttpErrorResponse({ status: 401 })),
    )).subscribe({ error: () => undefined });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: router.url },
    });
  });
});
