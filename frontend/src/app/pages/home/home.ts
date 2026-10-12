import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  isLoggedIn: boolean = false;

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  onLogout() {
    this.authService.logout();
  }
}
