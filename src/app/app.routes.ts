import { Routes } from '@angular/router';
import { authGuard }   from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/admin/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/admin/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/admin/schedule/schedule.component').then(m => m.ScheduleComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/admin/calendario/calendario.component').then(m => m.CalendarioComponent),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/admin/reservations/reservations.component').then(m => m.ReservationsComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/admin/clients/clients.component').then(m => m.ClientsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
