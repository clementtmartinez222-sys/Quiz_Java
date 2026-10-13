import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, RegisterCredentials } from '../../services/auth';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let register: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    register = vi.fn<(credentials: RegisterCredentials) => Observable<void>>()
      .mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { register } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
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
    expect(fixture.nativeElement.querySelector('#username').getAttribute('aria-describedby'))
      .toBe('username-error');
    expect(fixture.nativeElement.querySelector('#password-error').textContent)
      .toContain('Le mot de passe est requis.');
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects usernames that contain only whitespace', () => {
    component.registerForm.setValue({ username: '   ', password: 'pass1234' });

    expect(component.registerForm.controls.username.hasError('required')).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
  });

  it('submits valid credentials and displays a success state with a login link', () => {
    component.registerForm.setValue({ username: '  alice  ', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(register).toHaveBeenCalledWith({ username: 'alice', password: 'pass1234' });
    expect(component.registrationComplete).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain('Votre compte a été créé');
    expect(fixture.nativeElement.querySelector('a[routerLink="/login"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[routerLink="/login"]').classList)
      .toContain('auth-success-link');
    expect(fixture.nativeElement.querySelector('a[routerLink="/home"]')?.textContent)
      .toContain("Retour à l'accueil");
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
    register.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.registerForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain("Ce nom d'utilisateur est déjà utilisé");
    const form = fixture.nativeElement.querySelector('form');
    expect(Array.from(form.children).indexOf(form.querySelector('.feedback-slot')))
      .toBeLessThan(Array.from(form.children).indexOf(form.querySelector('button[type="submit"]')));
    expect(component.isSubmitting).toBe(false);
  });

  it('shows a user-friendly message for a network failure', () => {
    register.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    component.registerForm.setValue({ username: 'alice', password: 'pass1234' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage)
      .toContain('Impossible de créer le compte pour le moment');
    expect(component.registrationComplete).toBe(false);
  });

  it('keeps the submit button visually unchanged while preventing duplicate requests', () => {
    const pendingRegistration = new Subject<void>();
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

    pendingRegistration.next();
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
      expect(component.errorMessage)
        .toContain("Nous n'avons pas reçu de confirmation");
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
        .toContain('vérifiez avant de réessayer');
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
      expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent)
        .toContain("S'inscrire");
    } finally {
      vi.useRealTimers();
    }
  });
});
