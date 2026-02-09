import { Routes } from '@angular/router';

import { ProjectList } from './components/project-list/project-list';
import { ProjectCreate } from './components/project-create/project-create';

import { UserListComponent } from './components/user-list/user-list';
import { UserCreate } from './components/user-create/user-create';

import { TaskList } from './components/task-list/task-list';
import { TaskCreate } from './components/task-create/task-create';

import { TaskDetails } from './components/task-details/task-details';
import { TaskAssignments } from './components/task-assignments/task-assignments';
import { TaskDependencies } from './components/task-dependencies/task-dependencies';

export const routes: Routes = [
  { path: 'projects', component: ProjectList },
  { path: 'projects/new', component: ProjectCreate },

  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserCreate },

  { path: 'tasks', component: TaskList },
  { path: 'tasks/create', component: TaskCreate },

  // Task hub + related pages
  { path: 'tasks/:id', component: TaskDetails },
  { path: 'tasks/:id/assignments', component: TaskAssignments },
  { path: 'tasks/:id/dependencies', component: TaskDependencies },

  { path: '', redirectTo: 'projects', pathMatch: 'full' },
];
