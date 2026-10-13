import { TestBed } from '@angular/core/testing';
import {
  parseQuizQuestions,
  parseQuizThemes,
  QuizQuestion,
  QuizQuestionsService,
} from './quiz-questions';

describe('QuizQuestionsService', () => {
  let service: QuizQuestionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizQuestionsService);
  });

  it('returns the questions for the requested theme', () => {
    let javaQuestionText = '';
    let angularQuestionText = '';
    service.getQuestions('java').subscribe((questions) => {
      javaQuestionText = questions[0].questionText;
    });
    service.getQuestions('angular').subscribe((questions) => {
      angularQuestionText = questions[0].questionText;
    });

    expect(javaQuestionText).not.toBe(angularQuestionText);
  });

  it('provides categorized themes through an observable', () => {
    let themes: ReturnType<typeof parseQuizThemes> = [];
    service.getThemes().subscribe((result) => themes = result);

    expect(themes).toEqual([
      { id: 'java', name: 'Java & Spring Boot', category: 'Développement' },
      { id: 'angular', name: 'Angular & TypeScript', category: 'Développement' },
      { id: 'general', name: 'Culture Générale Web', category: 'Web & culture numérique' },
    ]);
  });

  it('validates incoming themes and requires a category for grouping', () => {
    expect(() => parseQuizThemes({ themes: [] })).toThrow('expected an array');
    expect(() => parseQuizThemes([{ id: 'java', name: 'Java' }]))
      .toThrow('id, name, and category are required');
    expect(() => parseQuizThemes([
      { id: 'java', name: 'Java', category: 'Development' },
      { id: 'java', name: 'Java copy', category: 'Development' },
    ])).toThrow('duplicate id');
  });

  it('trims theme and question fields before comparing identifiers', () => {
    expect(parseQuizThemes([
      { id: ' java ', name: ' Java ', category: ' Development ' },
    ])).toEqual([{ id: 'java', name: 'Java', category: 'Development' }]);
    expect(() => parseQuizThemes([
      { id: 'java', name: 'Java', category: 'Development' },
      { id: ' java ', name: 'Java copy', category: 'Development' },
    ])).toThrow('duplicate id');
    expect(parseQuizQuestions([{
      id: ' question ',
      questionText: ' Question text ',
      correctOptionId: ' answer ',
      options: [
        { id: ' answer ', text: ' Answer ' },
        { id: ' wrong ', text: ' Wrong ' },
      ],
    }])).toEqual([{
      id: 'question',
      questionText: 'Question text',
      correctOptionId: 'answer',
      options: [
        { id: 'answer', text: 'Answer' },
        { id: 'wrong', text: 'Wrong' },
      ],
    }]);
  });

  it('links the correct answer by option id rather than list position', () => {
    let correctOptionId = '';
    let optionIds: string[] = [];
    service.getQuestions('java').subscribe((questions) => {
      correctOptionId = questions[0].correctOptionId;
      optionIds = questions[0].options.map((option) => option.id);
    });

    expect(optionIds).toContain(correctOptionId);
    expect(correctOptionId).toBe('abstract');
  });

  it('returns no questions for an unknown theme', () => {
    let questionsCount = -1;
    service.getQuestions('unknown').subscribe((questions) => {
      questionsCount = questions.length;
    });

    expect(questionsCount).toBe(0);
  });

  it('treats inherited object properties as unknown themes', () => {
    let questionsCount = -1;
    service.getQuestions('toString').subscribe((questions) => {
      questionsCount = questions.length;
    });

    expect(questionsCount).toBe(0);
  });

  it('keeps question and option identifiers unique and every correct option valid', () => {
    for (const themeId of ['java', 'angular', 'general']) {
      let questions: QuizQuestion[] = [];
      service.getQuestions(themeId).subscribe((result) => questions = result);

      const questionIds = questions.map((question) => question.id);
      expect(new Set(questionIds).size).toBe(questionIds.length);

      for (const question of questions) {
        const optionIds = question.options.map((option) => option.id);
        expect(new Set(optionIds).size).toBe(optionIds.length);
        expect(optionIds).toContain(question.correctOptionId);
      }
    }
  });

  it('returns independent question and option objects for each request', () => {
    let firstQuestion: string | undefined;
    service.getQuestions('java').subscribe((questions) => {
      questions[0].options[0].text = 'changed';
    });
    service.getQuestions('java').subscribe((questions) => {
      firstQuestion = questions[0].options[0].text;
    });

    expect(firstQuestion).toBe('static');
  });

  it('rejects malformed question data before it reaches the quiz page', () => {
    expect(() => parseQuizQuestions({
      questions: [],
    })).toThrow('expected an array');
    expect(() => parseQuizQuestions([{
      id: 'invalid',
      questionText: 'Question',
      options: [{ id: 'only', text: 'Only one choice' }],
      correctOptionId: 'only',
    }])).toThrow('required fields or answer choices are missing');
    expect(() => parseQuizQuestions([{
      id: 'invalid',
      questionText: 'Question',
      options: [
        { id: 'one', text: 'One' },
        { id: 'two', text: 'Two' },
      ],
      correctOptionId: 'missing',
    }])).toThrow('correct answer is not an available choice');
  });
});
