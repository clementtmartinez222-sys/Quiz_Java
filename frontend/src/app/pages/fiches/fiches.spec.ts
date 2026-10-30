import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Fiches } from './fiches';
import { RevisionSheetsService } from '../../services/revision-sheets';
import { of } from 'rxjs';

const demoSheets = [{ id: 1, quizId: 'test', titre: 'Fiche de test', description: 'Description', categorie: 'Test',
  dureeLecture: 4, nombreNotions: 1, couleur: 'violet', notions: ['Notion'] }];

describe('Fiches', () => {
  let component: Fiches;
  let fixture: ComponentFixture<Fiches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fiches],
      providers: [provideRouter([]), { provide: RevisionSheetsService, useValue: { getSheets: () => of(demoSheets) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Fiches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens and closes a revision sheet', async () => {
    const fiche = component.fiches[0];
    fixture.nativeElement.querySelector('.read-button').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="dialog"] h2').textContent).toBe(fiche.titre);
    fixture.nativeElement.querySelector('.fiche-dialog-close').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens the matching quiz from a sheet and closes the reading panel with Escape', async () => {
    fixture.nativeElement.querySelector('.read-button').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.fiche-quiz-action').getAttribute('href'))
      .toBe('/quizz-solo?theme=test');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows loaded fiches immediately with the default all-categories filter', () => {
    fixture.detectChanges();
    expect(component.categorieActive).toBe('Toutes');
    expect(component.fichesFiltrees).toEqual(demoSheets);
    expect(fixture.nativeElement.querySelectorAll('.fiche-card')).toHaveLength(1);
  });
});
