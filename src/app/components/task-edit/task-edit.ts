import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TaskService } from '../../services/task-service';
import { ProjectService } from '../../services/project-service';
import { TaskDTO } from '../../models/task';
import { ProjectDTO } from '../../models/project';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-edit.html',
  styleUrls: ['./task-edit.css'],
})
export class TaskEdit implements OnInit {
  form: FormGroup;
  errorMessage = '';
  loading = false;
  loadingData = true;
  taskId!: number;

  projects: ProjectDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      projectId: [null, [Validators.required, Validators.min(1)]],
      parentTaskId: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      wbsNumber: [''],
      mode: ['TASK'],
      durationDays: [1.0, [Validators.required, Validators.min(0.1)]],
      workHours: [null, [Validators.min(0)]],
      sortOrder: [0, [Validators.min(0)]],
      startDate: [''],
      endDate: [''],
      status: ['NOT_STARTED'],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      active: [true],
    });
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));

    this.projectService.getAllProjects().subscribe({
      next: (data) => (this.projects = (data ?? []).filter(p => p.active)),
      error: (err) => console.error(err),
    });

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.form.patchValue({
          projectId: task.projectId,
          parentTaskId: task.parentTaskId ?? null,
          name: task.name,
          description: task.description ?? '',
          wbsNumber: task.wbsNumber ?? '',
          mode: task.mode ?? 'TASK',
          durationDays: task.durationDays ?? 1.0,
          workHours: task.workHours ?? null,
          sortOrder: task.sortOrder ?? 0,
          startDate: task.startDate ?? '',
          endDate: task.endDate ?? '',
          status: task.status ?? 'NOT_STARTED',
          progress: task.progress ?? 0,
          active: task.active ?? true,
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
        this.errorMessage = 'Error loading task data';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const v = this.form.value;

    const payload: TaskDTO = {
      projectId: Number(v.projectId),
      parentTaskId: v.parentTaskId ? Number(v.parentTaskId) : null,
      name: String(v.name).trim(),
      description: v.description ? String(v.description).trim() : null,
      wbsNumber: v.wbsNumber ? String(v.wbsNumber).trim() : null,
      mode: v.mode ? String(v.mode).trim() : 'TASK',
      durationDays: v.durationDays !== null && v.durationDays !== undefined ? Number(v.durationDays) : 1.0,
      workHours: v.workHours !== null && v.workHours !== undefined && v.workHours !== '' ? Number(v.workHours) : null,
      sortOrder: v.sortOrder !== null && v.sortOrder !== undefined ? Number(v.sortOrder) : 0,
      startDate: v.startDate ? v.startDate : null,
      endDate: v.endDate ? v.endDate : null,
      status: v.status,
      progress: Number(v.progress),
      active: !!v.active,
    };

    this.taskService.updateTask(this.taskId, payload).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Error updating task');
      },
    });
  }
}
