import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
export class NavbarComponent {}
