import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

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
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getThemes(): Observable<QuizTheme[]> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/quiz/themes`).pipe(
      map(parseQuizThemes),
    );
  }

  getQuestions(themeId: string): Observable<QuizQuestion[]> {
    return this.http.get<unknown>(
      `${this.apiBaseUrl}/quiz/themes/${encodeURIComponent(themeId)}/questions`,
    ).pipe(map(parseQuizQuestions));
  }
}
