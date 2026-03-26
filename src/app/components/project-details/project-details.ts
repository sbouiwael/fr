import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { ProjectService } from '../../services/project-service';
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
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.css'],
})
export class ProjectDetails {
  vm$: Observable<Vm>;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {
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
}