import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from './services/api-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  const isProtectedQuizRequest = req.url.startsWith(`${apiBaseUrl}/quiz/`);
  const token = localStorage.getItem('token');

  const request = token && isProtectedQuizRequest
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        isProtectedQuizRequest
        && error instanceof HttpErrorResponse
        && error.status === 401
      ) {
        localStorage.removeItem('token');
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
