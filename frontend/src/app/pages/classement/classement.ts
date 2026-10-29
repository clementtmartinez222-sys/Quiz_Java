import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Joueur {
  id: number;
  pseudo: string;
  elo: number;
  victoires: number;
  matchs: number;
}

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classement.html',
  styleUrls: ['./classement.css']
})
export class ClassementComponent {

  recherche = '';
  tri: 'elo' | 'victoires' | 'matchs' = 'elo';

  // Données de démonstration à remplacer par les joueurs de ton site.
  joueurs: Joueur[] = [
    { id: 1, pseudo: 'Alex_Du_73', elo: 1842, victoires: 42, matchs: 60 },
    { id: 2, pseudo: 'LéoB', elo: 1765, victoires: 36, matchs: 55 },
    { id: 3, pseudo: 'ZoéT', elo: 1698, victoires: 31, matchs: 51 },
    { id: 4, pseudo: 'Mathis42', elo: 1580, victoires: 24, matchs: 50 },
    { id: 5, pseudo: 'CamilleS', elo: 1524, victoires: 21, matchs: 43 },
    { id: 6, pseudo: 'Romain_', elo: 1460, victoires: 18, matchs: 42 },
    { id: 7, pseudo: 'NinaQuiz', elo: 1390, victoires: 14, matchs: 35 },
    { id: 8, pseudo: 'TomFR', elo: 1250, victoires: 8, matchs: 30 }
  ];

  get joueursFiltres(): Joueur[] {
    const terme = this.recherche.trim().toLocaleLowerCase('fr');

    return this.joueurs
      .filter(joueur =>
        joueur.pseudo.toLocaleLowerCase('fr').includes(terme)
      )
      .sort((a, b) => {
        if (this.tri === 'victoires') {
          return b.victoires - a.victoires;
        }

        if (this.tri === 'matchs') {
          return b.matchs - a.matchs;
        }

        return b.elo - a.elo;
      });
  }

  get meilleurElo(): number {
    return this.joueurs.length
      ? Math.max(...this.joueurs.map(joueur => joueur.elo))
      : 0;
  }

  get totalMatchs(): number {
    return this.joueurs.reduce(
      (total, joueur) => total + joueur.matchs,
      0
    );
  }
}

