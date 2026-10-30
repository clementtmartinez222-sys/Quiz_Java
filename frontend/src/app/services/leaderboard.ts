import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface LeaderboardPlayer {
  id: number;
  username: string;
  quizzesPlayed: number;
  averageScore: number;
  correctAnswers: number;
}

function parseLeaderboard(value: unknown): LeaderboardPlayer[] {
  if (!Array.isArray(value)) throw new Error('Réponse du classement invalide.');
  return value.map((item: unknown) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error('Un joueur reçu est invalide.');
    }
    const player = item as Record<string, unknown>;
    if (!Number.isSafeInteger(player['id']) || typeof player['username'] !== 'string'
        || !Number.isInteger(player['quizzesPlayed']) || (player['quizzesPlayed'] as number) < 0
        || typeof player['averageScore'] !== 'number' || player['averageScore'] < 0 || player['averageScore'] > 100
        || !Number.isInteger(player['correctAnswers']) || (player['correctAnswers'] as number) < 0) {
      throw new Error('Un joueur reçu est invalide.');
    }
    return {
      id: player['id'] as number,
      username: player['username'],
      quizzesPlayed: player['quizzesPlayed'] as number,
      averageScore: player['averageScore'],
      correctAnswers: player['correctAnswers'] as number,
    };
  });
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getPlayers(): Observable<LeaderboardPlayer[]> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/leaderboard`).pipe(map(parseLeaderboard));
  }
}
