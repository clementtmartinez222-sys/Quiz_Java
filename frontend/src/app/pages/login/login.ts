import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  errorMessage: string = '';

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Connexion réussie !', response);

          localStorage.setItem('token', response.token);

          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erreur de connexion', err);
          this.errorMessage = "Nom d'utilisateur ou mot de passe incorrect.";
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
