import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  sendMessage(contact: ContactMessage): Observable<string> {
    return this.http.post(`${this.apiBaseUrl}/contact`, contact, { responseType: 'text' });
  }
}
