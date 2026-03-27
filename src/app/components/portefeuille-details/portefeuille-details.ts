import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PortefeuilleService } from '../../services/portefeuille-service';
import { ProjectService } from '../../services/project-service';
import { PortefeuilleDTO } from '../../models/portefeuille';
import { ProjectDTO } from '../../models/project';
import { CreateProjectRequest } from '../../models/project.requests';

@Component({
  selector: 'app-portefeuille-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './portefeuille-details.html',
  styleUrls: ['./portefeuille-details.css'],
})
export class PortefeuilleDetails {
  portefeuille: PortefeuilleDTO | null = null;
  loading = true;
  errorMessage = '';
  portefeuilleId: number | null = null;

  // Editing
  editing = false;
  editNom = '';
  editDescription = '';

  // Unassigned projects
  unassignedProjects: ProjectDTO[] = [];
  selectedProjectId: number | null = null;

  // Inline create project form
  showCreateProject = false;
  newProjectName = '';
  newProjectDescription = '';
  newProjectStartDate = '';
  newProjectManagerId: number | null = null;
  creatingProject = false;

  constructor(
    private route: ActivatedRoute,
    private portefeuilleService: PortefeuilleService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.portefeuilleId = idParam ? Number(idParam) : null;

    if (this.portefeuilleId && this.portefeuilleId > 0) {
      this.loadPortefeuille();
      this.loadUnassignedProjects();
    } else {
      this.loading = false;
      this.errorMessage = 'Invalid portfolio id in URL.';
    }
  }

  loadPortefeuille(): void {
    if (!this.portefeuilleId) return;

    this.loading = true;
    this.portefeuilleService.getById(this.portefeuilleId).subscribe({
      next: (data) => {
        this.portefeuille = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.status ? `HTTP ${err.status} - ${err.statusText}` : 'Error loading portfolio details.';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  loadUnassignedProjects(): void {
    this.portefeuilleService.getUnassignedProjects().subscribe({
      next: (data) => {
        this.unassignedProjects = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.unassignedProjects = [];
      },
    });
  }

  // Edit portfolio name/description
  startEditing(): void {
    if (!this.portefeuille) return;
    this.editing = true;
    this.editNom = this.portefeuille.nom;
    this.editDescription = this.portefeuille.description || '';
  }

  cancelEditing(): void {
    this.editing = false;
  }

  saveEditing(): void {
    if (!this.portefeuilleId || !this.editNom.trim()) return;

    this.portefeuilleService.update(this.portefeuilleId, {
      nom: this.editNom.trim(),
      description: this.editDescription.trim() || null,
    }).subscribe({
      next: (updated) => {
        this.portefeuille = updated;
        this.editing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error updating portfolio';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  // Add existing project
  addProject(): void {
    if (!this.portefeuilleId || !this.selectedProjectId) return;

    this.portefeuilleService.addProject(this.portefeuilleId, this.selectedProjectId).subscribe({
      next: (updated) => {
        this.portefeuille = updated;
        this.selectedProjectId = null;
        this.loadUnassignedProjects();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error adding project to portfolio';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  // Remove project from portfolio
  removeProject(projectId: number): void {
    if (!this.portefeuilleId) return;

    this.portefeuilleService.removeProject(this.portefeuilleId, projectId).subscribe({
      next: (updated) => {
        this.portefeuille = updated;
        this.loadUnassignedProjects();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error removing project from portfolio';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  // Create new project directly in this portfolio
  toggleCreateProject(): void {
    this.showCreateProject = !this.showCreateProject;
    if (!this.showCreateProject) {
      this.newProjectName = '';
      this.newProjectDescription = '';
      this.newProjectStartDate = '';
      this.newProjectManagerId = null;
    }
  }

  createProjectInPortfolio(): void {
    if (!this.portefeuilleId || !this.newProjectName.trim() || !this.newProjectStartDate || !this.newProjectManagerId) return;

    this.creatingProject = true;

    const payload: CreateProjectRequest = {
      name: this.newProjectName.trim(),
      description: this.newProjectDescription.trim() || null,
      startDate: this.newProjectStartDate,
      projectManagerId: this.newProjectManagerId,
    };

    this.projectService.createProject(payload).subscribe({
      next: (created) => {
        // Now assign the newly created project to this portfolio
        this.portefeuilleService.addProject(this.portefeuilleId!, created.id).subscribe({
          next: (updated) => {
            this.portefeuille = updated;
            this.creatingProject = false;
            this.showCreateProject = false;
            this.newProjectName = '';
            this.newProjectDescription = '';
            this.newProjectStartDate = '';
            this.newProjectManagerId = null;
            this.loadUnassignedProjects();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.creatingProject = false;
            this.errorMessage = 'Project created but failed to assign to portfolio';
            console.error(err);
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        this.creatingProject = false;
        this.errorMessage = 'Error creating project';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }
}
