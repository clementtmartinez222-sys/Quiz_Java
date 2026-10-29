import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { environment } from '../../../environments/environment';

import { Profil } from './profil';

describe('Profil', () => {
  let component: Profil;
  let fixture: ComponentFixture<Profil>;
  let authService: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    getCurrentUsername: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  const profileService = {
    getProfile: vi.fn(() => of({
      username: 'alice',
      memberSince: '2026-01-15',
      statistics: {
        quizzesPlayed: 2,
        averageScore: 75,
        correctAnswers: 6,
        bestStreak: 3,
        recentResults: [{ theme: 'Java & Spring Boot', score: '3 / 4', playedAt: '2026-01-20T12:00:00Z' }],
      },
    })),
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      isLoggedIn: vi.fn(() => false),
      getCurrentUsername: vi.fn(() => null),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Profil],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ProfileService, useValue: profileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profil);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides links to sign in and create an account when logged out', () => {
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('.profile-actions a');

    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('/login');
    expect(links[0].textContent.trim()).toBe('Se connecter');
    expect(links[1].getAttribute('href')).toBe('/register');
    expect(links[1].textContent.trim()).toBe('Créer un compte');
    expect(fixture.nativeElement.querySelector('.profile-statistics')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('loads personal details and real statistics when logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.getCurrentUsername.mockReturnValue('alice');
    fixture = TestBed.createComponent(Profil);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#profile-title').textContent).toBe('Mon profil');
    expect(fixture.nativeElement.textContent).toContain('Bienvenue, alice.');
    expect(fixture.nativeElement.querySelector('.profile-statistics h2').textContent)
      .toBe('Statistiques personnelles');
    expect(profileService.getProfile).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Java & Spring Boot');
    expect(fixture.nativeElement.textContent).toContain('75 %');
    expect(fixture.nativeElement.querySelector('a[routerLink="/login"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/register"]')).toBeNull();
  });

  it('logs out and navigates to the login page', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.getCurrentUsername.mockReturnValue('alice');
    fixture = TestBed.createComponent(Profil);
    component = fixture.componentInstance;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(component.isLoggedIn).toBe(false);
    expect(component.username).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('shows sample profile data only when the development preview query is enabled', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Profil],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ preview: 'connected' }) } },
        },
      ],
    });

    fixture = TestBed.createComponent(Profil);
    component = fixture.componentInstance;
    fixture.detectChanges();

    if (environment.production) {
      expect(component.isDemoPreview).toBe(false);
      expect(fixture.nativeElement.textContent).not.toContain('Camille Martin');
      return;
    }

    expect(component.isDemoPreview).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Camille Martin');
    expect(fixture.nativeElement.textContent).toContain('camille.martin@example.fr');
    expect(fixture.nativeElement.textContent).toContain('78 %');
    expect(fixture.nativeElement.textContent).toContain('Sciences');
    expect(fixture.nativeElement.querySelector('.profile-demo-badge')).toBeNull();
    expect(fixture.nativeElement.querySelector('.profile-button-danger').textContent.trim())
      .toBe('Se déconnecter');
  });

  it('does not clear a real session when leaving the demo preview', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Profil],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ preview: 'connected' }) } },
        },
      ],
    });

    fixture = TestBed.createComponent(Profil);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/profil']);
    expect(component.isDemoPreview).toBe(false);
    expect(component.isLoggedIn).toBe(false);
    expect(component.username).toBeNull();
    expect(component.email).toBeNull();
    expect(component.memberSince).toBeNull();
    expect(component.statistics).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Connectez-vous ou créez un compte');
    expect(fixture.nativeElement.textContent).not.toContain('Camille Martin');
  });
});
