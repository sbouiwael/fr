import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ProjectService } from '../../services/project-service';
import { UserService } from '../../services/user-service';
import { UserDTO } from '../../models/user';
import { CreateProjectRequest } from '../../models/project.requests';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-create.html',
  styleUrls: ['./project-create.css'],
})
export class ProjectCreate implements OnInit {
  users: UserDTO[] = [];
  loading = false;
  errorMsg = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      projectManagerId: [null, [Validators.required, Validators.min(1)]],
      active: [true],

      // optional (future proof)
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
    this.userService.getAllUsers().subscribe({
      next: (data) => (this.users = (data ?? []).filter((u) => u.active)),
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Cannot load users';
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

    const payload: CreateProjectRequest = {
      name: String(v.name).trim(),
      description: v.description ? String(v.description).trim() : null,
      startDate: v.startDate,
      endDate: v.endDate ? v.endDate : null,
      projectManagerId: Number(v.projectManagerId),
      active: !!v.active,

      // optional
      portfolioName: v.portfolioName ? String(v.portfolioName).trim() : null,
      programName: v.programName ? String(v.programName).trim() : null,
      subProgramName: v.subProgramName ? String(v.subProgramName).trim() : null,
      objective: v.objective ? String(v.objective).trim() : null,
      calendarName: v.calendarName ? String(v.calendarName).trim() : null,
      baselineStartDate: v.baselineStartDate ? v.baselineStartDate : null,
      baselineEndDate: v.baselineEndDate ? v.baselineEndDate : null,
      progress: v.progress !== null && v.progress !== undefined ? Number(v.progress) : null,
    };

    this.projectService.createProject(payload).subscribe({
      next: () => this.router.navigateByUrl('/projects'),
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMsg =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Create failed');
      },
    });
  }
}