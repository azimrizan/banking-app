import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.LoginComponent),
    
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup/signup').then(m => m.SignupComponent),
    
  },

  { path: '**', redirectTo: '/login' }
];
