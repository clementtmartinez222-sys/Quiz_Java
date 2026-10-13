import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService, LoginCredentials, LoginResponse } from '../../services/auth';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let login: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    login = vi.fn<(credentials: LoginCredentials) => Observable<LoginResponse>>()
      .mockReturnValue(of({ token: 'test-token' }));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('marks empty fields as touched and displays linked validation errors', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.loginForm.controls.username.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);
    expect(fixture.nativeElement.querySelector('#username').getAttribute('aria-describedby'))
      .toBe('username-error');
    expect(fixture.nativeElement.querySelector('#password-error').textContent)
      .toContain('Le mot de passe est requis.');
    expect(login).not.toHaveBeenCalled();
  });

  it('rejects usernames that contain only whitespace', () => {
    component.loginForm.setValue({ username: '   ', password: 'pass1234' });

    expect(component.loginForm.controls.username.hasError('required')).toBe(true);
    expect(component.loginForm.invalid).toBe(true);
  });

  it('does not impose a registration-specific minimum password length at login', () => {
    component.loginForm.setValue({ username: 'alice', password: 'x' });

    expect(component.loginForm.controls.password.valid).toBe(true);
    expect(component.loginForm.valid).toBe(true);
  });

  it('uses a link for navigation back to home', () => {
    expect(fixture.nativeElement.querySelector('a[routerLink="/home"]')?.textContent)
      .toContain("Retour à l'accueil");
  });

  it('highlights registration as a separate secondary action', () => {
    const switchPanel = fixture.nativeElement.querySelector('.auth-switch');
    const registerLink = switchPanel.querySelector('a[routerLink="/register"]');

    expect(switchPanel.textContent).toContain('Pas encore inscrit ?');
    expect(registerLink.textContent).toContain('Créer un compte');
    expect(registerLink.classList).toContain('auth-switch-link');
    expect(fixture.nativeElement.querySelector('.btn-secondary')).toBeNull();
  });

  it('logs in with valid credentials and navigates to home', () => {
    component.loginForm.setValue({ username: '  alice  ', password: 'pass1234' });

    component.onSubmit();

    expect(login).toHaveBeenCalledWith({ username: 'alice', password: 'pass1234' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
    expect(component.isSubmitting).toBe(false);
  });

  it('shows an accessible error after a failed login and clears it on retry', () => {
    login.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })));
    component.loginForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain("Nom d'utilisateur ou mot de passe incorrect.");
    const form = fixture.nativeElement.querySelector('form');
    expect(Array.from(form.children).indexOf(form.querySelector('.feedback-slot')))
      .toBeLessThan(Array.from(form.children).indexOf(form.querySelector('button[type="submit"]')));
    expect(component.isSubmitting).toBe(false);

    component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('keeps the submit button visually unchanged while preventing duplicate requests', () => {
    const pendingLogin = new Subject<LoginResponse>();
    login.mockReturnValue(pendingLogin);
    component.loginForm.setValue({ username: 'alice', password: 'pass1234' });
    component.onSubmit();
    component.onSubmit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(login).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(true);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Se connecter');

    pendingLogin.next({ token: 'test-token' });
    pendingLogin.complete();
    expect(component.isSubmitting).toBe(false);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Se connecter');

  });

  it('stops waiting and displays a backend timeout message if the request never responds', () => {
    vi.useFakeTimers();
    try {
      login.mockReturnValue(NEVER);
      component.loginForm.setValue({ username: 'alice', password: 'pass1234' });

      component.onSubmit();
      expect(component.isSubmitting).toBe(true);

      vi.advanceTimersByTime(environment.apiRequestTimeoutMs);
      fixture.detectChanges(false);

      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toContain('La demande n’a pas abouti');
      expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
        .toContain('La demande n’a pas abouti');
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a connection-specific message for an immediate network error', () => {
    login.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.loginForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage)
      .toBe('Impossible de se connecter. Vérifiez votre connexion et réessayez.');
    expect(component.isSubmitting).toBe(false);
  });
});
