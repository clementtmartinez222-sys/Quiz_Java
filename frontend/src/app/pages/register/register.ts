import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private http = inject(HttpClient);
  private router = inject(Router);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  errorMessage: string = '';
  successMessage: string = '';

  onSubmit() {
    if (this.registerForm.valid) {
      const credentials = this.registerForm.value;

      this.http.post('http://localhost:8080/api/register', credentials).subscribe({
        next: (response) => {
          console.log('Inscription réussie !', response);
          this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          console.error("Erreur lors de l'inscription", err);
          this.errorMessage = "Impossible de créer le compte. Ce nom d'utilisateur est peut-être déjà pris.";
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
