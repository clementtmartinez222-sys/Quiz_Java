import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let authService: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      isLoggedIn: vi.fn(() => false),
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the anonymous actions when there is no stored session', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('culture générale');
    expect(fixture.nativeElement.querySelector('a[routerLink="/quizz-solo"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/fiches"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/login"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/register"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/contact"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows the signed-in home action and keeps account controls on the profile page', () => {
    authService.isLoggedIn.mockReturnValue(true);
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('nouveau défi');
    expect(fixture.nativeElement.querySelector('a[routerLink="/quizz-solo"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/contact"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
