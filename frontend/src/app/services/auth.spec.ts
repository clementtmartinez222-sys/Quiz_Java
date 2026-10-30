import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  });

  it('posts typed credentials and stores the returned token', () => {
    service.login({ username: 'alice', password: 'pass1234' }).subscribe();

    const request = httpTesting.expectOne('/api/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'alice', password: 'pass1234' });

    request.flush({ token: ' session-token ' });

    expect(localStorage.getItem('token')).toBe('session-token');
    expect(service.getCurrentUsername()).toBe('alice');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('does not store an invalid login response', () => {
    let receivedError: unknown;
    service.login({ username: 'alice', password: 'pass1234' }).subscribe({
      error: (error: unknown) => receivedError = error,
    });

    httpTesting.expectOne('/api/login').flush({ token: '   ' });

    expect(receivedError).toBeInstanceOf(Error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('posts registration credentials to the registration endpoint', () => {
    service.register({ username: 'alice', password: 'pass1234' }).subscribe();

    const request = httpTesting.expectOne('/api/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'alice', password: 'pass1234' });

    request.flush(null);
  });

  it('removes the token when logging out', () => {
    localStorage.setItem('token', 'session-token');
    localStorage.setItem('username', 'alice');

    service.logout();
    const request = httpTesting.expectOne('/api/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.getCurrentUsername()).toBeNull();
  });
});
