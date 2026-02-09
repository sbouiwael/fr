import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { TaskAssignmentService } from '../../services/task-assignment-service';
import { TaskAssignmentDTO } from '../../models/task-assignment';

@Component({
  selector: 'app-task-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './task-assignments.html',
  styleUrl: './task-assignments.css',
})
export class TaskAssignments implements OnInit {
  taskId!: number;

  assignments: TaskAssignmentDTO[] = [];
  errorMessage = '';
  loading = false;

  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private assignmentService: TaskAssignmentService
  ) {
    this.form = this.fb.group({
      userId: [null, [Validators.required, Validators.min(1)]],
      assignedHours: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.taskId) {
      this.errorMessage = 'Invalid task id';
      return;
    }
    this.load();
  }

  load(): void {
    this.assignmentService.getByTask(this.taskId).subscribe({
      next: (data) => (this.assignments = data ?? []),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error loading assignments';
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

    const userId = Number(this.form.value.userId);
    const assignedHours = Number(this.form.value.assignedHours);

    const payload: TaskAssignmentDTO = {
      taskId: this.taskId,
      userId,
      assignedHours,
      active: true,
    };

    this.assignmentService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset({ userId: null, assignedHours: 0 });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error creating assignment';
      },
    });
  }

  updateHours(a: TaskAssignmentDTO, hoursStr: string): void {
    if (!a.id) return;
    const hours = Number(hoursStr);
    if (Number.isNaN(hours) || hours < 0) return;

    this.assignmentService.updateHours(a.id, hours).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error updating hours';
      },
    });
  }

  deactivate(a: TaskAssignmentDTO): void {
    if (!a.id) return;
    this.assignmentService.deactivate(a.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deactivating assignment';
      },
    });
  }
}
