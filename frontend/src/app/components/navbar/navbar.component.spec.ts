import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NavbarComponent } from './navbar.component';
import { SessionState } from '../../services/session-state';

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
        provideHttpClient(),
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
    expect(nav.querySelector('a.logo')?.getAttribute('href')).toBe('/home');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/home',
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

  it('navigates to the home page from the brand link', async () => {
    const logo: HTMLAnchorElement = fixture.nativeElement.querySelector('a.logo');
    logo.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/home');
  });

  it('marks only the current page link with aria-current', async () => {
    await TestBed.inject(Router).navigateByUrl('/quizz-solo');
    fixture.detectChanges();

    const quizLink: HTMLAnchorElement =
      fixture.nativeElement.querySelector('a.main-item[href="/quizz-solo"]');
    const homeLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href="/home"]');

    expect(quizLink.getAttribute('aria-current')).toBe('page');
    expect(quizLink.classList.contains('active')).toBe(true);
    expect(homeLink.hasAttribute('aria-current')).toBe(false);
  });

  it('updates the profile label immediately when the session changes', () => {
    const profileLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href="/profil"]');
    expect(profileLink.textContent).toContain('Profil');
    TestBed.inject(SessionState).markAuthenticated();
    fixture.detectChanges();
    expect(profileLink.textContent).toContain('Mon profil');
  });
});
