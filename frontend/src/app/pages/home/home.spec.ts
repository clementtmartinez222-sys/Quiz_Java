import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let authService: { isLoggedIn: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = {
      isLoggedIn: vi.fn(() => false),
      logout: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the anonymous actions when there is no stored session', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Bienvenue');
    expect(fixture.nativeElement.querySelector('a[routerLink="/register"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows the signed-in actions and logs out before navigating to login', () => {
    authService.isLoggedIn.mockReturnValue(true);
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Connecté');
    expect(fixture.nativeElement.querySelector('a[routerLink="/quizz-solo"]')).not.toBeNull();
    fixture.nativeElement.querySelector('button').click();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
