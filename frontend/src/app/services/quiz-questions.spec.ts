import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QuizQuestionsService, parseQuizQuestions, parseQuizThemes } from './quiz-questions';

describe('QuizQuestionsService', () => {
  let service: QuizQuestionsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizQuestionsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads categorized themes from the API and validates the response', () => {
    let themes: ReturnType<typeof parseQuizThemes> = [];
    service.getThemes().subscribe((result) => themes = result);

    const request = httpTesting.expectOne('/api/quiz/themes');
    expect(request.request.method).toBe('GET');
    request.flush([
      { id: 'angular', name: 'Angular & TypeScript', category: 'Programmation' },
      { id: 'java', name: 'Java & Spring Boot', category: 'Programmation' },
    ]);

    expect(themes).toEqual([
      { id: 'angular', name: 'Angular & TypeScript', category: 'Programmation' },
      { id: 'java', name: 'Java & Spring Boot', category: 'Programmation' },
    ]);
  });

  it('loads and validates questions for the selected theme', () => {
    let questionText = '';
    service.getQuestions('angular').subscribe((questions) => {
      questionText = questions[0].questionText;
      expect(questions[0].options.map((option) => option.id)).toContain('observable');
    });

    const request = httpTesting.expectOne('/api/quiz/themes/angular/questions');
    expect(request.request.method).toBe('GET');
    request.flush([{
      id: '42',
      questionText: 'Question API',
      options: [
        { id: 'promise', text: 'Promise' },
        { id: 'observable', text: 'Observable' },
      ],
    }]);

    expect(questionText).toBe('Question API');
  });

  it('URL-encodes theme identifiers and represents an empty quiz correctly', () => {
    let questionsCount = -1;
    service.getQuestions('theme/unknown').subscribe((questions) => questionsCount = questions.length);

    const request = httpTesting.expectOne('/api/quiz/themes/theme%2Funknown/questions');
    request.flush([]);
    expect(questionsCount).toBe(0);
  });

  it('rejects malformed or duplicate themes', () => {
    expect(() => parseQuizThemes({ themes: [] })).toThrow('expected an array');
    expect(() => parseQuizThemes([{ id: 'java', name: 'Java' }]))
      .toThrow('id, name, and category are required');
    expect(() => parseQuizThemes([
      { id: 'java', name: 'Java', category: 'Development' },
      { id: 'java', name: 'Java copy', category: 'Development' },
    ])).toThrow('duplicate id');
  });

  it('rejects malformed questions without requiring or accepting a correct answer', () => {
    expect(() => parseQuizQuestions({ questions: [] })).toThrow('expected an array');
    expect(() => parseQuizQuestions([{
      id: 'invalid',
      questionText: 'Question',
      options: [{ id: 'only', text: 'Only one choice' }],
  }])).toThrow('required fields or answer choices are missing');
  });
});
