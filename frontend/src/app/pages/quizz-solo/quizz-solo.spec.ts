import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QuizQuestion, QuizQuestionsService } from '../../services/quiz-questions';
import { QuizResultsService } from '../../services/quiz-results';
import { QuizzSolo } from './quizz-solo';

const QUESTIONS: QuizQuestion[] = [1, 2].map(index => ({ id: `q${index}`, questionText: `Question ${index}`,
  options: [{ id: 'wrong', text: 'Incorrecte' }, { id: 'right', text: 'Correcte' }] }));
const GRADE = { correctAnswersCount: 1, maxConsecutiveCorrect: 1, averageResponseTimeSeconds: 2,
  totalQuestions: 2, correctOptionIds: { q1: 'right', q2: 'right' } };

describe('QuizzSolo', () => {
  let fixture: ComponentFixture<QuizzSolo>;
  let component: QuizzSolo;
  let gradeAndSubmit: ReturnType<typeof vi.fn>;
  const selectAndAnswer = () => {
    component.selectTheme('test');
    component.answerQuestion('wrong');
    vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
    component.answerQuestion('right');
    vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
  };

  beforeEach(async () => {
    gradeAndSubmit = vi.fn(() => of(GRADE));
    await TestBed.configureTestingModule({ imports: [QuizzSolo], providers: [provideRouter([]),
      { provide: QuizQuestionsService, useValue: { getThemes: () => of([{ id: 'test', name: 'Test', category: 'Culture' }]), getQuestions: () => of(QUESTIONS) } },
      { provide: QuizResultsService, useValue: { isSubmissionEnabled: true, gradeAndSubmit } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(QuizzSolo);
    component = fixture.componentInstance;
  });

  it('loads themes and questions, without exposing correct answers in the questions API model', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn-theme').textContent).toContain('Test');
    component.selectTheme('test');
    expect(component.step).toBe('playing');
    expect(component.currentQuestion?.options).toHaveLength(2);
  });

  it('uses a ten second timer for every question', () => {
    component.selectTheme('test');
    expect(component.QUESTION_TIME).toBe(10);
    expect(component.timeLeft).toBe(10);
  });

  it('sends answers for server grading and displays the server result', () => {
    vi.useFakeTimers();
    try {
      selectAndAnswer();
      expect(gradeAndSubmit).toHaveBeenCalledWith({ themeId: 'test', answers: [
        expect.objectContaining({ questionId: 'q1', selectedOptionId: 'wrong' }),
        expect.objectContaining({ questionId: 'q2', selectedOptionId: 'right' }),
      ] });
      expect(component.score).toBe(1);
      expect(component.maxStreak).toBe(1);
      expect(component.correctOptionIds).toEqual(GRADE.correctOptionIds);
      expect(component.step).toBe('result');
    } finally { vi.useRealTimers(); }
  });

  it('does not reveal correctness while the user is answering', () => {
    component.selectTheme('test');
    component.answerQuestion('wrong');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Bonne réponse');
    expect(fixture.nativeElement.textContent).not.toContain('Mauvaise réponse');
    expect(fixture.nativeElement.querySelector('.btn-option.selected')).not.toBeNull();
  });

  it('fails closed when the grading endpoint is unavailable', () => {
    vi.useFakeTimers();
    try {
      gradeAndSubmit.mockReturnValue(throwError(() => new Error('offline')));
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      selectAndAnswer();
      expect(component.resultSubmissionStatus).toBe('failed');
      expect(component.score).toBe(0);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Le serveur n’a pas pu corriger');
    } finally { vi.useRealTimers(); }
  });
});
