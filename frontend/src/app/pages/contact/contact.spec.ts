import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactMessage, ContactService } from '../../services/contact';
import { Contact } from './contact';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let sendMessage: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    sendMessage = vi.fn<(message: ContactMessage) => Observable<string>>()
      .mockReturnValue(of('sent'));

    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        provideRouter([]),
        { provide: ContactService, useValue: { sendMessage } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('marks invalid fields as touched and displays accessible errors', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.contactForm.controls.name.touched).toBe(true);
    expect(component.contactForm.controls.email.touched).toBe(true);
    expect(component.contactForm.controls.message.touched).toBe(true);
    expect(fixture.nativeElement.querySelector('#name').getAttribute('aria-describedby'))
      .toBe('name-error');
    expect(fixture.nativeElement.querySelector('#message-error').textContent)
      .toContain('Le message est requis.');
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only names and messages shorter than ten trimmed characters', () => {
    component.contactForm.setValue({
      name: '   ',
      email: 'person@example.com',
      message: ' 12345678 ',
    });

    expect(component.contactForm.controls.name.hasError('required')).toBe(true);
    expect(component.contactForm.controls.message.hasError('minlength')).toBe(true);
    expect(component.contactForm.invalid).toBe(true);
  });

  it('enforces frontend contact field limits before submitting', () => {
    component.contactForm.setValue({
      name: 'n'.repeat(101),
      email: `${'e'.repeat(250)}@example.com`,
      message: 'm'.repeat(5001),
    });

    expect(component.contactForm.controls.name.hasError('maxlength')).toBe(true);
    expect(component.contactForm.controls.email.hasError('maxlength')).toBe(true);
    expect(component.contactForm.controls.message.hasError('maxlength')).toBe(true);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('submits trimmed values and displays a separate accessible success state', () => {
    component.contactForm.setValue({
      name: '  Alice  ',
      email: ' alice@example.com ',
      message: '  This is a long enough message.  ',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(sendMessage).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'This is a long enough message.',
    });
    expect(component.submissionComplete).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain('Votre message a bien été envoyé');
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent)
      .toContain('Envoyer');
  });

  it('keeps the form and submit button available after success', () => {
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'This is a long enough message.',
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(component.submissionComplete).toBe(true);
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent)
      .toContain('Envoyer');
  });

  it('preserves the success confirmation if an invalid follow-up submission is attempted', () => {
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'This is a long enough message.',
    });
    component.onSubmit();
    component.contactForm.setValue({ name: '', email: '', message: '' });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.submissionComplete).toBe(true);
    expect(fixture.nativeElement.querySelector('.success-message').textContent)
      .toContain('Votre message a bien été envoyé');
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it('shows a user-friendly error for a network failure', () => {
    sendMessage.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 0 })),
    );
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'This is a long enough message.',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Vérifiez votre connexion');
    const form = fixture.nativeElement.querySelector('form');
    expect(Array.from(form.children).indexOf(form.querySelector('.feedback-slot')))
      .toBeLessThan(Array.from(form.children).indexOf(form.querySelector('.contact-actions')));
    expect(form.querySelector('.contact-actions a[routerLink="/home"]')).not.toBeNull();
    expect(component.isSubmitting).toBe(false);
  });

  it('keeps the submit button visually unchanged while preventing duplicate requests', () => {
    const pending = new Subject<string>();
    sendMessage.mockReturnValue(pending);
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'This is a long enough message.',
    });
    component.onSubmit();
    component.onSubmit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(component.isSubmitting).toBe(true);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Envoyer');

    pending.next('sent');
    pending.complete();
    fixture.detectChanges();
    expect(component.isSubmitting).toBe(false);
    expect(submitButton.disabled).toBe(false);
    expect(submitButton.textContent).toContain('Envoyer');
  });

  it('ends the loading state and allows retry after a request timeout', () => {
    vi.useFakeTimers();
    try {
      sendMessage.mockReturnValue(NEVER);
      component.contactForm.setValue({
        name: 'Alice',
        email: 'alice@example.com',
        message: 'This is a long enough message.',
      });

      component.onSubmit();
      expect(component.isSubmitting).toBe(true);
      vi.advanceTimersByTime(environment.apiRequestTimeoutMs);
      fixture.detectChanges(false);

      expect(component.isSubmitting).toBe(false);
      expect(component.errorMessage).toContain("Nous n'avons pas reçu de confirmation");
      expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
      expect(fixture.nativeElement.querySelector('button[type="submit"]').textContent)
        .toContain('Envoyer');
    } finally {
      vi.useRealTimers();
    }
  });
});
