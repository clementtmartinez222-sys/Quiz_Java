import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideClock3, LucideFileText, LucideSearch } from '@lucide/angular';
import { RevisionSheet, RevisionSheetsService } from '../../services/revision-sheets';

export type FicheRevision = RevisionSheet;

@Component({
  selector: 'app-fiches', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideChevronRight, LucideClock3, LucideFileText, LucideSearch],
  templateUrl: './fiches.html', styleUrl: './fiches.css',
})
export class Fiches implements OnInit {
  private readonly sheetsService = inject(RevisionSheetsService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('dialogClose') private dialogClose?: ElementRef<HTMLButtonElement>;
  private previouslyFocused: HTMLElement | null = null;
  recherche = '';
  categorieActive = 'Toutes';
  ficheActive: FicheRevision | null = null;
  fiches: FicheRevision[] = [];
  loading = true;
  loadError = false;

  ngOnInit(): void { this.loadSheets(); }
  loadSheets(): void {
    this.loading = true;
    this.loadError = false;
    this.sheetsService.getSheets().subscribe({
      next: sheets => {
        this.fiches = sheets;
        this.categorieActive = 'Toutes';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.changeDetector.markForCheck();
      },
    });
  }
  get categories(): string[] { return ['Toutes', ...new Set(this.fiches.map(fiche => fiche.categorie))]; }
  get fichesFiltrees(): FicheRevision[] {
    const terme = this.recherche.trim().toLocaleLowerCase('fr');
    return this.fiches.filter(fiche => {
      const match = !terme || `${fiche.titre} ${fiche.description} ${fiche.categorie}`.toLocaleLowerCase('fr').includes(terme);
      return match && (this.categorieActive === 'Toutes' || fiche.categorie === this.categorieActive);
    });
  }
  selectionnerCategorie(categorie: string): void { this.categorieActive = categorie; }
  ouvrirFiche(fiche: FicheRevision): void {
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.ficheActive = fiche;
    queueMicrotask(() => this.dialogClose?.nativeElement.focus());
  }
  fermerFiche(): void {
    this.ficheActive = null;
    queueMicrotask(() => this.previouslyFocused?.focus());
  }

  @HostListener('document:keydown', ['$event'])
  gererClavierDialogue(event: KeyboardEvent): void {
    if (!this.ficheActive) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.fermerFiche();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector<HTMLElement>('.fiche-dialog');
    const focusables = dialog?.querySelectorAll<HTMLElement>('button, a[href]');
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
