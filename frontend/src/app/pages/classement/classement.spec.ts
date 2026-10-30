import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassementComponent } from './classement';
import { LeaderboardService } from '../../services/leaderboard';
import { of } from 'rxjs';

describe('ClassementComponent', () => {
  let component: ClassementComponent;
  let fixture: ComponentFixture<ClassementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassementComponent],
      providers: [{ provide: LeaderboardService, useValue: { getPlayers: () => of([]) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
