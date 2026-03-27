# PPM Project - Frontend (Angular)

## Project Portfolio Management - Interface Web

Application frontend pour la gestion de portefeuilles de projets (PPM), construite avec **Angular 21** et **TypeScript 5.9**. Cette interface fournit un tableau de bord complet, un diagramme de Gantt interactif, la gestion des projets, taches, utilisateurs, portefeuilles, affectations et dependances.

---

## Table des matieres

1. [Stack technique](#stack-technique)
2. [Architecture du projet](#architecture-du-projet)
3. [Pre-requis](#pre-requis)
4. [Installation et demarrage](#installation-et-demarrage)
5. [Configuration](#configuration)
6. [Routing (Navigation)](#routing-navigation)
7. [Modeles de donnees (Interfaces TypeScript)](#modeles-de-donnees)
8. [Services HTTP](#services-http)
9. [Composants - Vue d'ensemble](#composants---vue-densemble)
10. [Composants - Detail par module](#composants---detail-par-module)
11. [Diagramme de Gantt interactif](#diagramme-de-gantt-interactif)
12. [Composants partages](#composants-partages)
13. [Systeme de design et styles](#systeme-de-design-et-styles)
14. [Gestion des fichiers projet](#gestion-des-fichiers-projet)
15. [Import Excel](#import-excel)
16. [Structure des dossiers](#structure-des-dossiers)
17. [Build et deploiement](#build-et-deploiement)
18. [Scripts disponibles](#scripts-disponibles)

---

## Stack technique

| Composant          | Technologie        | Version  |
|--------------------|--------------------|----------|
| Framework          | Angular            | 21.1.0   |
| Langage            | TypeScript         | 5.9.2    |
| CLI                | Angular CLI        | 21.1.2   |
| Reactive           | RxJS               | 7.8.0    |
| Excel              | xlsx (SheetJS)     | 0.18.5   |
| Tests              | Vitest             | 4.0.8    |
| Package Manager    | npm                | 11.6.2   |
| Styling            | CSS natif + CSS Variables | - |

---

## Architecture du projet

Le projet suit une architecture **component-based** avec des **standalone components** (Angular 14+) :

```
App (Shell : Navbar + Router Outlet + Footer)
  |
  ├── Home Page (Dashboard)
  ├── Projects Module
  │   ├── ProjectList (recherche, tri, pagination, import Excel)
  │   ├── ProjectCreate (formulaire reactif)
  │   ├── ProjectDetails (details + gestion fichiers)
  │   ├── ProjectEdit (formulaire reactif)
  │   └── Gantt (diagramme interactif)
  ├── Portfolios Module
  │   ├── PortefeuilleList (recherche, tri, creation inline)
  │   └── PortefeuilleDetails (gestion projets, edition inline)
  ├── Tasks Module
  │   ├── TaskList (recherche, tri, pagination)
  │   ├── TaskCreate (formulaire reactif)
  │   ├── TaskDetails (lecture seule)
  │   ├── TaskEdit (formulaire reactif)
  │   ├── TaskAssignments (affectation ressources)
  │   └── TaskDependencies (gestion dependances)
  ├── Users Module
  │   ├── UserList (recherche, tri, pagination)
  │   ├── UserCreate (formulaire reactif)
  │   └── UserEdit (formulaire reactif)
  └── Shared
      ├── ConfirmDialog
      └── Pagination
```

**Patterns utilises :**
- **Standalone Components** : Pas de NgModules, chaque composant declare ses imports
- **Reactive Forms** : Utilisation de `FormBuilder` avec validation
- **Observable Pattern** : RxJS pour les flux de donnees (vm$ pattern)
- **Service Injection** : Services `providedIn: 'root'` injectes via le constructeur
- **DTO Pattern** : Interfaces TypeScript alignees avec les DTOs du backend

---

## Pre-requis

- **Node.js 18+** installe
- **npm 9+** installe
- **Backend API** en cours d'execution sur `http://localhost:8082`
- **Port 4200** disponible (developpement)

---

## Installation et demarrage

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd fr-main
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Verifier la configuration API

Le fichier `src/environments/environment.ts` doit pointer vers le backend :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api'
};
```

### 4. Demarrer le serveur de developpement

```bash
npm start
```

L'application est accessible sur : `http://localhost:4200`

---

## Configuration

### Environnement (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api'
};
```

### Application (`src/app/app.config.ts`)

Providers configures :
- `provideRouter(routes)` : Systeme de routing
- `provideHttpClient()` : Client HTTP pour les appels API
- `provideZonelessChangeDetection()` ou `provideZoneChangeDetection()` : Detection de changements

### Build (`angular.json`)

| Parametre | Valeur |
|-----------|--------|
| Build output | `dist/ppm_front` |
| Budget initial | 500KB warning, 1MB error |
| Budget composant | 4KB warning, 8KB error |
| Source maps (dev) | Oui |
| Optimisation (prod) | Oui |

---

## Routing (Navigation)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Page d'accueil avec acces rapide |
| `/projects` | `ProjectList` | Liste des projets |
| `/projects/new` | `ProjectCreate` | Creer un projet |
| `/projects/:id` | `ProjectDetails` | Details d'un projet + fichiers |
| `/projects/:id/edit` | `ProjectEdit` | Modifier un projet |
| `/projects/:id/gantt` | `Gantt` | Diagramme de Gantt interactif |
| `/portefeuilles` | `PortefeuilleList` | Liste des portefeuilles |
| `/portefeuilles/:id` | `PortefeuilleDetails` | Details d'un portefeuille |
| `/users` | `UserListComponent` | Liste des utilisateurs |
| `/users/new` | `UserCreate` | Creer un utilisateur |
| `/users/:id/edit` | `UserEdit` | Modifier un utilisateur |
| `/tasks` | `TaskList` | Liste des taches (par projet) |
| `/tasks/create` | `TaskCreate` | Creer une tache |
| `/tasks/:id` | `TaskDetails` | Details d'une tache |
| `/tasks/:id/edit` | `TaskEdit` | Modifier une tache |
| `/tasks/:id/assignments` | `TaskAssignments` | Affectations de la tache |
| `/tasks/:id/dependencies` | `TaskDependencies` | Dependances de la tache |

### Navigation persistante

La **navbar** est visible sur toutes les pages et comprend :
- Logo BIAT Innovation & Technology
- Liens : Home, Projects, Portfolios, Tasks, Users
- Mise en surbrillance du lien actif (`routerLinkActive`)
- Menu hamburger responsive pour mobile
- Icones SVG pour chaque lien

Le **footer** affiche le branding BIAT et le copyright.

---

## Modeles de donnees

### ProjectDTO (`models/project.ts`)

```typescript
interface ProjectDTO {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;              // YYYY-MM-DD
  endDate?: string | null;
  active: boolean;
  projectManagerId: number;
  portfolioName?: string | null;
  programName?: string | null;
  subProgramName?: string | null;
  objective?: string | null;
  calendarName?: string | null;
  baselineStartDate?: string | null;
  baselineEndDate?: string | null;
  progress?: number | null;       // 0-100
  portefeuilleId?: number | null;
}
```

### TaskDTO (`models/task.ts`)

```typescript
interface TaskDTO {
  id?: number;
  name: string;
  description?: string | null;
  projectId: number;
  parentTaskId?: number | null;   // Hierarchie WBS
  wbsNumber?: string | null;
  mode?: string | null;
  durationDays?: number | null;
  workHours?: number | null;
  baselineDurationDays?: number | null;
  baselineStartDate?: string | null;
  baselineEndDate?: string | null;
  actualWorkHours?: number | null;
  calendarName?: string | null;
  sortOrder?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: TaskStatus | null;     // NOT_STARTED | IN_PROGRESS | DONE | BLOCKED
  progress?: number | null;       // 0-100
  active?: boolean;
  createdAt?: string;
}
```

### UserDTO (`models/user.ts`)

```typescript
interface UserDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;                     // PM | PMO | DEV | QA | DEVOPS | RH | ADMIN
  weeklyCapacity: number;
  active?: boolean;
  createdAt?: string;
}

type CreateUserPayload = UserDTO & { password: string };
type UpdateUserPayload = Partial<CreateUserPayload>;
```

### TaskAssignmentDTO (`models/task-assignment.ts`)

```typescript
interface TaskAssignmentDTO {
  id?: number;
  taskId: number;
  userId: number;
  assignedHours: number;
  active?: boolean;
  createdAt?: string;
}
```

### TaskDependencyDTO (`models/task-dependency.ts`)

```typescript
interface TaskDependencyDTO {
  id?: number;
  predecessorTaskId: number;
  successorTaskId: number;
  type?: DependencyType;          // FS | SS | FF | SF
  createdAt?: string;
}
```

### PortefeuilleDTO (`models/portefeuille.ts`)

```typescript
interface PortefeuilleDTO {
  id: number;
  nom: string;
  description?: string | null;
  projects: ProjectDTO[];
}

interface PortefeuilleCreateUpdateRequest {
  nom: string;
  description?: string | null;
}
```

---

## Services HTTP

Tous les services utilisent `HttpClient` et sont `providedIn: 'root'`. L'URL de base est configuree dans `environment.apiUrl`.

### ProjectService (`services/project-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `getAllProjects()` | GET | `/projects` | `Observable<ProjectDTO[]>` |
| `getProjectById(id)` | GET | `/projects/:id` | `Observable<ProjectDTO>` |
| `getByManager(managerId)` | GET | `/projects/manager/:id` | `Observable<ProjectDTO[]>` |
| `createProject(payload)` | POST | `/projects` | `Observable<ProjectDTO>` |
| `updateProject(id, payload)` | PUT | `/projects/:id` | `Observable<ProjectDTO>` |
| `deactivateProject(id)` | DELETE | `/projects/:id` | `Observable<void>` |

### TaskService (`services/task-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `createTask(dto)` | POST | `/tasks` | `Observable<TaskDTO>` |
| `getTasksByProject(projectId)` | GET | `/tasks/project/:id` | `Observable<TaskDTO[]>` |
| `getTaskById(id)` | GET | `/tasks/:id` | `Observable<TaskDTO>` |
| `updateTask(id, dto)` | PUT | `/tasks/:id` | `Observable<TaskDTO>` |
| `deactivateTask(id)` | DELETE | `/tasks/:id` | `Observable<void>` |

### UserService (`services/user-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `getAllUsers()` | GET | `/users` | `Observable<UserDTO[]>` |
| `getUserById(id)` | GET | `/users/:id` | `Observable<UserDTO>` |
| `getUserByEmail(email)` | GET | `/users/email/:email` | `Observable<UserDTO>` |
| `createUser(payload)` | POST | `/users` | `Observable<any>` |
| `updateUser(id, payload)` | PUT | `/users/:id` | `Observable<any>` |
| `deactivateUser(id)` | DELETE | `/users/:id` | `Observable<void>` |

### TaskAssignmentService (`services/task-assignment-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `getByTask(taskId)` | GET | `/assignments/task/:id` | `Observable<TaskAssignmentDTO[]>` |
| `getByUser(userId)` | GET | `/assignments/user/:id` | `Observable<TaskAssignmentDTO[]>` |
| `create(dto)` | POST | `/assignments` | `Observable<TaskAssignmentDTO>` |
| `updateHours(id, hours)` | PUT | `/assignments/:id/hours/:h` | `Observable<TaskAssignmentDTO>` |
| `deactivate(id)` | DELETE | `/assignments/:id` | `Observable<void>` |

### TaskDependencyService (`services/task-dependency-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `getPredecessors(taskId)` | GET | `/dependencies/predecessors/:id` | `Observable<TaskDependencyDTO[]>` |
| `getSuccessors(taskId)` | GET | `/dependencies/successors/:id` | `Observable<TaskDependencyDTO[]>` |
| `create(req)` | POST | `/dependencies` | `Observable<TaskDependencyDTO>` |
| `delete(id)` | DELETE | `/dependencies/:id` | `Observable<void>` |
| `getByProject(projectId)` | GET | `/dependencies/project/:id` | `Observable<TaskDependencyDTO[]>` |

### PortefeuilleService (`services/portefeuille-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `getAll()` | GET | `/portefeuilles` | `Observable<PortefeuilleDTO[]>` |
| `getById(id)` | GET | `/portefeuilles/:id` | `Observable<PortefeuilleDTO>` |
| `create(payload)` | POST | `/portefeuilles` | `Observable<PortefeuilleDTO>` |
| `update(id, payload)` | PUT | `/portefeuilles/:id` | `Observable<PortefeuilleDTO>` |
| `delete(id)` | DELETE | `/portefeuilles/:id` | `Observable<void>` |
| `addProject(pfId, projId)` | POST | `/portefeuilles/:id/projects/:pid` | `Observable<PortefeuilleDTO>` |
| `removeProject(pfId, projId)` | DELETE | `/portefeuilles/:id/projects/:pid` | `Observable<PortefeuilleDTO>` |
| `getUnassignedProjects()` | GET | `/portefeuilles/unassigned-projects` | `Observable<ProjectDTO[]>` |

### FileService (`services/file-service.ts`)

| Methode | HTTP | Endpoint | Retour |
|---------|------|----------|--------|
| `uploadFile(projId, subdir, file)` | POST | `/projects/:id/files` (FormData) | `Observable<{filename: string}>` |
| `listFiles(projId, subdir)` | GET | `/projects/:id/files?subdirectory=` | `Observable<string[]>` |

**Sous-dossiers disponibles :** `fonctions`, `P.V`, `contrats`

---

## Composants - Vue d'ensemble

| Composant | Route | Fonctionnalites principales |
|-----------|-------|----------------------------|
| **HomePage** | `/` | Dashboard avec 4 cartes d'acces rapide |
| **ProjectList** | `/projects` | Recherche, tri, pagination, import Excel, suppression |
| **ProjectCreate** | `/projects/new` | Formulaire reactif avec validation |
| **ProjectDetails** | `/projects/:id` | Affichage details + upload/liste fichiers |
| **ProjectEdit** | `/projects/:id/edit` | Formulaire pre-rempli, modification |
| **Gantt** | `/projects/:id/gantt` | Diagramme de Gantt interactif complet |
| **PortefeuilleList** | `/portefeuilles` | Liste, recherche, tri, creation inline |
| **PortefeuilleDetails** | `/portefeuilles/:id` | Edition inline, gestion projets, creation projet |
| **TaskList** | `/tasks` | Liste par projet, recherche, tri, pagination |
| **TaskCreate** | `/tasks/create` | Formulaire tache avec champs Gantt |
| **TaskDetails** | `/tasks/:id` | Vue lecture seule |
| **TaskEdit** | `/tasks/:id/edit` | Modification tache |
| **TaskAssignments** | `/tasks/:id/assignments` | Affectation utilisateurs, heures |
| **TaskDependencies** | `/tasks/:id/dependencies` | Predecesseurs/successeurs, types FS/SS/FF/SF |
| **UserList** | `/users` | Liste, recherche, tri, pagination |
| **UserCreate** | `/users/new` | Formulaire creation utilisateur |
| **UserEdit** | `/users/:id/edit` | Modification utilisateur |

---

## Composants - Detail par module

### Module Projets

#### ProjectList
- **Recherche** : Filtre sur nom, description, dates, portfolio, programme, objectif
- **Tri** : Par nom (asc/desc), date debut (asc/desc), progression, statut actif
- **Pagination** : 6 elements par page
- **Import Excel** : Parse un fichier `.xlsx` et cree les projets via l'API
- **Actions** : Double-clic pour editer, bouton supprimer avec confirmation
- **Composants utilises** : `ConfirmDialog`, `Pagination`

#### ProjectCreate / ProjectEdit
- **Champs obligatoires** : name (min 2 car.), startDate, projectManagerId
- **Champs optionnels** : description, endDate, portfolioName, programName, subProgramName, objective, calendarName, baselineStartDate, baselineEndDate, progress (0-100), active
- **Validation** : Validators Angular (required, minLength, min, max)
- **Chef de projet** : Liste deroulante chargee depuis l'API users

#### ProjectDetails
- **Pattern reactif** : Observable `vm$` avec loading/error states
- **Fichiers** : Selection de sous-dossier, upload, liste des fichiers existants
- **Operateurs RxJS** : `distinctUntilChanged`, `switchMap`, `shareReplay`

### Module Taches

#### TaskList
- **Filtre par projet** : Saisie manuelle du projectId
- **Recherche** : Filtre sur nom, description, statut, dates, WBS, progression, heures, duree
- **Tri** : Par nom, date debut, progression, duree, statut (ordre : BLOCKED > IN_PROGRESS > NOT_STARTED > DONE)
- **Pagination** : 6 elements par page
- **Actions** : Liens vers details, edition, affectations, dependances

#### TaskCreate / TaskEdit
- **Champs obligatoires** : projectId, name (min 2 car.), durationDays (min 0.1)
- **Champs Gantt** : wbsNumber, mode, workHours, sortOrder, baselineDurationDays, baselineStartDate, baselineEndDate
- **Statut** : Dropdown (NOT_STARTED, IN_PROGRESS, DONE, BLOCKED)
- **Progression** : Slider 0-100

#### TaskAssignments
- **Affectations existantes** : Liste avec details utilisateur
- **Ajouter** : Selection utilisateur + heures assignees
- **Modifier** : Edition inline des heures
- **Supprimer** : Desactivation

#### TaskDependencies
- **Predecesseurs** : Liste des taches dont depend la tache courante
- **Successeurs** : Liste des taches qui dependent de la tache courante
- **Ajouter** : Selection direction (predecesseur/successeur), ID tache, type (FS, SS, FF, SF)
- **Supprimer** : Suppression directe

### Module Utilisateurs

#### UserList
- **Recherche** : Filtre sur prenom, nom, email, role, capacite, statut actif
- **Tri** : Par nom (asc/desc), role, capacite, statut actif
- **Pagination** : 6 elements par page
- **Actions** : Double-clic pour editer, suppression avec confirmation

#### UserCreate / UserEdit
- **Champs** : firstName (min 2), lastName (min 2), email (valide), role (dropdown), weeklyCapacity (min 0), password (requis a la creation), active
- **Roles disponibles** : PM, PMO, DEV, QA, DEVOPS, RH, ADMIN

### Module Portefeuilles

#### PortefeuilleList
- **Recherche** : Filtre sur nom, description, nombre de projets
- **Tri** : Par nom (asc/desc), nombre de projets (asc/desc)
- **Creation inline** : Formulaire deroulant directement dans la liste
- **Actions** : Double-clic pour ouvrir les details, suppression avec confirmation

#### PortefeuilleDetails
- **Edition inline** : Modifier nom et description directement
- **Projets associes** : Liste des projets du portefeuille, retrait possible
- **Ajouter un projet existant** : Dropdown des projets non affectes
- **Creer un nouveau projet** : Formulaire complet directement dans la page

---

## Diagramme de Gantt interactif

Le composant Gantt (`components/gantt/`) est le composant le plus complexe de l'application. Il replique les fonctionnalites cles de MS Project.

### Fonctionnalites

| Fonctionnalite | Description |
|----------------|-------------|
| **Arbre hierarchique** | Taches parent-enfant avec indentation WBS |
| **3 niveaux de zoom** | Jour (36px/jour), Semaine (12px/jour), Mois (3px/jour) |
| **Chemin critique** | Algorithme CPM (Critical Path Method) avec passe avant/arriere |
| **Drag & drop** | Deplacer les barres de tache pour changer les dates |
| **Redimensionnement** | Etirer les barres pour modifier la duree |
| **Baselines** | Affichage des barres de baseline sous les barres actuelles |
| **Collapse/Expand** | Replier/deplier les groupes de taches |
| **Scroll synchronise** | Grille et timeline scrollent ensemble |
| **Splitter** | Redimensionner grille/timeline par drag |
| **Scroll to today** | Bouton pour centrer sur la date du jour |
| **Zoom to fit** | Ajuster le zoom pour voir toutes les taches |
| **Selection** | Cliquer sur une tache pour la selectionner |
| **Edition inline** | Modifier les cellules directement dans la grille |
| **Ajout de taches** | Creer de nouvelles taches depuis le Gantt |
| **Fleches dependances** | Visualisation des liens FS, SS, FF, SF |
| **Week-ends** | Bandes grises pour les week-ends (zoom jour) |
| **Couleurs statut** | Barres colorees selon le statut de la tache |

### Sous-composants

| Composant | Role |
|-----------|------|
| `GanttGrid` | Grille a gauche (colonnes : WBS, Nom, Debut, Fin, Duree, Progression) |
| `GanttTimeline` | Zone graphique des barres de tache et fleches |
| `GanttTimescale` | En-tete temporel (annees/mois, mois/semaines, jours) |

### Utilitaires (`gantt.utils.ts`)

30+ fonctions utilitaires dont :
- **Dates** : `daysBetween`, `addDays`, `startOfDay`, `startOfWeek`, `startOfMonth`, `isWeekend`, `getISOWeek`
- **Hierarchie** : `buildTaskTree`, `flattenTree`
- **Rendu** : `dateToX`, `xToDate`, `computeBar`, `computeArrow`, `generateTimescale`, `generateGridLines`, `getWeekendRanges`
- **Chemin critique** : `computeCriticalPath` (algorithme CPM complet)
- **Couleurs** : `getStatusColor`, `getProgressColor`
- **Formes SVG** : `milestonePath`, `summaryBarPath`

### Constantes visuelles

```
ROW_HEIGHT     = 36px    // Hauteur d'une ligne
BAR_HEIGHT     = 22px    // Hauteur d'une barre de tache
MILESTONE_SIZE = 12px    // Taille du losange milestone
INDENT_PX      = 20px    // Indentation par niveau de hierarchie
```

---

## Composants partages

### ConfirmDialog

Boite de dialogue modale de confirmation.

**Inputs :**
| Input | Type | Description |
|-------|------|-------------|
| `visible` | boolean | Afficher/masquer |
| `title` | string | Titre de la boite |
| `message` | string | Message de confirmation |
| `confirmLabel` | string | Texte du bouton confirmer |
| `cancelLabel` | string | Texte du bouton annuler |

**Outputs :**
| Output | Type | Description |
|--------|------|-------------|
| `confirmed` | EventEmitter | Emis lors de la confirmation |
| `cancelled` | EventEmitter | Emis lors de l'annulation |

### Pagination

Controles de pagination reutilisables.

**Inputs :**
| Input | Type | Description |
|-------|------|-------------|
| `totalItems` | number | Nombre total d'elements |
| `pageSize` | number | Elements par page |
| `currentPage` | number | Page courante |

**Outputs :**
| Output | Type | Description |
|--------|------|-------------|
| `pageChange` | EventEmitter\<number\> | Emis lors du changement de page |

---

## Systeme de design et styles

### Palette de couleurs (BIAT Brand)

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--color-primary` | `#00687B` | Couleur principale (teal fonce) |
| `--color-primary-light` | `#00798f` | Variante claire |
| `--color-primary-dark` | `#004d5a` | Variante foncee |
| `--color-accent` | `#42b7d4` | Couleur d'accent (cyan) |
| `--color-accent-light` | `#5cc5dc` | Accent clair |
| `--color-accent-dark` | `#2ea5bd` | Accent fonce |
| `--color-bg` | `#f8fafb` | Fond de page |
| `--color-surface` | `#ffffff` | Fond de carte |
| `--color-border` | `#e1e8ed` | Bordures |
| `--color-text-primary` | `#1a2633` | Texte principal |
| `--color-text-secondary` | `#5a6c7d` | Texte secondaire |
| `--color-success` | `#10b981` | Succes (vert) |
| `--color-warning` | `#f59e0b` | Avertissement (orange) |
| `--color-error` | `#ef4444` | Erreur (rouge) |
| `--color-info` | `#42b7d4` | Information (cyan) |

### Composants CSS globaux

- **Boutons** : `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`, `.btn-sm`, `.btn-lg`
- **Formulaires** : Inputs stylises avec focus accent, labels, form-group, form-error
- **Cards** : `.card`, `.card-header`, `.card-body`, `.card-footer` avec effet elevation au hover
- **Badges** : `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge-primary`
- **Containers** : `.container` (1200px), `.container-sm` (800px)
- **Grid** : `.grid`, `.grid-cols-2`, `.grid-cols-3` (responsive)
- **Utilitaires** : `.text-center`, `.text-muted`, `.flex`, `.gap-md`, `.mt-lg`, etc.
- **Animations** : `fadeIn`, `slideIn`, `pulse`
- **Scrollbar** : Style personnalise (WebKit)

### Design responsive

- **Breakpoint** : 768px
- **Mobile** : Menu hamburger, grilles en colonne unique, footer empile
- **Desktop** : Navigation horizontale, grilles multi-colonnes

---

## Gestion des fichiers projet

La page de details d'un projet (`/projects/:id`) permet de gerer les fichiers :

1. **Selection du sous-dossier** : `fonctions`, `P.V` (proces-verbaux), `contrats`
2. **Upload de fichier** : Selection + envoi via FormData
3. **Liste des fichiers** : Affichage des fichiers existants dans le sous-dossier selectionne

Les fichiers sont stockes sur le serveur backend dans `./projects/<nom-projet>/<sous-dossier>/`.

---

## Import Excel

Le composant `ProjectList` supporte l'import de projets depuis un fichier Excel (`.xlsx`) :

1. L'utilisateur selectionne un fichier Excel
2. La librairie `xlsx` (SheetJS) parse le fichier
3. Chaque ligne est convertie en objet `CreateProjectRequest`
4. Les projets sont crees sequentiellement via l'API
5. La liste est rafraichie apres l'import

**Colonnes Excel attendues :** name, description, startDate, endDate, projectManagerId, etc.

---

## Structure des dossiers

```
fr-main/
├── angular.json                          (Configuration Angular CLI)
├── tsconfig.json                         (Configuration TypeScript)
├── tsconfig.app.json                     (Config TS application)
├── tsconfig.spec.json                    (Config TS tests)
├── package.json                          (Dependances et scripts)
├── package-lock.json                     (Lockfile npm)
├── public/
│   └── logo-biat.webp                    (Logo BIAT)
├── src/
│   ├── index.html                        (Page HTML racine)
│   ├── main.ts                           (Bootstrap Angular)
│   ├── styles.css                        (Styles globaux + design system)
│   ├── environments/
│   │   └── environment.ts                (Configuration environnement)
│   └── app/
│       ├── app.ts                        (Composant racine)
│       ├── app.html                      (Template : navbar + outlet + footer)
│       ├── app.css                       (Styles layout principal)
│       ├── app.routes.ts                 (Table de routage)
│       ├── app.config.ts                 (Configuration providers)
│       ├── models/
│       │   ├── project.ts                (ProjectDTO)
│       │   ├── project.requests.ts       (CreateProjectRequest, UpdateProjectRequest)
│       │   ├── task.ts                   (TaskDTO, TaskStatus)
│       │   ├── user.ts                   (UserDTO, Role, CreateUserPayload)
│       │   ├── task-assignment.ts        (TaskAssignmentDTO)
│       │   ├── task-dependency.ts        (TaskDependencyDTO, DependencyType)
│       │   └── portefeuille.ts           (PortefeuilleDTO, PortefeuilleCreateUpdateRequest)
│       ├── services/
│       │   ├── project-service.ts        (CRUD projets)
│       │   ├── task-service.ts           (CRUD taches)
│       │   ├── user-service.ts           (CRUD utilisateurs)
│       │   ├── task-assignment-service.ts (Affectations)
│       │   ├── task-dependency-service.ts (Dependances)
│       │   ├── portefeuille-service.ts   (Portefeuilles)
│       │   └── file-service.ts           (Upload/liste fichiers)
│       └── components/
│           ├── home/                     (Page d'accueil)
│           ├── project-list/             (Liste des projets)
│           ├── project-create/           (Creation projet)
│           ├── project-details/          (Details + fichiers)
│           ├── project-edit/             (Edition projet)
│           ├── gantt/                    (Diagramme de Gantt)
│           ├── portefeuille-list/        (Liste portefeuilles)
│           ├── portefeuille-details/     (Details portefeuille)
│           ├── task-list/                (Liste taches)
│           ├── task-create/              (Creation tache)
│           ├── task-details/             (Details tache)
│           ├── task-edit/                (Edition tache)
│           ├── task-assignments/         (Affectations)
│           ├── task-dependencies/        (Dependances)
│           ├── user-list/                (Liste utilisateurs)
│           ├── user-create/              (Creation utilisateur)
│           ├── user-edit/                (Edition utilisateur)
│           ├── confirm-dialog/           (Dialog confirmation)
│           └── pagination/               (Pagination)
└── dist/                                 (Build output)
```

---

## Build et deploiement

### Build de production

```bash
npm run build
```

Les fichiers sont generes dans `dist/ppm_front/browser/`.

### Serveur de developpement avec watch

```bash
npm run watch
```

---

## Scripts disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| `start` | `ng serve` | Demarrer en mode developpement (port 4200) |
| `build` | `ng build` | Build de production |
| `watch` | `ng build --watch --configuration development` | Build avec surveillance |
| `test` | `ng test` | Lancer les tests unitaires |

---

## Metriques du projet

| Metrique | Valeur |
|----------|--------|
| Composants Angular | 19 (dont 3 sous-composants Gantt) |
| Services HTTP | 7 |
| Modeles TypeScript | 7 fichiers |
| Routes | 17 |
| Composants partages | 2 (ConfirmDialog, Pagination) |
| Fonctions utilitaires Gantt | 30+ |
| Fichiers source total | ~70+ |
