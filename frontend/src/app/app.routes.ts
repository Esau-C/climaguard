import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Sensores } from './pages/sensores/sensores';
import { Lecturas } from './pages/lecturas/lecturas';
import { Alertas } from './pages/alertas/alertas';
import { Usuarios } from './pages/usuarios/usuarios';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  {
    path: 'login',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'sensores',
    component: Sensores,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'lecturas',
    component: Lecturas,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'alertas',
    component: Alertas,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [
      authGuard,
      adminGuard
    ]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];