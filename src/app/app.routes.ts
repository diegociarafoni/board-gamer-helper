import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.page').then(m => m.HomePage),
  },

  {
    path: 'mode/:id',
    loadComponent: () =>
      import('./features/mode/mode.page').then(m => m.ModePage),
  },

  {
    path: 'colors',
    loadComponent: () =>
      import('./features/colors/colors.page').then(m => m.ColorsPage),
  },

  { path: '**', redirectTo: 'home' },
];
