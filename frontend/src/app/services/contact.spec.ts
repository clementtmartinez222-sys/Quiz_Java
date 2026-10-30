import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact';
import { HttpErrorResponse } from '@angular/common/http';

describe('ContactService', () => {
  let service: ContactService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('posts the contact message and expects a text response', () => {
    const message = {
      name: 'Alice',
      email: 'alice@example.com',
      message: 'A sufficiently long message.',
    };
    let response: string | undefined;

    service.sendMessage(message).subscribe((result) => response = result);

    const request = httpTesting.expectOne('/api/contact');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(message);
    expect(request.request.responseType).toBe('text');
    request.flush('sent');

    expect(response).toBe('sent');
  });

  it('passes HTTP errors to the caller', () => {
    let receivedError: unknown;
    service.sendMessage({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'A sufficiently long message.',
    }).subscribe({ error: (error: unknown) => receivedError = error });

    httpTesting.expectOne('/api/contact')
      .flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });

    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
    expect((receivedError as HttpErrorResponse).status).toBe(503);
  });
});
