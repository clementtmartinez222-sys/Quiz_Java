import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface QuizUser {
  id: number;
  username: string;
  online: boolean;
  isFriend: boolean;
}

@Component({
  selector: 'app-amis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amis.html',
  styleUrl: './amis.css'
})
export class AmisComponent {
  searchTerm = '';

  // Données de démonstration à remplacer par les données de l'API Java.
  users: QuizUser[] = [
    { id: 1, username: 'Alex_Du_73', online: true, isFriend: true },
    { id: 2, username: 'LéoB', online: true, isFriend: true },
    { id: 3, username: 'Mathis42', online: false, isFriend: false },
    { id: 4, username: 'ZoéT', online: true, isFriend: true },
    { id: 5, username: 'Romain_', online: false, isFriend: false },
    { id: 6, username: 'CamilleS', online: true, isFriend: true },
    { id: 7, username: 'ThomasB', online: false, isFriend: false },
    { id: 8, username: 'EmmaK', online: true, isFriend: true }
  ];

  get filteredUsers(): QuizUser[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('fr');
    return this.users.filter(user =>
      user.username.toLocaleLowerCase('fr').includes(query)
    );
  }

  get friendsCount(): number {
    return this.users.filter(user => user.isFriend).length;
  }

  toggleFriend(user: QuizUser): void {
    user.isFriend = !user.isFriend;
  }

  trackByUserId(_index: number, user: QuizUser): number {
    return user.id;
  }
}

