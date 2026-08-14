import { Routes } from '@angular/router';
import { ShellComponent } from './components/layout/shell/shell.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'hierarchy', redirectTo: 'grades', pathMatch: 'full' },
      { path: 'grades', loadComponent: () => import('./components/grades/grades.component').then(m => m.GradesComponent) },
      { path: 'subjects', loadComponent: () => import('./components/subjects/subjects.component').then(m => m.SubjectsComponent) },
      { path: 'topics', loadComponent: () => import('./components/topics/topics.component').then(m => m.TopicsComponent) },
      { path: 'questions', loadComponent: () => import('./components/questions/questions.component').then(m => m.QuestionsComponent) },
      { path: 'csv-import', loadComponent: () => import('./components/csv-import/csv-import.component').then(m => m.CsvImportComponent) },
      { path: 'package-publishing', loadComponent: () => import('./components/package-publishing/package-publishing.component').then(m => m.PackagePublishingComponent) },
      { path: 'users', loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent) },
      { path: 'licenses', loadComponent: () => import('./components/licenses/licenses.component').then(m => m.LicensesComponent) },
      { path: 'subscriptions', loadComponent: () => import('./components/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent) },
      { path: 'system-metrics', loadComponent: () => import('./components/system-metrics/system-metrics.component').then(m => m.SystemMetricsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
