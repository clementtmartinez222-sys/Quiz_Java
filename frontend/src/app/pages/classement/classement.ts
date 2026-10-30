import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCrown, LucideMedal, LucideSearch, LucideSearchX, LucideTrophy, LucideUsers } from '@lucide/angular';
import { LeaderboardPlayer, LeaderboardService } from '../../services/leaderboard';

type SortKey = 'score' | 'quizzes' | 'correct';

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideCrown, LucideMedal, LucideSearch, LucideSearchX, LucideTrophy, LucideUsers],
  templateUrl: './classement.html',
  styleUrl: './classement.css',
})
export class ClassementComponent implements OnInit {
  private readonly leaderboard = inject(LeaderboardService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  recherche = '';
  tri: SortKey = 'score';
  joueurs: LeaderboardPlayer[] = [];
  loading = true;
  loadError = false;

  ngOnInit(): void { this.loadPlayers(); }

  loadPlayers(): void {
    this.loading = true;
    this.loadError = false;
    this.leaderboard.getPlayers().subscribe({
      next: (players) => {
        this.joueurs = players;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Impossible de charger le classement.', error);
        this.loading = false;
        this.loadError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  get joueursFiltres(): LeaderboardPlayer[] {
    const terme = this.recherche.trim().toLocaleLowerCase('fr');
    const filtered = this.joueurs.filter((player) => player.username.toLocaleLowerCase('fr').includes(terme));
    return filtered.sort((a, b) => {
      if (this.tri === 'quizzes') return b.quizzesPlayed - a.quizzesPlayed || b.averageScore - a.averageScore;
      if (this.tri === 'correct') return b.correctAnswers - a.correctAnswers || b.averageScore - a.averageScore;
      return b.averageScore - a.averageScore || b.quizzesPlayed - a.quizzesPlayed;
    });
  }

  get meilleurScore(): number { return Math.max(0, ...this.joueurs.map((player) => player.averageScore)); }
  get totalQuizzes(): number { return this.joueurs.reduce((total, player) => total + player.quizzesPlayed, 0); }
}
