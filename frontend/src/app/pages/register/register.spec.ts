import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, LoginResponse, RegisterCredentials } from '../../services/auth';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let register: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    register = vi
      .fn<(credentials: RegisterCredentials) => Observable<LoginResponse>>()
      .mockReturnValue(of({ token: 'session-token' }));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('marks invalid fields as touched and displays accessible validation errors', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.registerForm.controls.username.touched).toBe(true);
    expect(component.registerForm.controls.password.touched).toBe(true);
    expect(fixture.nativeElement.querySelector('#username').getAttribute('aria-describedby')).toBe(
      'username-error',
    );
    expect(fixture.nativeElement.querySelector('#password-error').textContent).toContain(
      'Le mot de passe est requis.',
    );
    expect(register).not.toHaveBeenCalled();
  });

  it('groups the submit and home actions in the shared auth button layout', () => {
    const actions = fixture.nativeElement.querySelector('.auth-form-actions');

    expect(actions.querySelectorAll('button, a')).toHaveLength(2);
    expect(actions.querySelector('button[type="submit"]')?.textContent).toContain("S'inscrire");
    expect(actions.querySelector('a[routerLink="/home"]')?.textContent).toContain(
      "Retour à l'accueil",
    );
    expect(fixture.nativeElement.querySelector('.auth-server-feedback')).not.toBeNull();
  });

  it('rejects usernames that contain only whitespace', () => {
    component.registerForm.setValue({ username: '   ', password: 'pass1234' });

    expect(component.registerForm.controls.username.hasError('required')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
  });

  it('rejects passwords that exceed the backend UTF-8 byte limit', () => {
    component.registerForm.setValue({ username: 'alice', password: '🔐'.repeat(20) });

    expect(component.registerForm.controls.password.hasError('maxUtf8Bytes')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
  });

  it('submits valid credentials and redirects the new authenticated user home', () => {
    component.registerForm.setValue({ username: '  alice  ', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(register).toHaveBeenCalledWith({ username: 'alice', password: 'pass1234' });
    expect(component.registrationComplete).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('tu es connecté');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/home']);
    expect(fixture.nativeElement.querySelector('a[routerLink="/profil"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/login"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/home"]')?.textContent).toContain(
      "Retour à l'accueil",
    );
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
  });

  it('highlights the login link as a separate secondary action', () => {
    const switchPanel = fixture.nativeElement.querySelector('.auth-switch');
    const loginLink = switchPanel.querySelector('a[routerLink="/login"]');

    expect(switchPanel.textContent).toContain('Déjà un compte ?');
    expect(loginLink.textContent).toContain('Se connecter');
    expect(loginLink.classList).toContain('auth-switch-link');
    expect(fixture.nativeElement.querySelector('.btn-secondary')).toBeNull();
  });

  it('shows a specific message when the username is already taken', () => {
    register.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.registerForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      "Ce nom d'utilisateur est déjà utilisé",
    );
    const form = fixture.nativeElement.querySelector('form');
    const children = Array.from(form.children);
    expect(children.indexOf(form.querySelector('.auth-server-feedback'))).toBeLessThan(
      children.indexOf(form.querySelector('.auth-form-actions')),
    );
    const containerChildren = Array.from(
      fixture.nativeElement.querySelector('.auth-page-container').children,
    );
    expect(containerChildren.indexOf(form)).toBeLessThan(
      containerChildren.indexOf(fixture.nativeElement.querySelector('.auth-switch')),
    );
    expect(component.isSubmitting).toBe(false);
  });

  it('shows a user-friendly message for a network failure', () => {
    register.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.registerForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Impossible de créer le compte pour le moment');
    expect(component.registrationComplete).toBe(false);
  });

  it('keeps the submit button visually unchanged while preventing duplicate requests', () => {
    const pendingRegistration = new Subject<LoginResponse>();
    register.mockReturnValue(pendingRegistration);
    component.registerForm.setValue({ username: 'alice', password: 'pass1234' });
    component.onSubmit();
    component.onSubmit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(register).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(true);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain("S'inscrire");

    pendingRegistration.next({ token: 'session-token' });
    pendingRegistration.complete();
    fixture.detectChanges();
    expect(component.isSubmitting).toBe(false);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain("S'inscrire");
  });

  it('ends the loading state and shows a retry message when registration times out', () => {
    vi.useFakeTimers();
    try {
      register.mockReturnValue(NEVER);
      component.registerForm.setValue({ username: 'alice', password: 'pass1234' });

      component.onSubmit();
      expect(component.isSubmitting).toBe(true);

      vi.advanceTimersByTime(environment.apiRequestTimeoutMs);
      fixture.detectChanges(false);

      expect(component.isSubmitting).toBe(false);
      expect(component.registrationComplete).toBe(false);
      expect(component.errorMessage).toContain("Nous n'avons pas reçu de confirmation");
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        'vérifiez avant de réessayer',
      );
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
      expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent).toContain(
        "S'inscrire",
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
