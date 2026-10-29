import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL, QUIZ_RESULT_SUBMISSION_ENABLED } from './api-config';
import { QuizResultsService } from './quiz-results';

describe('QuizResultsService', () => {
  let httpTestingController: HttpTestingController | undefined;

  function configure(submissionEnabled: boolean): QuizResultsService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080/api' },
        { provide: QUIZ_RESULT_SUBMISSION_ENABLED, useValue: submissionEnabled },
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    return TestBed.inject(QuizResultsService);
  }

  afterEach(() => {
    httpTestingController?.verify();
    localStorage.removeItem('token');
  });

  const result = {
    themeId: 'java',
    correctAnswersCount: 2,
    maxConsecutiveCorrect: 2,
    averageResponseTimeSeconds: 2.5,
    totalQuestions: 3,
  };

  it('does not send results while backend submission is disabled', () => {
    const service = configure(false);
    let completed = false;

    service.submitResult(result).subscribe({ complete: () => completed = true });

    expect(completed).toBe(true);
    httpTestingController?.expectNone('http://localhost:8080/api/quiz/results');
  });

  it('posts results when backend submission is enabled', () => {
    localStorage.setItem('token', 'session-token');
    const service = configure(true);
    let completed = false;

    service.submitResult(result).subscribe({ complete: () => completed = true });

    const request = httpTestingController?.expectOne('http://localhost:8080/api/quiz/results');
    expect(request?.request.method).toBe('POST');
    expect(request?.request.body).toEqual(result);
    request?.flush(null);

    expect(completed).toBe(true);
  });

  it('passes result submission errors to the caller', () => {
    localStorage.setItem('token', 'session-token');
    const service = configure(true);
    let receivedError: unknown;

    service.submitResult(result).subscribe({
      error: (error: unknown) => receivedError = error,
    });

    httpTestingController?.expectOne('http://localhost:8080/api/quiz/results')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(receivedError).toMatchObject({ status: 500 });
  });

  it('does not send results for a guest even when result saving is enabled', () => {
    const service = configure(true);
    let completed = false;

    service.submitResult(result).subscribe({ complete: () => completed = true });

    expect(service.isSubmissionEnabled).toBe(false);
    expect(completed).toBe(true);
    httpTestingController?.expectNone('http://localhost:8080/api/quiz/results');
  });
});
