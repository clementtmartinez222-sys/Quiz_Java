import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Contact } from './pages/contact/contact';
import { Jeu } from './pages/jeu/jeu';
import { Fiches } from './pages/fiches/fiches';
import { ClassementComponent } from './pages/classement/classement';
import { AmisComponent } from './pages/amis/amis';
import { Profil } from './pages/profil/profil';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'contact', component: Contact },
  { path: 'jeu', component: Jeu },
  { path: 'fiches', component: Fiches },
  { path: 'classement', component: ClassementComponent },
  { path: 'amis', component: AmisComponent },
  { path: 'profil', component: Profil },
  { path: '**', redirectTo: 'home' }
];
