import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  private http = inject(HttpClient);

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  successMessage: string = '';
  errorMessage: string = '';

  onSubmit() {
    if (this.contactForm.valid) {
      const contactData = this.contactForm.value;

      this.http.post('http://localhost:8080/api/contact', contactData, { responseType: 'text' }).subscribe({
        next: (response) => {
          console.log('Message envoyé avec succès !', response);
          this.successMessage = 'Votre message a bien été envoyé ! Nous vous répondrons rapidement.';
          this.errorMessage = '';
          this.contactForm.reset();
        },
        error: (err) => {
          console.error("Erreur lors de l'envoi", err);
          this.errorMessage = "Impossible d'envoyer le message pour le moment. Réessayez plus tard.";
          this.successMessage = '';
        }
      });

    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
