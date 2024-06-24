import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { GestionCajachicaComponent } from './pages/cajachica-gestion/gestion-cajachica/gestion-cajachica.component';
import { GestionCajachicaValesComponent } from './pages/cajachica-gestion/gestion-cajachica-vales/gestion-cajachica-vales.component';
import { GestionCajachicaGastosComponent } from './pages/cajachica-gestion/gestion-cajachica-gastos/gestion-cajachica-gastos.component';


export const ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },

  //Caja Chica
  { path: 'cajachica-gestion', component: GestionCajachicaComponent, canActivate: [AuthGuard] },
  // { path: 'cajachica/crear', component: CajaCrearComponent, canActivate: [AuthGuard] },
  { path: 'cajachica-gestion-vales', component: GestionCajachicaValesComponent, canActivate: [AuthGuard] },
  { path: 'cajachica-gestion-gastos', component: GestionCajachicaGastosComponent, canActivate: [AuthGuard] },
  // { path: 'cajachica-resoluciones', component: CajaResolucionesComponent, canActivate: [AuthGuard] },


  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', pathMatch: 'full', redirectTo: 'login' },
];
