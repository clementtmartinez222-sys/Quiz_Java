import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideChevronRight, LucideClock3, LucideFileText, LucideSearch } from '@lucide/angular';

/** Contrat à réutiliser tel quel avec le futur service API. */
export interface FicheRevision {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  dureeLecture: number;
  nombreNotions: number;
  couleur: string;
}

const FICHES_DEMO: FicheRevision[] = [
  { id: 1, titre: 'Les bases de Java', description: 'Variables, types, conditions et boucles : tout ce qu’il faut pour démarrer.', categorie: 'Programmation', dureeLecture: 8, nombreNotions: 12, couleur: 'violet' },
  { id: 2, titre: 'Programmation orientée objet', description: 'Classes, objets, héritage, interfaces et polymorphisme expliqués simplement.', categorie: 'Programmation', dureeLecture: 12, nombreNotions: 10, couleur: 'blue' },
  { id: 3, titre: 'Collections Java', description: 'Choisis entre List, Set et Map et maîtrise leurs principales méthodes.', categorie: 'Programmation', dureeLecture: 10, nombreNotions: 9, couleur: 'orange' },
  { id: 4, titre: 'Culture générale', description: 'Un tour d’horizon des grands repères historiques, scientifiques et artistiques.', categorie: 'Culture', dureeLecture: 6, nombreNotions: 15, couleur: 'green' },
  { id: 5, titre: 'Capitales du monde', description: 'Révise les pays et leurs capitales incontournables avant ton prochain quiz.', categorie: 'Géographie', dureeLecture: 7, nombreNotions: 20, couleur: 'pink' },
  { id: 6, titre: 'Système solaire', description: 'Planètes, satellites et phénomènes astronomiques à connaître.', categorie: 'Sciences', dureeLecture: 5, nombreNotions: 11, couleur: 'yellow' }
];

@Component({
  selector: 'app-fiches', standalone: true,
  imports: [CommonModule, FormsModule, LucideChevronRight, LucideClock3, LucideFileText, LucideSearch],
  templateUrl: './fiches.html', styleUrl: './fiches.css',
})
export class Fiches {
  recherche = '';
  categorieActive = 'Toutes';
  // À remplacer par les données du backend (GET /api/fiches, par exemple).
  fiches: FicheRevision[] = FICHES_DEMO;

  get categories(): string[] { return ['Toutes', ...new Set(this.fiches.map(fiche => fiche.categorie))]; }
  get fichesFiltrees(): FicheRevision[] {
    const terme = this.recherche.trim().toLocaleLowerCase('fr');
    return this.fiches.filter(fiche => {
      const correspondRecherche = !terme || `${fiche.titre} ${fiche.description} ${fiche.categorie}`.toLocaleLowerCase('fr').includes(terme);
      return correspondRecherche && (this.categorieActive === 'Toutes' || fiche.categorie === this.categorieActive);
    });
  }
  selectionnerCategorie(categorie: string): void { this.categorieActive = categorie; }
}
