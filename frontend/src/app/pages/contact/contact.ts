import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, finalize, take, timeout } from 'rxjs';
import { API_REQUEST_TIMEOUT_MS } from '../../services/api-config';
import { ContactService, ContactMessage } from '../../services/contact';
import { requiredTrimmed } from '../../shared/form-validators';

export const CONTACT_FIELD_LIMITS = {
  // Keep the browser limits aligned with the API validation rules.
  name: 100,
  email: 254,
  message: 2000,
} as const;

function emailTrimmed(control: AbstractControl): ValidationErrors | null {
  const value = typeof control.value === 'string' ? control.value.trim() : control.value;
  return Validators.email(new FormControl(value));
}

function minTrimmedLength(minLength: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const actualLength = typeof control.value === 'string' ? control.value.trim().length : 0;
    return actualLength >= minLength
      ? null
      : { minlength: { requiredLength: minLength, actualLength } };
  };
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.html',
})
export class Contact {
  private contactService = inject(ContactService);
  private changeDetector = inject(ChangeDetectorRef);
  private readonly requestTimeoutMs = inject(API_REQUEST_TIMEOUT_MS);

  contactForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmed, Validators.maxLength(CONTACT_FIELD_LIMITS.name)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        requiredTrimmed,
        emailTrimmed,
        Validators.maxLength(CONTACT_FIELD_LIMITS.email),
      ],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [
        requiredTrimmed,
        minTrimmedLength(10),
        Validators.maxLength(CONTACT_FIELD_LIMITS.message),
      ],
    }),
  });

  errorMessage = '';
  isSubmitting = false;
  submissionComplete = false;
  readonly fieldLimits = CONTACT_FIELD_LIMITS;

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;

    this.submissionComplete = false;
    const formValue = this.contactForm.getRawValue();
    const contactData: ContactMessage = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      message: formValue.message.trim(),
    };
    this.errorMessage = '';
    this.isSubmitting = true;

    this.contactService.sendMessage(contactData).pipe(
      timeout({ first: this.requestTimeoutMs }),
      take(1),
      finalize(() => {
        this.isSubmitting = false;
        this.changeDetector.markForCheck();
      }),
    ).subscribe({
      next: () => {
        this.submissionComplete = true;
        this.contactForm.reset();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (error instanceof TimeoutError) {
          this.errorMessage = "Nous n'avons pas reçu de confirmation. Votre message a peut-être été envoyé ; vérifiez avant de le renvoyer.";
        } else if (error instanceof HttpErrorResponse && error.status === 0) {
          this.errorMessage = "Impossible d'envoyer votre message. Vérifiez votre connexion puis réessayez.";
        } else {
          this.errorMessage = "Votre message n'a pas pu être envoyé. Veuillez réessayer.";
        }
        this.changeDetector.markForCheck();
      },
    });
  }
}
