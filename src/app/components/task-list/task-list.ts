import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/task-service';
import { TaskDTO } from '../../models/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
})
export class TaskList implements OnInit {
  tasks: TaskDTO[] = [];
  loading = false;
  errorMessage = '';

  projectId: number | null = null;

  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  loadTasks(): void {
    if (!this.projectId || this.projectId <= 0) {
      this.tasks = [];
      this.errorMessage = 'Please enter a valid Project ID';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.tasks = [];

    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (data) => {
        this.tasks = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.tasks = [];
        this.errorMessage =
          `HTTP ${err.status} - ${err.statusText} : ` +
          (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }
}