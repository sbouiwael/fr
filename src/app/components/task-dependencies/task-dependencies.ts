import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { TaskDependencyService } from '../../services/task-dependency-service';
import {
  TaskDependencyDTO,
  TaskDependencyCreateRequest,
  DependencyType,
} from '../../models/task-dependency';

type Direction = 'PREDECESSOR' | 'SUCCESSOR';

@Component({
  selector: 'app-task-dependencies',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './task-dependencies.html',
  styleUrl: './task-dependencies.css',
})
export class TaskDependencies implements OnInit {
  taskId!: number;

  predecessors: TaskDependencyDTO[] = [];
  successors: TaskDependencyDTO[] = [];

  errorMessage = '';
  loading = false;

  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private depService: TaskDependencyService
  ) {
    this.form = this.fb.group({
      otherTaskId: [null, [Validators.required, Validators.min(1)]],
      direction: ['PREDECESSOR' as Direction, Validators.required],
      type: ['FS' as DependencyType, Validators.required],
    });
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.taskId = Number(raw);

    if (!Number.isFinite(this.taskId) || this.taskId <= 0) {
      this.errorMessage = 'Invalid task id';
      return;
    }

    this.load();
  }

  load(): void {
    this.errorMessage = '';

    this.depService.getPredecessors(this.taskId).subscribe({
      next: (data) => (this.predecessors = Array.isArray(data) ? data : []),
      error: (err) => {
        console.error(err);
        this.predecessors = [];
        this.errorMessage = 'Error loading predecessors';
      },
    });

    this.depService.getSuccessors(this.taskId).subscribe({
      next: (data) => (this.successors = Array.isArray(data) ? data : []),
      error: (err) => {
        console.error(err);
        this.successors = [];
        this.errorMessage = 'Error loading successors';
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

    const otherTaskId = Number(this.form.value.otherTaskId);
    const direction = String(this.form.value.direction) as Direction;
    const type = this.form.value.type as DependencyType;

    if (!Number.isFinite(otherTaskId) || otherTaskId <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid other task id';
      return;
    }

    const req: TaskDependencyCreateRequest =
      direction === 'PREDECESSOR'
        ? {
            predecessorTaskId: otherTaskId,
            successorTaskId: this.taskId,
            type,
          }
        : {
            predecessorTaskId: this.taskId,
            successorTaskId: otherTaskId,
            type,
          };

    this.depService.create(req).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset({ otherTaskId: null, direction: 'PREDECESSOR', type: 'FS' });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        // si ton backend renvoie message dans err.error.message
        this.errorMessage =
          err?.error?.message ||
          'Error creating dependency (check same project / duplicate / self-dependency)';
      },
    });
  }

  remove(dep: TaskDependencyDTO): void {
    if (!dep?.id) return;

    this.depService.delete(dep.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deleting dependency';
      },
    });
  }
}
