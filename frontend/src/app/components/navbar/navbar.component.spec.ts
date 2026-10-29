import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NavbarComponent } from './navbar.component';

@Component({
  standalone: true,
  template: '',
})
class TestPage {}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([
          { path: 'home', component: TestPage },
          { path: 'quizz-solo', component: TestPage },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
  });

  it('provides accessible navigation links for the existing site pages', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    const links = Array.from<HTMLAnchorElement>(nav.querySelectorAll('a'));

    expect(nav.getAttribute('aria-label')).toBe('Navigation principale');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/home',
      '/quizz-solo',
      '/fiches',
      '/classement',
      '/amis',
      '/profil',
    ]);
    expect(links.every((link) => link.textContent?.trim())).toBe(true);
    expect(nav.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(nav.querySelectorAll('svg[aria-hidden="true"]').length).toBe(5);
    expect(nav.querySelector('a[href="/contact"]')).toBeNull();
    expect(nav.querySelector('a[href="/login"]')).toBeNull();
    expect(nav.querySelector('a[href="/register"]')).toBeNull();
    expect(nav.querySelector('a[href="/jeu"]')).toBeNull();
  });

  it('marks only the current page link with aria-current', async () => {
    await TestBed.inject(Router).navigateByUrl('/quizz-solo');
    fixture.detectChanges();

    const quizLink: HTMLAnchorElement =
      fixture.nativeElement.querySelector('a[href="/quizz-solo"]');
    const homeLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href="/home"]');

    expect(quizLink.getAttribute('aria-current')).toBe('page');
    expect(quizLink.classList.contains('active')).toBe(true);
    expect(homeLink.hasAttribute('aria-current')).toBe(false);
  });
});
