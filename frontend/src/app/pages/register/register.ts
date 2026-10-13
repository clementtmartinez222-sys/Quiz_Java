import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, finalize, take, timeout } from 'rxjs';
import { API_REQUEST_TIMEOUT_MS } from '../../services/api-config';
import { AuthService, RegisterCredentials } from '../../services/auth';
import { requiredTrimmed } from '../../shared/form-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private authService = inject(AuthService);
  private changeDetector = inject(ChangeDetectorRef);
  private readonly requestTimeoutMs = inject(API_REQUEST_TIMEOUT_MS);

  registerForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [requiredTrimmed] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  errorMessage = '';
  isSubmitting = false;
  registrationComplete = false;

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting || this.registrationComplete) return;

    this.errorMessage = '';
    const credentials: RegisterCredentials = {
      ...this.registerForm.getRawValue(),
      username: this.registerForm.controls.username.value.trim(),
    };
    this.isSubmitting = true;

    this.authService.register(credentials).pipe(
      timeout({ first: this.requestTimeoutMs }),
      take(1),
      finalize(() => {
        this.isSubmitting = false;
        this.changeDetector.markForCheck();
      }),
    ).subscribe({
      next: () => {
        this.registrationComplete = true;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (error instanceof TimeoutError) {
          this.errorMessage = "Nous n'avons pas reçu de confirmation. La création du compte a peut-être abouti ; vérifiez avant de réessayer.";
        } else if (error instanceof HttpErrorResponse && error.status === 0) {
          this.errorMessage = 'Impossible de créer le compte pour le moment. Vérifiez votre connexion et réessayez.';
        } else if (error instanceof HttpErrorResponse && error.status === 409) {
          this.errorMessage = "Ce nom d'utilisateur est déjà utilisé. Choisissez-en un autre.";
        } else {
          this.errorMessage = "L'inscription n'a pas pu aboutir. Veuillez réessayer.";
        }
        this.changeDetector.markForCheck();
      },
    });
  }
}
