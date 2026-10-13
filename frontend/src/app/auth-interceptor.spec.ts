import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { API_BASE_URL } from './services/api-config';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080/api' },
      ],
    });
  });

  afterEach(() => localStorage.removeItem('token'));

  function intercept(url: string): void {
    const request = new HttpRequest('GET', url);
    TestBed.runInInjectionContext(() => authInterceptor(request, (req) => {
      expect(req.headers.get('Authorization')).toBe(
        url === 'http://localhost:8080/api/quiz/results'
          ? 'Bearer session-token'
          : null,
      );
      return of(new HttpResponse());
    }));
  }

  it('adds the token to protected quiz API requests only', () => {
    localStorage.setItem('token', 'session-token');
    intercept('http://localhost:8080/api/quiz/results');
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

  it('clears an expired token and redirects to login after a protected request returns 401', () => {
    localStorage.setItem('token', 'expired-token');
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const request = new HttpRequest('GET', 'http://localhost:8080/api/quiz/results');

    TestBed.runInInjectionContext(() => authInterceptor(request, () =>
      throwError(() => new HttpErrorResponse({ status: 401 })),
    )).subscribe({ error: () => undefined });

    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: router.url },
    });
  });
});
