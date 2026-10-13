import { routes } from './app.routes';

describe('application routes', () => {
  it('redirects the root path to the home page', () => {
    expect(routes.find((route) => route.path === '')).toMatchObject({
      path: '',
      redirectTo: 'home',
      pathMatch: 'full',
    });
  });

  it('lazy-loads each page instead of importing it into the initial bundle', () => {
    const pagePaths = ['home', 'contact', 'login', 'register', 'quizz-solo'];

    for (const path of pagePaths) {
      const route = routes.find((item) => item.path === path);
      expect(route?.loadComponent).toBeTypeOf('function');
      expect(route?.component).toBeUndefined();
    }
  });

  it('redirects unknown paths to home', () => {
    expect(routes.at(-1)).toMatchObject({ path: '**', redirectTo: 'home' });
  });
});
