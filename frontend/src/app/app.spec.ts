import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application navigation and router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('a[href="/home"]')?.textContent).toContain('QuizCulture');
    expect(compiled.querySelector('a[href="/quizz-solo"]')?.textContent).toContain('Quiz solo');
    expect(compiled.querySelector('a[href="/jeu"]')).toBeNull();
    expect(compiled.querySelector('a[href="/fiches"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/classement"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/amis"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/profil"]')).toBeTruthy();
    expect(compiled.querySelector('nav a[href="/contact"]')).toBeNull();
    expect(compiled.querySelector('app-footer footer a[href="/contact"]')).toBeTruthy();
  });
});
