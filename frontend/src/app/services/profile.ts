import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from './api-config';

export interface ProfileQuizResult {
  theme: string;
  score: string;
  playedAt: string;
}

export interface ProfileStatistics {
  quizzesPlayed: number;
  averageScore: number;
  correctAnswers: number;
  bestStreak: number;
  recentResults: ProfileQuizResult[];
}

export interface ProfileResponse {
  username: string;
  memberSince: string;
  statistics: ProfileStatistics;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function isValidInstant(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

export function parseProfileResponse(value: unknown): ProfileResponse {
  if (!isRecord(value) || !isRecord(value['statistics'])) {
    throw new Error('Invalid profile response: account details and statistics are required.');
  }

  const username = value['username'];
  const memberSince = value['memberSince'];
  const statistics = value['statistics'];
  const recentResults = statistics['recentResults'];
  const averageScore = statistics['averageScore'];

  if (
    typeof username !== 'string'
    || username.trim().length === 0
    || !isValidDate(memberSince)
    || !isNonNegativeInteger(statistics['quizzesPlayed'])
    || typeof averageScore !== 'number'
    || !Number.isFinite(averageScore)
    || averageScore < 0
    || averageScore > 100
    || !isNonNegativeInteger(statistics['correctAnswers'])
    || !isNonNegativeInteger(statistics['bestStreak'])
    || !Array.isArray(recentResults)
  ) {
    throw new Error('Invalid profile response: one or more account statistics are malformed.');
  }

  const parsedRecentResults = recentResults.map((result: unknown): ProfileQuizResult => {
    if (
      !isRecord(result)
      || typeof result['theme'] !== 'string'
      || result['theme'].trim().length === 0
      || typeof result['score'] !== 'string'
      || result['score'].trim().length === 0
      || !isValidInstant(result['playedAt'])
    ) {
      throw new Error('Invalid profile response: a recent quiz result is malformed.');
    }

    return {
      theme: result['theme'],
      score: result['score'],
      playedAt: result['playedAt'],
    };
  });

  return {
    username: username.trim(),
    memberSince,
    statistics: {
      quizzesPlayed: statistics['quizzesPlayed'],
      averageScore,
      correctAnswers: statistics['correctAnswers'],
      bestStreak: statistics['bestStreak'],
      recentResults: parsedRecentResults,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly requestTimeoutMs = inject(API_REQUEST_TIMEOUT_MS);

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/profile`).pipe(
      timeout({ first: this.requestTimeoutMs }),
      map(parseProfileResponse),
    );
  }
}
