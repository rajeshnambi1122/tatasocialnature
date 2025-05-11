import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ApplicationRegisterComponent } from './application-register/application-register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: ApplicationRegisterComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: '**', redirectTo: '' }
];
