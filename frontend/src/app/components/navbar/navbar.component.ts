import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
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
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    LucideGamepad2,
    LucideBookOpen,
    LucideTrophy,
    LucideUsers,
    LucideUserRound,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {}
