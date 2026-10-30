import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AmisComponent } from './amis';

describe('AmisComponent', () => {
  let component: AmisComponent;
  let fixture: ComponentFixture<AmisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmisComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AmisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
