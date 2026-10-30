import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { environment } from '../../../environments/environment';

interface ProfileStatistics {
  quizzesPlayed: number;
  averageScore: string;
  correctAnswers: number;
  bestStreak: number;
  recentResults: Array<{ theme: string; score: string; playedAt: string }>;
}

const DEMO_PROFILE = {
  username: 'Camille Martin',
  email: 'camille.martin@example.fr',
  memberSince: 'mars 2025',
  statistics: {
    quizzesPlayed: 12,
    averageScore: '78 %',
    correctAnswers: 94,
    bestStreak: 8,
    recentResults: [
      { theme: 'Sciences', score: '8 / 10', playedAt: 'Aujourd’hui' },
      { theme: 'Histoire', score: '7 / 10', playedAt: 'Hier' },
      { theme: 'Géographie', score: '9 / 10', playedAt: 'Il y a 3 jours' },
    ],
  },
} satisfies { username: string; email: string; memberSince: string; statistics: ProfileStatistics };

@Component({
  selector: 'app-profil',
  imports: [RouterLink],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoggedIn = false;
  isDemoPreview = false;
  username: string | null = null;
  email: string | null = null;
  memberSince: string | null = null;
  statistics: ProfileStatistics | null = null;
  profileLoading = false;
  profileLoadError = false;

  ngOnInit(): void {
    this.isDemoPreview = !environment.production
      && this.route.snapshot.queryParamMap.get('preview') === 'connected';
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getCurrentUsername();

    if (this.isDemoPreview) {
      this.isLoggedIn = true;
      this.username = DEMO_PROFILE.username;
      this.email = DEMO_PROFILE.email;
      this.memberSince = DEMO_PROFILE.memberSince;
      this.statistics = DEMO_PROFILE.statistics;
    } else if (this.isLoggedIn) {
      this.profileLoading = true;
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          this.username = profile.username;
          this.memberSince = new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric',
          }).format(new Date(`${profile.memberSince}T00:00:00`));
          this.statistics = {
            ...profile.statistics,
            averageScore: `${profile.statistics.averageScore} %`,
            recentResults: profile.statistics.recentResults.map((result) => ({
              ...result,
              playedAt: new Date(result.playedAt).toLocaleDateString('fr-FR'),
            })),
          };
          this.profileLoading = false;
          this.changeDetector.markForCheck();
        },
        error: (error: unknown) => {
          console.error('Erreur lors du chargement du profil', error);
          this.profileLoading = false;
          this.profileLoadError = true;
          this.changeDetector.markForCheck();
        },
      });
    }
  }

  onLogout(): void {
    if (this.isDemoPreview) {
      this.isDemoPreview = false;
      this.isLoggedIn = this.authService.isLoggedIn();
      this.username = this.authService.getCurrentUsername();
      this.email = null;
      this.memberSince = null;
      this.statistics = null;
      void this.router.navigate(['/profil']);
      return;
    }

    this.authService.logout();
    this.isLoggedIn = false;
    this.username = null;
    void this.router.navigate(['/login']);
  }
}
