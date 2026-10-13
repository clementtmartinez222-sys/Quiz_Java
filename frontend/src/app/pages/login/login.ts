import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TimeoutError, finalize, take, timeout } from 'rxjs';
import { API_REQUEST_TIMEOUT_MS } from '../../services/api-config';
import { AuthService, LoginCredentials } from '../../services/auth';
import { requiredTrimmed } from '../../shared/form-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private changeDetector = inject(ChangeDetectorRef);
  private readonly requestTimeoutMs = inject(API_REQUEST_TIMEOUT_MS);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [requiredTrimmed] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  errorMessage = '';
  isSubmitting = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) return;

    this.errorMessage = '';
    const credentials: LoginCredentials = {
      ...this.loginForm.getRawValue(),
      username: this.loginForm.controls.username.value.trim(),
    };
    this.isSubmitting = true;

    this.authService.login(credentials).pipe(
      timeout({ first: this.requestTimeoutMs }),
      take(1),
      finalize(() => {
        this.isSubmitting = false;
        this.changeDetector.markForCheck();
      }),
    ).subscribe({
      next: () => {
        this.changeDetector.markForCheck();
        const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
        const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : '/home';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        if (error instanceof TimeoutError) {
          this.errorMessage = 'La demande n’a pas abouti. Veuillez réessayer.';
        } else if (error instanceof HttpErrorResponse && error.status === 0) {
          this.errorMessage = 'Impossible de se connecter. Vérifiez votre connexion et réessayez.';
        } else if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
          this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect.";
        } else {
          this.errorMessage = 'La connexion a échoué. Réessayez plus tard.';
        }
        this.changeDetector.markForCheck();
      },
    });
  }
}
