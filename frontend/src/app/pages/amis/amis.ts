import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideSearch, LucideUserMinus, LucideUserPlus } from '@lucide/angular';
import { AuthService } from '../../services/auth';
import { FriendUser, FriendsService } from '../../services/friends';

@Component({
  selector: 'app-amis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideSearch, LucideUserMinus, LucideUserPlus],
  templateUrl: './amis.html',
  styleUrl: './amis.css',
})
export class AmisComponent implements OnInit {
  private readonly friendsService = inject(FriendsService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  isLoggedIn = false;
  searchTerm = '';
  users: FriendUser[] = [];
  isLoading = false;
  loadError = false;
  updatingUserId: number | null = null;

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    if (this.isLoggedIn) this.loadUsers();
  }

  get filteredUsers(): FriendUser[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('fr');
    return this.users.filter((user) => user.username.toLocaleLowerCase('fr').includes(query));
  }

  get friendsCount(): number {
    return this.users.filter((user) => user.isFriend).length;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadError = false;
    this.friendsService.listUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Impossible de charger la liste des joueurs.', error);
        this.isLoading = false;
        this.loadError = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  toggleFriend(user: FriendUser): void {
    if (this.updatingUserId !== null) return;
    this.updatingUserId = user.id;
    const request = user.isFriend
      ? this.friendsService.removeFriend(user.id)
      : this.friendsService.addFriend(user.id);
    request.subscribe({
      next: () => {
        user.isFriend = !user.isFriend;
        this.updatingUserId = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Impossible de mettre à jour cet ami.', error);
        this.updatingUserId = null;
        this.changeDetector.markForCheck();
      },
    });
  }

  trackByUserId(_index: number, user: FriendUser): number {
    return user.id;
  }
}
