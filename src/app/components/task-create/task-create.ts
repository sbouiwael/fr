import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TaskService } from '../../services/task-service';
import { TaskDTO } from '../../models/task';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-create.html',
  styleUrls: ['./task-create.css'],
})
export class TaskCreate {
  form: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.minLength(5)]],
      durationDays: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['NOT_STARTED'],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      projectId: [1, Validators.required],
      parentTaskId: [null],
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
      name: v.name,
      description: v.description,
      durationDays: Number(v.durationDays),
      startDate: v.startDate,
      endDate: v.endDate,
      status: v.status,
      progress: Number(v.progress),
      projectId: Number(v.projectId),
      parentTaskId: v.parentTaskId ? Number(v.parentTaskId) : null,
      active: true,
    };

    this.taskService.createTask(payload).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error creating task';
      },
    });
  }
}
