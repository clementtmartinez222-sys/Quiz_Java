import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionState } from '../../services/session-state';
import {
  LucideGamepad2,
  LucideBookOpen,
  LucideTrophy,
  LucideUsers,
  LucideUserRound,
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideGamepad2,
    LucideBookOpen,
    LucideTrophy,
    LucideUsers,
    LucideUserRound,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private readonly session = inject(SessionState);
  readonly isLoggedIn = computed(() => this.session.isAuthenticated());
}
