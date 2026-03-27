import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { ProjectService } from '../../services/project-service';
import { FileService } from '../../services/file-service';
import { ProjectDTO } from '../../models/project';

type Vm = {
  loading: boolean;
  errorMessage: string;
  projectId: number | null;
  project: ProjectDTO | null;
};

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.css'],
})
export class ProjectDetails {
  vm$: Observable<Vm>;

  // File management state
  subdirectories = ['fonctions', 'P.V', 'contrats'];
  selectedSubdirectory = 'fonctions';
  files: string[] = [];
  uploadMessage = '';
  uploadError = '';
  private currentProjectId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fileService: FileService
  ) {
    this.vm$ = this.route.paramMap.pipe(
      map((pm) => {
        const id = Number(pm.get('id'));
        return Number.isFinite(id) && id > 0 ? id : null;
      }),
      distinctUntilChanged(),
      switchMap((projectId) => {
        if (projectId === null) {
          return of<Vm>({
            loading: false,
            errorMessage: 'Invalid project id in URL.',
            projectId: null,
            project: null,
          });
        }

        return this.projectService.getProjectById(projectId).pipe(
          map((project) => ({
            loading: false,
            errorMessage: '',
            projectId,
            project: project ?? null,
          })),
          tap((vm) => {
            if (vm.project && vm.projectId) {
              this.currentProjectId = vm.projectId;
              this.loadFiles();
            }
          }),
          startWith<Vm>({ loading: true, errorMessage: '', projectId, project: null }),
          catchError((err) => {
            console.error(err);
            const msg = err?.status ? `HTTP ${err.status} - ${err.statusText}` : 'Error loading project details.';
            return of<Vm>({ loading: false, errorMessage: msg, projectId, project: null });
          })
        );
      }),
      shareReplay(1)
    );
  }

  loadFiles(): void {
    if (!this.currentProjectId) return;
    this.fileService.listFiles(this.currentProjectId, this.selectedSubdirectory).subscribe({
      next: (files) => this.files = files,
      error: () => this.files = [],
    });
  }

  onSubdirectoryChange(): void {
    this.uploadMessage = '';
    this.uploadError = '';
    this.loadFiles();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.currentProjectId) return;

    const file = input.files[0];
    this.uploadMessage = '';
    this.uploadError = '';

    this.fileService.uploadFile(this.currentProjectId, this.selectedSubdirectory, file).subscribe({
      next: (res) => {
        this.uploadMessage = `File "${res.filename}" uploaded successfully.`;
        this.loadFiles();
      },
      error: () => {
        this.uploadError = 'Failed to upload file.';
      },
    });

    input.value = '';
  }
}