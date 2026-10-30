import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface FriendUser {
  id: number;
  username: string;
  isFriend: boolean;
}

function parseUsers(value: unknown): FriendUser[] {
  if (!Array.isArray(value)) throw new Error('Réponse de la liste des joueurs invalide.');
  return value.map((item: unknown) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error('Un joueur reçu est invalide.');
    }
    const record = item as Record<string, unknown>;
    if (!Number.isSafeInteger(record['id']) || typeof record['username'] !== 'string'
        || typeof record['isFriend'] !== 'boolean') {
      throw new Error('Un joueur reçu est invalide.');
    }
    return { id: record['id'] as number, username: record['username'], isFriend: record['isFriend'] };
  });
}

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listUsers(): Observable<FriendUser[]> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/friends`).pipe(map(parseUsers));
  }

  addFriend(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/friends/${userId}`, null);
  }

  removeFriend(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/friends/${userId}`);
  }
}
