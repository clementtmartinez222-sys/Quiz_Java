import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home').then((page) => page.Home) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((page) => page.Contact) },
  { path: 'quizz-solo', loadComponent: () => import('./pages/quizz-solo/quizz-solo').then((page) => page.QuizzSolo) },
  { path: 'fiches', loadComponent: () => import('./pages/fiches/fiches').then((page) => page.Fiches) },
  { path: 'classement', loadComponent: () => import('./pages/classement/classement').then((page) => page.ClassementComponent) },
  { path: 'amis', loadComponent: () => import('./pages/amis/amis').then((page) => page.AmisComponent) },
  { path: 'profil', loadComponent: () => import('./pages/profil/profil').then((page) => page.Profil) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then((page) => page.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then((page) => page.Register) },
  { path: '**', redirectTo: 'home' }
];
