import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
