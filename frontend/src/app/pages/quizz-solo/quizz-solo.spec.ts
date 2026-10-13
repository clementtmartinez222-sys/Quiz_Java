import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, Subject, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizQuestion, QuizQuestionsService, QuizTheme } from '../../services/quiz-questions';
import { QuizResultsService } from '../../services/quiz-results';
import { QuizzSolo } from './quizz-solo';

const JAVA_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1', questionText: 'Question 1',
    options: [
      { id: 'wrong', text: 'Wrong' },
      { id: 'correct', text: 'Correct' },
    ],
    correctOptionId: 'correct',
  },
  {
    id: 'q2', questionText: 'Question 2',
    options: [
      { id: 'wrong', text: 'Wrong' },
      { id: 'correct', text: 'Correct' },
    ],
    correctOptionId: 'correct',
  },
  {
    id: 'q3', questionText: 'Question 3',
    options: [
      { id: 'wrong', text: 'Wrong' },
      { id: 'correct', text: 'Correct' },
    ],
    correctOptionId: 'correct',
  },
];

describe('QuizzSolo', () => {
  let component: QuizzSolo;
  let fixture: ComponentFixture<QuizzSolo>;
  let submitResult: ReturnType<typeof vi.fn>;
  let getThemes: ReturnType<typeof vi.fn>;
  let getQuestions: ReturnType<typeof vi.fn>;

  const answerAt = (index: number): void => {
    const option = component.currentQuestion?.options[index];
    if (option) component.answerQuestion(option.id);
  };

  beforeEach(async () => {
    submitResult = vi.fn(() => of(undefined));
    getThemes = vi.fn(() => of([
      { id: 'java', name: 'Java & Spring Boot', category: 'Développement' },
      { id: 'angular', name: 'Angular & TypeScript', category: 'Développement' },
      { id: 'general', name: 'Culture Générale Web', category: 'Web & culture numérique' },
    ] satisfies QuizTheme[]));
    getQuestions = vi.fn(() => of(JAVA_QUESTIONS));

    await TestBed.configureTestingModule({
      imports: [QuizzSolo],
      providers: [
        provideRouter([]),
        { provide: QuizQuestionsService, useValue: { getThemes, getQuestions } },
        {
          provide: QuizResultsService,
          useValue: { isSubmissionEnabled: true, submitResult },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizzSolo);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('uses the shared back-link styling for the home navigation', () => {
    fixture.detectChanges();

    const homeLink = fixture.nativeElement.querySelector('a[routerLink="/home"]');
    expect(homeLink).not.toBeNull();
    expect(homeLink.classList).toContain('button-link');
    expect(homeLink.classList).toContain('btn-back');
  });

  it('groups themes by category and assigns each a distinct rainbow hue', () => {
    fixture.detectChanges();

    const groups = fixture.nativeElement.querySelectorAll('.theme-group');
    expect(groups).toHaveLength(2);
    expect(groups[0].querySelector('h3').textContent).toContain('Développement');
    expect(groups[1].querySelector('h3').textContent).toContain('Web & culture numérique');

    const themeButtons = Array.from(
      fixture.nativeElement.querySelectorAll('.btn-theme'),
    ) as HTMLButtonElement[];
    const hues = themeButtons.map((button) => button.style.getPropertyValue('--theme-hue'));

    expect(themeButtons.map((button) => button.textContent.trim())).toEqual([
      'Java & Spring Boot',
      'Angular & TypeScript',
      'Culture Générale Web',
    ]);
    expect(hues).toEqual(['0', '120', '240']);
    expect(new Set(hues).size).toBe(themeButtons.length);
  });

  it('regroups and recolors a changing theme list received asynchronously', () => {
    getThemes.mockReturnValue(of([
      { id: 'rust', name: 'Rust', category: 'Développement' },
      { id: 'security', name: 'Sécurité', category: 'Web & culture numérique' },
      { id: 'python', name: 'Python', category: 'Développement' },
      { id: 'sql', name: 'SQL', category: 'Bases de données' },
    ] satisfies QuizTheme[]));

    component.loadThemes();
    fixture.detectChanges();

    const groups = Array.from(
      fixture.nativeElement.querySelectorAll('.theme-group'),
    ) as HTMLElement[];
    expect(groups.map((group) => group.querySelector('h3')?.textContent?.trim() ?? ''))
      .toEqual(['Bases de données', 'Développement', 'Web & culture numérique']);

    const huesByThemeId = new Map(
      (Array.from(fixture.nativeElement.querySelectorAll('.btn-theme')) as HTMLButtonElement[])
        .map((button) => [
          button.textContent?.trim() ?? '',
          button.style.getPropertyValue('--theme-hue'),
        ]),
    );
    expect(huesByThemeId).toEqual(new Map([
      ['SQL', '270'],
      ['Rust', '0'],
      ['Python', '180'],
      ['Sécurité', '90'],
    ]));
  });

  it('shows loading, empty, and retryable error states for the theme list', () => {
    const themesResponse = new Subject<QuizTheme[]>();
    getThemes.mockReturnValue(themesResponse);
    component.loadThemes();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Chargement des thèmes');

    themesResponse.next([]);
    themesResponse.complete();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aucun thème n’est disponible');

    getThemes.mockReturnValue(throwError(() => new Error('offline')));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    component.loadThemes();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Impossible de charger les thèmes');
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Réessayer');
    consoleError.mockRestore();
  });

  it('loads questions for the selected theme from its category', () => {
    fixture.detectChanges();
    const themeButtons = fixture.nativeElement.querySelectorAll('.btn-theme');
    themeButtons[1].click();

    expect(getQuestions).toHaveBeenCalledWith('angular');
    expect(component.step).toBe('playing');
  });

  it('loads the selected theme questions through the questions service', () => {
    component.selectTheme('java');

    expect(getQuestions).toHaveBeenCalledWith('java');
    expect(component.step).toBe('playing');
    expect(component.questions).toHaveLength(3);
  });

  it('calculates the score, best streak, and average response time', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      vi.advanceTimersByTime(2000);
      answerAt(1);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      vi.advanceTimersByTime(3000);
      answerAt(1);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      vi.advanceTimersByTime(1000);
      answerAt(0);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);

      expect(component.step).toBe('result');
      expect(component.score).toBe(2);
      expect(component.maxStreak).toBe(2);
      expect(component.averageResponseTimeSeconds).toBe(2);
      expect(submitResult).toHaveBeenCalledWith({
        themeId: 'java',
        correctAnswersCount: 2,
        maxConsecutiveCorrect: 2,
        averageResponseTimeSeconds: 2,
        totalQuestions: 3,
      });
      expect(component.resultSubmissionStatus).toBe('saved');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a user-facing message if the final result cannot be saved', () => {
    vi.useFakeTimers();
    try {
      submitResult.mockReturnValue(throwError(() => new Error('offline')));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      component.selectTheme('java');
      for (let index = 0; index < JAVA_QUESTIONS.length; index++) {
        answerAt(0);
        vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      }
      fixture.detectChanges();

      expect(component.step).toBe('result');
      expect(component.resultSubmissionStatus).toBe('failed');
      expect(fixture.nativeElement.textContent)
        .toContain("le résultat n'a pas pu être enregistré");
      consoleError.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not let a previous result request overwrite the next quiz status', () => {
    vi.useFakeTimers();
    const firstSubmission = new Subject<void>();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      submitResult
        .mockReturnValueOnce(firstSubmission)
        .mockReturnValueOnce(of(undefined));

      component.selectTheme('java');
      for (let index = 0; index < JAVA_QUESTIONS.length; index++) {
        answerAt(1);
        vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      }
      expect(component.resultSubmissionStatus).toBe('saving');

      component.showThemeSelection();
      component.selectTheme('java');
      for (let index = 0; index < JAVA_QUESTIONS.length; index++) {
        answerAt(1);
        vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      }
      expect(component.resultSubmissionStatus).toBe('saved');

      firstSubmission.error(new Error('stale failure'));
      expect(component.resultSubmissionStatus).toBe('saved');
    } finally {
      consoleError.mockRestore();
      vi.useRealTimers();
    }
  });

  it('breaks the current streak after an incorrect answer', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      answerAt(1);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      answerAt(0);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      answerAt(1);

      expect(component.score).toBe(2);
      expect(component.currentStreak).toBe(1);
      expect(component.maxStreak).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets score and statistics when abandoning and selecting another theme', () => {
    component.selectTheme('java');
    answerAt(1);
    component.showThemeSelection();

    expect(component.score).toBe(0);
    expect(component.responseTimes).toEqual([]);
    expect(component.maxStreak).toBe(0);
    expect(component.questions).toEqual([]);

    component.selectTheme('angular');
    expect(getQuestions).toHaveBeenLastCalledWith('angular');
    expect(component.score).toBe(0);
    expect(component.responseTimes).toEqual([]);
  });

  it('shows a loading state until the question service responds', () => {
    const questionSubject = new Subject<QuizQuestion[]>();
    getQuestions.mockReturnValue(questionSubject as Observable<QuizQuestion[]>);

    component.selectTheme('java');
    expect(component.step).toBe('loading');

    questionSubject.next(JAVA_QUESTIONS);
    expect(component.step).toBe('playing');
    questionSubject.complete();
  });

  it('shows an empty state when the selected theme has no questions', () => {
    getQuestions.mockReturnValue(of([]));
    component.selectTheme('empty-theme');
    fixture.detectChanges();

    expect(component.step).toBe('empty');
    expect(component.progressPercent).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Aucune question disponible');
  });

  it('shows an explicit error state when question loading fails', () => {
    getQuestions.mockReturnValue(throwError(() => new Error('Request failed')));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    component.selectTheme('java');
    fixture.detectChanges();

    expect(component.step).toBe('error');
    expect(fixture.nativeElement.textContent).toContain('Impossible de charger les questions');
    consoleError.mockRestore();
  });

  it('shows an explicit error state when question loading times out', () => {
    vi.useFakeTimers();
    try {
      getQuestions.mockReturnValue(NEVER);
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      component.selectTheme('java');
      vi.advanceTimersByTime(environment.apiRequestTimeoutMs);
      fixture.detectChanges();

      expect(component.step).toBe('error');
      expect(fixture.nativeElement.textContent).toContain('Impossible de charger les questions');
      consoleError.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('counts each timeout as a missed answer and completes the quiz', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      for (let index = 0; index < JAVA_QUESTIONS.length; index++) {
        vi.advanceTimersByTime(component.QUESTION_TIME * 1000);
        vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      }

      expect(component.step).toBe('result');
      expect(component.score).toBe(0);
      expect(component.maxStreak).toBe(0);
      expect(component.averageResponseTimeSeconds).toBe(5);
      expect(component.responseTimes).toEqual([5, 5, 5]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ends the quiz after the final answer, including an incorrect answer', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      answerAt(1);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      answerAt(1);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      answerAt(0);
      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);

      expect(component.currentQuestionIndex).toBe(2);
      expect(component.step).toBe('result');
      expect(component.score).toBe(2);
      expect(submitResult).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('counts completed questions rather than the current question as quiz progress', () => {
    component.selectTheme('java');
    expect(component.completedQuestionCount).toBe(0);
    expect(component.progressPercent).toBe(0);

    answerAt(1);
    expect(component.completedQuestionCount).toBe(1);
    expect(component.progressPercent).toBeCloseTo(100 / 3);
  });

  it('keeps the countdown and timer bar synchronized with the question deadline', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.timer').textContent).toContain('5 secondes');
      expect(Number.parseFloat(fixture.nativeElement.querySelector('.timer-bar').style.width))
        .toBe(100);

      vi.advanceTimersByTime(2500);
      fixture.detectChanges();

      expect(component.timeLeft).toBe(3);
      expect(component.timerProgressPercent).toBeCloseTo(50);
      expect(Number.parseFloat(fixture.nativeElement.querySelector('.timer-bar').style.width))
        .toBeCloseTo(50);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pauses the timer bar during answer reveal and restarts it for the next question', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      fixture.detectChanges();
      vi.advanceTimersByTime(2500);
      answerAt(0);
      fixture.detectChanges();

      expect(Number.parseFloat(fixture.nativeElement.querySelector('.timer-bar').style.width))
        .toBeLessThan(100);
      expect(fixture.nativeElement.textContent).toContain('Mauvaise réponse');
      expect(component.currentQuestionIndex).toBe(0);

      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      fixture.detectChanges();

      expect(component.currentQuestionIndex).toBe(1);
      expect(component.timeLeft).toBe(5);
      expect(Number.parseFloat(fixture.nativeElement.querySelector('.timer-bar').style.width))
        .toBe(100);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows correct and incorrect choices during the answer reveal', () => {
    vi.useFakeTimers();
    try {
      component.selectTheme('java');
      fixture.detectChanges();
      answerAt(0);
      fixture.changeDetectorRef.detectChanges();

      const options = fixture.nativeElement.querySelectorAll('.btn-option');
      expect(options[1].classList).toContain('correct');
      expect(options[0].classList).toContain('incorrect');
      expect(options[0].disabled).toBe(true);
      expect(fixture.nativeElement.textContent).toContain('Mauvaise réponse');

      vi.advanceTimersByTime(component.ANSWER_REVEAL_TIME * 1000);
      fixture.detectChanges();
      expect(component.currentQuestionIndex).toBe(1);
      expect(component.isAnsweredOrTimeout).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
