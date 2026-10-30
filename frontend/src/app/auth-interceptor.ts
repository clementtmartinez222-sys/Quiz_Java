import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './services/api-config';
import { SessionState } from './services/session-state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const session = inject(SessionState);
  const apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  const isProtectedRequest = req.url === `${apiBaseUrl}/profile`
    || req.url === `${apiBaseUrl}/logout`
    || req.url === `${apiBaseUrl}/quiz/results`
    || req.url === `${apiBaseUrl}/friends`
    || req.url.startsWith(`${apiBaseUrl}/friends/`);
  const token = localStorage.getItem('token');

  const request = token && isProtectedRequest
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        isProtectedRequest
        && error instanceof HttpErrorResponse
        && error.status === 401
      ) {
        session.clear();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
