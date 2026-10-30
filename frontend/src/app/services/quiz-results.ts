import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, QUIZ_RESULT_SUBMISSION_ENABLED } from './api-config';
import { AuthService } from './auth';

export interface QuizAnswerSubmission {
  questionId: string;
  selectedOptionId: string | null;
  responseTimeSeconds: number;
}

export interface QuizResultPayload {
  themeId: string;
  answers: QuizAnswerSubmission[];
}

export interface QuizGradeResponse {
  correctAnswersCount: number;
  maxConsecutiveCorrect: number;
  averageResponseTimeSeconds: number;
  totalQuestions: number;
  correctOptionIds: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class QuizResultsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly submissionEnabled = inject(QUIZ_RESULT_SUBMISSION_ENABLED);
  private readonly auth = inject(AuthService);

  get isSubmissionEnabled(): boolean { return this.submissionEnabled && this.auth.isLoggedIn(); }

  gradeAndSubmit(result: QuizResultPayload): Observable<QuizGradeResponse> {
    const endpoint = this.isSubmissionEnabled ? 'results' : 'grade';
    return this.http.post<QuizGradeResponse>(`${this.apiBaseUrl}/quiz/${endpoint}`, result);
  }
}
