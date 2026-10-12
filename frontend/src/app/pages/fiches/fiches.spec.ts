import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fiches } from './fiches';

describe('Fiches', () => {
  let component: Fiches;
  let fixture: ComponentFixture<Fiches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fiches],
    }).compileComponents();

    fixture = TestBed.createComponent(Fiches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
