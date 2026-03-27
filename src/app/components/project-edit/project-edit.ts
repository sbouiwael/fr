import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProjectService } from '../../services/project-service';
import { UserService } from '../../services/user-service';
import { UserDTO } from '../../models/user';
import { UpdateProjectRequest } from '../../models/project.requests';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.css'],
})
export class ProjectEdit implements OnInit {
  users: UserDTO[] = [];
  loading = false;
  loadingData = true;
  errorMsg = '';
  form: FormGroup;
  projectId!: number;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      projectManagerId: [null, [Validators.required, Validators.min(1)]],
      active: [true],
      portfolioName: [''],
      programName: [''],
      subProgramName: [''],
      objective: [''],
      calendarName: [''],
      baselineStartDate: [''],
      baselineEndDate: [''],
      progress: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    this.userService.getAllUsers().subscribe({
      next: (data) => (this.users = (data ?? []).filter((u) => u.active)),
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Cannot load users';
      },
    });

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.form.patchValue({
          name: project.name,
          description: project.description ?? '',
          startDate: project.startDate,
          endDate: project.endDate ?? '',
          projectManagerId: project.projectManagerId,
          active: project.active,
          portfolioName: project.portfolioName ?? '',
          programName: project.programName ?? '',
          subProgramName: project.subProgramName ?? '',
          objective: project.objective ?? '',
          calendarName: project.calendarName ?? '',
          baselineStartDate: project.baselineStartDate ?? '',
          baselineEndDate: project.baselineEndDate ?? '',
          progress: project.progress ?? 0,
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
        this.errorMsg = 'Error loading project data';
      },
    });
  }

  submit(): void {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const v = this.form.value;

    const payload: UpdateProjectRequest = {
      name: String(v.name).trim(),
      description: v.description ? String(v.description).trim() : null,
      startDate: v.startDate,
      endDate: v.endDate ? v.endDate : null,
      projectManagerId: Number(v.projectManagerId),
      active: !!v.active,
      portfolioName: v.portfolioName ? String(v.portfolioName).trim() : null,
      programName: v.programName ? String(v.programName).trim() : null,
      subProgramName: v.subProgramName ? String(v.subProgramName).trim() : null,
      objective: v.objective ? String(v.objective).trim() : null,
      calendarName: v.calendarName ? String(v.calendarName).trim() : null,
      baselineStartDate: v.baselineStartDate ? v.baselineStartDate : null,
      baselineEndDate: v.baselineEndDate ? v.baselineEndDate : null,
      progress: v.progress !== null && v.progress !== undefined ? Number(v.progress) : null,
    };

    this.projectService.updateProject(this.projectId, payload).subscribe({
      next: () => this.router.navigateByUrl('/projects'),
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMsg =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Update failed');
      },
    });
  }
}
