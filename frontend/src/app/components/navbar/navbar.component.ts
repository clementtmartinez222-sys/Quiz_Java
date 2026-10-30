import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideGamepad2,
  LucideBookOpen,
  LucideTrophy,
  LucideUsers,
  LucideUserRound,
  LucideLogIn,

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
    LucideLogIn,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {}
