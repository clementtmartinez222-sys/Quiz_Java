import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { API_BASE_URL, QUIZ_RESULT_SUBMISSION_ENABLED } from './api-config';
import { AuthService } from './auth';

export interface QuizResultPayload {
  themeId: string;
  correctAnswersCount: number;
  maxConsecutiveCorrect: number;
  averageResponseTimeSeconds: number;
  totalQuestions: number;
}

// Scores are computed in the browser and must not be treated as authoritative by the backend.
@Injectable({ providedIn: 'root' })
export class QuizResultsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly submissionEnabled = inject(QUIZ_RESULT_SUBMISSION_ENABLED);
  private readonly auth = inject(AuthService);

  get isSubmissionEnabled(): boolean {
    return this.submissionEnabled && this.auth.isLoggedIn();
  }

  submitResult(result: QuizResultPayload): Observable<void> {
    if (!this.isSubmissionEnabled) return EMPTY;
    return this.http.post<void>(`${this.apiBaseUrl}/quiz/results`, result);
  }
}
