import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

export const API_REQUEST_TIMEOUT_MS = new InjectionToken<number>('API_REQUEST_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => environment.apiRequestTimeoutMs,
});

export const QUIZ_RESULT_SUBMISSION_ENABLED = new InjectionToken<boolean>(
  'QUIZ_RESULT_SUBMISSION_ENABLED',
  {
    providedIn: 'root',
    factory: () => environment.quizResultSubmissionEnabled,
  },
);
