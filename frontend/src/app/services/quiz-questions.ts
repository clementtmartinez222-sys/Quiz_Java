import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface QuizTheme {
  id: string;
  name: string;
  category: string;
}

const LOCAL_THEMES: QuizTheme[] = [
  { id: 'java', name: 'Java & Spring Boot', category: 'Développement' },
  { id: 'angular', name: 'Angular & TypeScript', category: 'Développement' },
  { id: 'general', name: 'Culture Générale Web', category: 'Web & culture numérique' },
];

const LOCAL_QUESTIONS_BY_THEME: Record<string, QuizQuestion[]> = {
  java: [
    {
      id: 'java-1',
      questionText: 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?',
      options: [
        { id: 'static', text: 'static' },
        { id: 'abstract', text: 'abstract' },
        { id: 'final', text: 'final' },
        { id: 'private', text: 'private' },
      ],
      correctOptionId: 'abstract',
    },
    {
      id: 'java-2',
      questionText: 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?',
      options: [
        { id: 'autowired', text: '@Autowired' },
        { id: 'entity', text: '@Entity' },
        { id: 'request-mapping', text: '@RequestMapping' },
        { id: 'bean', text: '@Bean' },
      ],
      correctOptionId: 'request-mapping',
    },
    {
      id: 'java-3',
      questionText: 'Quelle collection garantit l’unicité de ses éléments ?',
      options: [
        { id: 'list', text: 'List' },
        { id: 'set', text: 'Set' },
        { id: 'queue', text: 'Queue' },
        { id: 'array-list', text: 'ArrayList' },
      ],
      correctOptionId: 'set',
    },
  ],
  angular: [
    {
      id: 'angular-1',
      questionText: 'Quelle propriété indique qu’un composant Angular est autonome ?',
      options: [
        { id: 'standalone-decorator', text: '@Standalone(true)' },
        { id: 'standalone-component', text: 'standalone: true dans @Component' },
        { id: 'injectable', text: '@Injectable(true)' },
        { id: 'automatic', text: 'C’est automatique' },
      ],
      correctOptionId: 'standalone-component',
    },
    {
      id: 'angular-2',
      questionText: 'Quelle directive permet de parcourir une liste dans un template Angular récent ?',
      options: [
        { id: 'for', text: '@for' },
        { id: 'each', text: '@each' },
        { id: 'ng-repeat', text: '*ng-repeat' },
        { id: 'loop', text: '@loop' },
      ],
      correctOptionId: 'for',
    },
    {
      id: 'angular-3',
      questionText: 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?',
      options: [
        { id: 'promise', text: 'Promise' },
        { id: 'observable', text: 'Observable' },
        { id: 'iterable', text: 'Iterable' },
        { id: 'generator-function', text: 'GeneratorFunction' },
      ],
      correctOptionId: 'observable',
    },
  ],
  general: [
    {
      id: 'general-1',
      questionText: 'Quel protocole sécurise les échanges web avec TLS ?',
      options: [
        { id: 'http', text: 'HTTP' },
        { id: 'https', text: 'HTTPS' },
        { id: 'ftp', text: 'FTP' },
        { id: 'smtp', text: 'SMTP' },
      ],
      correctOptionId: 'https',
    },
    {
      id: 'general-2',
      questionText: 'Quel code HTTP indique généralement une ressource introuvable ?',
      options: [
        { id: '200', text: '200' },
        { id: '301', text: '301' },
        { id: '404', text: '404' },
        { id: '500', text: '500' },
      ],
      correctOptionId: '404',
    },
    {
      id: 'general-3',
      questionText: 'Quel format est couramment utilisé pour échanger des données avec une API web ?',
      options: [
        { id: 'json', text: 'JSON' },
        { id: 'mp3', text: 'MP3' },
        { id: 'png', text: 'PNG' },
        { id: 'zip', text: 'ZIP' },
      ],
      correctOptionId: 'json',
    },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseQuizThemes(value: unknown): QuizTheme[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid quiz themes response: expected an array.');
  }

  const themeIds = new Set<string>();
  return value.map((item: unknown): QuizTheme => {
    if (!isRecord(item)) {
      throw new Error('Invalid quiz theme: id, name, and category are required.');
    }

    const id = typeof item['id'] === 'string' ? item['id'].trim() : '';
    const name = typeof item['name'] === 'string' ? item['name'].trim() : '';
    const category = typeof item['category'] === 'string' ? item['category'].trim() : '';
    if (
      id.length === 0
      || name.length === 0
      || category.length === 0
    ) {
      throw new Error('Invalid quiz theme: id, name, and category are required.');
    }
    if (themeIds.has(id)) {
      throw new Error(`Invalid quiz themes response: duplicate id "${id}".`);
    }

    themeIds.add(id);
    return { id, name, category };
  });
}

export function parseQuizQuestions(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid quiz questions response: expected an array.');
  }

  const questionIds = new Set<string>();
  return value.map((item: unknown): QuizQuestion => {
    if (!isRecord(item)) {
      throw new Error('Invalid quiz question: required fields or answer choices are missing.');
    }

    const id = typeof item['id'] === 'string' ? item['id'].trim() : '';
    const questionText = typeof item['questionText'] === 'string'
      ? item['questionText'].trim()
      : '';
    const correctOptionId = typeof item['correctOptionId'] === 'string'
      ? item['correctOptionId'].trim()
      : '';
    const rawOptions = item['options'];
    if (
      id.length === 0
      || questionText.length === 0
      || correctOptionId.length === 0
      || !Array.isArray(rawOptions)
      || rawOptions.length < 2
    ) {
      throw new Error('Invalid quiz question: required fields or answer choices are missing.');
    }

    if (questionIds.has(id)) {
      throw new Error(`Invalid quiz question: duplicate id "${id}".`);
    }
    questionIds.add(id);

    const optionIds = new Set<string>();
    const options = rawOptions.map((option: unknown): QuizOption => {
      if (!isRecord(option)) {
        throw new Error(`Invalid quiz question "${id}": an answer choice is malformed.`);
      }
      const optionId = typeof option['id'] === 'string' ? option['id'].trim() : '';
      const optionText = typeof option['text'] === 'string' ? option['text'].trim() : '';
      if (
        optionId.length === 0
        || optionText.length === 0
      ) {
        throw new Error(`Invalid quiz question "${id}": an answer choice is malformed.`);
      }
      if (optionIds.has(optionId)) {
        throw new Error(`Invalid quiz question "${id}": duplicate answer choice id.`);
      }
      optionIds.add(optionId);
      return { id: optionId, text: optionText };
    });

    if (!optionIds.has(correctOptionId)) {
      throw new Error(`Invalid quiz question "${id}": correct answer is not an available choice.`);
    }

    return {
      id,
      questionText,
      options,
      correctOptionId,
    };
  });
}

@Injectable({ providedIn: 'root' })
export class QuizQuestionsService {
  getThemes(): Observable<QuizTheme[]> {
    return of(parseQuizThemes(LOCAL_THEMES));
  }

  getQuestions(themeId: string): Observable<QuizQuestion[]> {
    const questions = Object.prototype.hasOwnProperty.call(LOCAL_QUESTIONS_BY_THEME, themeId)
      ? LOCAL_QUESTIONS_BY_THEME[themeId]
      : [];
    return of(parseQuizQuestions(questions));
  }
}
