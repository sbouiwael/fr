import { Routes } from '@angular/router';

import { ProjectList } from './components/project-list/project-list';
import { ProjectCreate } from './components/project-create/project-create';
import { ProjectDetails } from './components/project-details/project-details';
import { ProjectEdit } from './components/project-edit/project-edit';

import { UserListComponent } from './components/user-list/user-list';
import { UserCreate } from './components/user-create/user-create';
import { UserEdit } from './components/user-edit/user-edit';

import { TaskList } from './components/task-list/task-list';
import { TaskCreate } from './components/task-create/task-create';
import { TaskEdit } from './components/task-edit/task-edit';

import { TaskDetails } from './components/task-details/task-details';
import { TaskAssignments } from './components/task-assignments/task-assignments';
import { TaskDependencies } from './components/task-dependencies/task-dependencies';
import { Gantt } from './components/gantt/gantt';

import { PortefeuilleList } from './components/portefeuille-list/portefeuille-list';
import { PortefeuilleDetails } from './components/portefeuille-details/portefeuille-details';

import { HomePage } from './components/home/home';

export const routes: Routes = [
  { path: 'projects', component: ProjectList },
  { path: 'projects/new', component: ProjectCreate },
  { path: 'projects/:id', component: ProjectDetails },
  { path: 'projects/:id/edit', component: ProjectEdit },
  { path: 'projects/:id/gantt', component: Gantt },

  { path: 'portefeuilles', component: PortefeuilleList },
  { path: 'portefeuilles/:id', component: PortefeuilleDetails },

  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserCreate },
  { path: 'users/:id/edit', component: UserEdit },

  { path: 'tasks', component: TaskList },
  { path: 'tasks/create', component: TaskCreate },

  // Task hub + related pages
  { path: 'tasks/:id', component: TaskDetails },
  { path: 'tasks/:id/edit', component: TaskEdit },
  { path: 'tasks/:id/assignments', component: TaskAssignments },
  { path: 'tasks/:id/dependencies', component: TaskDependencies },

  { path: '', component: HomePage, pathMatch: 'full' },
];
