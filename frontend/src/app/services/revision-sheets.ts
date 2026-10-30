import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface RevisionSheet {
  id: number; quizId: string; titre: string; description: string; categorie: string; dureeLecture: number;
  nombreNotions: number; couleur: string; notions: string[];
}

function parseSheets(value: unknown): RevisionSheet[] {
  if (!Array.isArray(value)) throw new Error('Invalid revision sheets response');
  return value.map((item): RevisionSheet => {
    if (typeof item !== 'object' || item === null) throw new Error('Invalid revision sheet');
    const sheet = item as Record<string, unknown>;
    if (typeof sheet['id'] !== 'number' || typeof sheet['quizId'] !== 'string' || typeof sheet['titre'] !== 'string'
      || typeof sheet['description'] !== 'string' || typeof sheet['categorie'] !== 'string'
      || typeof sheet['dureeLecture'] !== 'number' || typeof sheet['couleur'] !== 'string'
      || !Array.isArray(sheet['notions']) || !sheet['notions'].every(notion => typeof notion === 'string')) {
      throw new Error('Invalid revision sheet fields');
    }
    const notions = sheet['notions'] as string[];
    return { id: sheet['id'], quizId: sheet['quizId'], titre: sheet['titre'], description: sheet['description'], categorie: sheet['categorie'],
      dureeLecture: sheet['dureeLecture'], nombreNotions: notions.length, couleur: sheet['couleur'], notions };
  });
}

@Injectable({ providedIn: 'root' })
export class RevisionSheetsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  getSheets(): Observable<RevisionSheet[]> {
    return this.http.get<unknown>(`${this.apiBaseUrl}/sheets`).pipe(map(parseSheets));
  }
}
