import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/layout/admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'brigadistas',
        loadComponent: () =>
          import(
            './features/brigadistas/brigadistas/brigadistas.component'
          ).then((m) => m.BrigadistasComponent),
      },
      {
        path: 'ubicaciones',
        loadComponent: () =>
          import(
            './features/ubicaciones/ubicaciones/ubicaciones.component'
          ).then((m) => m.UbicacionesComponent),
      },

      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
