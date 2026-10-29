import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('renders a contact link using Angular routing', () => {
    const footer: HTMLElement = fixture.nativeElement.querySelector('footer');
    const contactLink: HTMLAnchorElement = footer.querySelector('a')!;

    expect(footer.textContent).toContain('Une question ou une suggestion ?');
    expect(contactLink.getAttribute('href')).toBe('/contact');
    expect(contactLink.textContent).toBe('Contactez-nous');
  });
});
