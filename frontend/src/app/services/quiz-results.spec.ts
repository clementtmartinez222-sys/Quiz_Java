import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL, QUIZ_RESULT_SUBMISSION_ENABLED } from './api-config';
import { QuizResultsService } from './quiz-results';

describe('QuizResultsService', () => {
  let http: HttpTestingController;
  afterEach(() => { http.verify(); localStorage.removeItem('token'); });
  const configure = (enabled: boolean) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: 'http://localhost:8080/api' },
      { provide: QUIZ_RESULT_SUBMISSION_ENABLED, useValue: enabled }] });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(QuizResultsService);
  };
  const payload = { themeId: 'java', answers: [{ questionId: '1', selectedOptionId: 'a', responseTimeSeconds: 2 }] };
  it('submits answers to the authenticated grading and persistence endpoint', () => {
    localStorage.setItem('token', 'session-token');
    const service = configure(true);
    service.gradeAndSubmit(payload).subscribe();
    const request = http.expectOne('http://localhost:8080/api/quiz/results');
    expect(request.request.body).toEqual(payload);
    request.flush({ correctAnswersCount: 1 });
  });
  it('grades a guest quiz without persisting it to the leaderboard', () => {
    const service = configure(true);
    service.gradeAndSubmit(payload).subscribe();
    const request = http.expectOne('http://localhost:8080/api/quiz/grade');
    expect(request.request.body).toEqual(payload);
    request.flush({ correctAnswersCount: 1 });
  });
});
