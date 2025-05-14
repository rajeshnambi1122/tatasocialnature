import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ApplicationRegisterComponent } from './application-register/application-register.component';
import { MarathonRouteComponent } from './marathon-route/marathon-route.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: ApplicationRegisterComponent },
  { path: 'route', component: MarathonRouteComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: '' }
];
