import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Classement } from './classement';

describe('Classement', () => {
  let component: Classement;
  let fixture: ComponentFixture<Classement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Classement],
    }).compileComponents();

    fixture = TestBed.createComponent(Classement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
