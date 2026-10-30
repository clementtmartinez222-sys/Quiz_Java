import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { parseProfileResponse, ProfileService } from './profile';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('gets the authenticated account and quiz statistics', () => {
    let profile: unknown;
    service.getProfile().subscribe((result) => profile = result);

    const request = httpTesting.expectOne('/api/profile');
    expect(request.request.method).toBe('GET');
    request.flush({
      username: 'alice',
      memberSince: '2026-01-15',
      statistics: {
        quizzesPlayed: 1,
        averageScore: 75,
        correctAnswers: 3,
        bestStreak: 2,
        recentResults: [],
      },
    });

    expect(profile).toMatchObject({ username: 'alice', statistics: { quizzesPlayed: 1 } });
  });

  it('rejects malformed profile responses instead of passing them to the page', () => {
    let receivedError: unknown;
    service.getProfile().subscribe({ error: (error: unknown) => receivedError = error });

    httpTesting.expectOne('/api/profile').flush({
      username: 'alice',
      memberSince: 'not-a-date',
      statistics: {
        quizzesPlayed: 1,
        averageScore: 75,
        correctAnswers: 3,
        bestStreak: 2,
        recentResults: [],
      },
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('rejects malformed recent results', () => {
    expect(() => parseProfileResponse({
      username: 'alice',
      memberSince: '2026-01-15',
      statistics: {
        quizzesPlayed: 1,
        averageScore: 75,
        correctAnswers: 3,
        bestStreak: 2,
        recentResults: [{ theme: 'Java', score: '3 / 4', playedAt: 'invalid' }],
      },
    })).toThrow(/recent quiz result is malformed/);
  });
});
