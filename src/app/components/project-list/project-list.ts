import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectService } from '../../services/project-service';
import { ProjectDTO } from '../../models/project';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.css'],
})
export class ProjectList implements OnInit {
  projects: ProjectDTO[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';
    this.projects = [];

    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.projects = [];
        this.errorMessage =
          `HTTP ${err.status} - ${err.statusText} : ` +
          (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        console.error('Error fetching projects:', err);
        this.cdr.detectChanges();
      },
    });
  }

  deactivate(projectId: number): void {
    this.projectService.deactivateProject(projectId).subscribe({
      next: () => this.loadProjects(),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deactivating project';
      },
    });
  }
}