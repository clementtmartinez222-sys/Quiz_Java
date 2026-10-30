import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timeout } from 'rxjs';
import { API_REQUEST_TIMEOUT_MS } from '../../services/api-config';
import { QuizQuestion, QuizQuestionsService, QuizTheme } from '../../services/quiz-questions';
import { QuizResultsService } from '../../services/quiz-results';

export interface QuizThemeGroup {
  category: string;
  themes: Array<QuizTheme & { hue: number }>;
}

export function groupQuizThemes(themes: QuizTheme[]): QuizThemeGroup[] {
  const themeCount = themes.length;
  const groups = new Map<string, Array<QuizTheme & { hue: number }>>();

  themes.forEach((theme, index) => {
    const category = theme.category.trim();
    const groupThemes = groups.get(category) ?? [];
    groupThemes.push({
      ...theme,
      hue: Math.round((index * 360) / themeCount),
    });
    groups.set(category, groupThemes);
  });

  return Array.from(groups, ([category, groupedThemes]) => ({ category, themes: groupedThemes }))
    .sort((first, second) => first.category.localeCompare(second.category, 'fr'));
}

@Component({
  selector: 'app-quizz-solo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quizz-solo.html',
  styleUrl: './quizz-solo.css',
})
export class QuizzSolo implements OnInit, OnDestroy {
  private readonly quizQuestions = inject(QuizQuestionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly quizResults = inject(QuizResultsService);
  private readonly requestTimeoutMs = inject(API_REQUEST_TIMEOUT_MS);
  private readonly ngZone = inject(NgZone);
  private readonly changeDetector = inject(ChangeDetectorRef);

  step: 'theme' | 'loading' | 'playing' | 'grading' | 'result' | 'empty' | 'error' = 'theme';
  themeGroups: QuizThemeGroup[] = [];
  themeLoading = true;
  themeLoadError = false;

  selectedTheme: string | null = null;
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;

  score = 0;
  currentStreak = 0;
  maxStreak = 0;
  responseTimes: number[] = [];
  averageResponseTimeSeconds = 0;
  resultSubmissionStatus: 'idle' | 'saving' | 'saved' | 'failed' = 'idle';
  loadErrorMessage = '';

  readonly QUESTION_TIME = 10;
  readonly ANSWER_REVEAL_TIME = 1.5;
  timeLeft = this.QUESTION_TIME;
  timerProgressPercent = 100;
  private timerInterval: ReturnType<typeof setInterval> | undefined;
  private revealTimeout: ReturnType<typeof setTimeout> | undefined;
  private questionLoadSubscription: Subscription | undefined;
  private themeLoadSubscription: Subscription | undefined;
  private questionStartTime = 0;
  private questionDeadline = 0;
  private quizRunGeneration = 0;
  isAnsweredOrTimeout = false;
  selectedOptionId: string | null = null;
  private answerSubmissions: Array<{ questionId: string; selectedOptionId: string | null; responseTimeSeconds: number }> = [];
  correctOptionIds: Record<string, string> = {};

  get completedQuestionCount(): number {
    if (this.questions.length === 0) return 0;
    return Math.min(
      this.currentQuestionIndex + (this.isAnsweredOrTimeout ? 1 : 0),
      this.questions.length,
    );
  }

  get progressPercent(): number {
    return this.questions.length > 0
      ? (this.completedQuestionCount / this.questions.length) * 100
      : 0;
  }

  get currentQuestion(): QuizQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get isResultPersisted(): boolean { return this.quizResults.isSubmissionEnabled; }
  get submittedAnswers(): Array<{ questionId: string; selectedOptionId: string | null; responseTimeSeconds: number }> {
    return this.answerSubmissions;
  }

  ngOnInit(): void {
    this.loadThemes();
  }

  loadThemes(): void {
    this.themeLoading = true;
    this.themeLoadError = false;
    this.themeLoadSubscription?.unsubscribe();
    this.themeLoadSubscription = this.quizQuestions.getThemes().pipe(
      timeout({ first: this.requestTimeoutMs }),
    ).subscribe({
      next: (themes) => {
        this.themeGroups = groupQuizThemes(themes);
        this.themeLoading = false;
        const requestedTheme = this.route.snapshot.queryParamMap.get('theme');
        if (requestedTheme && themes.some(theme => theme.id === requestedTheme)) {
          this.selectTheme(requestedTheme);
        }
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Erreur lors du chargement des thèmes du quiz', error);
        this.themeLoading = false;
        this.themeLoadError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  selectTheme(themeId: string): void {
    this.resetQuiz();
    this.selectedTheme = themeId;
    this.step = 'loading';

    this.questionLoadSubscription = this.quizQuestions.getQuestions(themeId).pipe(
      timeout({ first: this.requestTimeoutMs }),
    ).subscribe({
      next: (questions) => {
        this.questions = questions;
        if (this.questions.length === 0) {
          this.step = 'empty';
          this.changeDetector.markForCheck();
          return;
        }

        this.step = 'playing';
        this.startQuestion();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Erreur lors du chargement des questions du quiz', error);
        this.loadErrorMessage = 'Impossible de charger les questions. Réessayez plus tard.';
        this.step = 'error';
        this.changeDetector.markForCheck();
      },
    });
  }

  private startQuestion(): void {
    this.timeLeft = this.QUESTION_TIME;
    this.timerProgressPercent = 100;
    this.isAnsweredOrTimeout = false;
    this.selectedOptionId = null;
    this.questionStartTime = performance.now();
    this.questionDeadline = this.questionStartTime + this.QUESTION_TIME * 1000;
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => this.updateTimer());
    }, 100);
  }

  private updateTimer(): void {
    if (this.isAnsweredOrTimeout || this.step !== 'playing') return;

    const remainingMs = Math.max(0, this.questionDeadline - performance.now());
    this.timeLeft = Math.ceil(remainingMs / 1000);
    this.timerProgressPercent = (remainingMs / (this.QUESTION_TIME * 1000)) * 100;

    if (remainingMs === 0) {
      this.handleTimeout();
    }

    this.changeDetector.markForCheck();
  }

  handleTimeout(): void {
    if (this.isAnsweredOrTimeout || this.step !== 'playing') return;
    this.finishQuestion(null, this.QUESTION_TIME);
  }

  answerQuestion(optionId: string): void {
    if (this.isAnsweredOrTimeout || this.step !== 'playing') return;

    const currentQuestion = this.currentQuestion;
    if (!currentQuestion || !currentQuestion.options.some((option) => option.id === optionId)) return;

    if (performance.now() >= this.questionDeadline) {
      this.handleTimeout();
      return;
    }

    const duration = Math.min(
      (performance.now() - this.questionStartTime) / 1000,
      this.QUESTION_TIME,
    );
    this.finishQuestion(optionId, duration);
  }

  private finishQuestion(optionId: string | null, duration: number): void {
    if (this.isAnsweredOrTimeout || this.step !== 'playing' || !this.currentQuestion) return;

    this.isAnsweredOrTimeout = true;
    this.selectedOptionId = optionId;
    this.timerProgressPercent = Math.max(
      0,
      ((this.questionDeadline - performance.now()) / (this.QUESTION_TIME * 1000)) * 100,
    );
    this.stopTimer();
    this.responseTimes.push(duration);

    this.answerSubmissions.push({
      questionId: this.currentQuestion.id,
      selectedOptionId: optionId,
      responseTimeSeconds: Math.max(0, Math.min(duration, this.QUESTION_TIME)),
    });

    this.revealTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.revealTimeout = undefined;
        this.advanceQuestion();
        this.changeDetector.markForCheck();
      });
    }, this.ANSWER_REVEAL_TIME * 1000);
  }

  private advanceQuestion(): void {
    this.stopTimer();

    if (this.currentQuestionIndex >= this.questions.length - 1) {
      this.endQuiz();
      return;
    }

    this.currentQuestionIndex++;
    this.startQuestion();
  }

  private endQuiz(): void {
    this.stopTimer();
    this.stopRevealTimeout();
    this.step = 'grading';

    if (this.selectedTheme !== null) {
      const resultGeneration = this.quizRunGeneration;
      this.resultSubmissionStatus = 'saving';
      this.quizResults.gradeAndSubmit({
        themeId: this.selectedTheme,
        answers: this.answerSubmissions,
      }).pipe(
        timeout({ first: this.requestTimeoutMs }),
      ).subscribe({
        next: (result) => {
          if (this.quizRunGeneration === resultGeneration) {
            this.score = result.correctAnswersCount;
            this.maxStreak = result.maxConsecutiveCorrect;
            this.averageResponseTimeSeconds = result.averageResponseTimeSeconds;
            this.correctOptionIds = result.correctOptionIds;
            this.resultSubmissionStatus = 'saved';
            this.step = 'result';
            this.changeDetector.markForCheck();
          }
        },
        error: (error: unknown) => {
          console.error('Erreur lors de l’enregistrement du résultat du quiz', error);
          if (this.quizRunGeneration === resultGeneration) {
            this.resultSubmissionStatus = 'failed';
            this.step = 'result';
            this.changeDetector.markForCheck();
          }
        },
      });
    }
  }

  showThemeSelection(): void {
    this.resetQuiz();
    this.step = 'theme';
  }

  private resetQuiz(): void {
    this.quizRunGeneration++;
    this.stopTimer();
    this.stopRevealTimeout();
    this.questionLoadSubscription?.unsubscribe();
    this.questionLoadSubscription = undefined;
    this.selectedTheme = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.responseTimes = [];
    this.answerSubmissions = [];
    this.correctOptionIds = {};
    this.averageResponseTimeSeconds = 0;
    this.resultSubmissionStatus = 'idle';
    this.loadErrorMessage = '';
    this.timeLeft = this.QUESTION_TIME;
    this.timerProgressPercent = 100;
    this.isAnsweredOrTimeout = false;
    this.selectedOptionId = null;
  }

  private stopTimer(): void {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private stopRevealTimeout(): void {
    if (this.revealTimeout !== undefined) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopRevealTimeout();
    this.questionLoadSubscription?.unsubscribe();
    this.themeLoadSubscription?.unsubscribe();
  }
}
