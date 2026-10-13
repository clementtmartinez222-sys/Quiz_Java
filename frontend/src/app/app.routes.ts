import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((module) => module.Contact),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((module) => module.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((module) => module.Register),
  },
  {
    path: 'quizz-solo',
    loadComponent: () => import('./pages/quizz-solo/quizz-solo').then((module) => module.QuizzSolo),
  },
  { path: '**', redirectTo: 'home' },
];
