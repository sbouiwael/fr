import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/task-service';
import { TaskDTO } from '../../models/task';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialog, Pagination],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css'],
})
export class TaskList implements OnInit {
  tasks: TaskDTO[] = [];
  loading = false;
  errorMessage = '';

  projectId: number | null = null;

  // Search & Sort
  searchTerm = '';
  sortBy = 'name-asc';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Delete confirmation
  showDeleteConfirm = false;
  deleteTarget: TaskDTO | null = null;

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get filteredTasks(): TaskDTO[] {
    let result = this.tasks;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        (t.name?.toLowerCase().includes(term)) ||
        (t.description?.toLowerCase().includes(term)) ||
        (t.status?.toLowerCase().includes(term)) ||
        (t.startDate?.includes(term)) ||
        (t.endDate?.includes(term)) ||
        (t.wbsNumber?.toLowerCase().includes(term)) ||
        (t.progress?.toString().includes(term)) ||
        (t.workHours?.toString().includes(term)) ||
        (t.durationDays?.toString().includes(term)) ||
        (t.active !== false ? 'active' : 'inactive').includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'startDate-asc': return (a.startDate || '').localeCompare(b.startDate || '');
        case 'startDate-desc': return (b.startDate || '').localeCompare(a.startDate || '');
        case 'progress-desc': return (b.progress ?? 0) - (a.progress ?? 0);
        case 'progress-asc': return (a.progress ?? 0) - (b.progress ?? 0);
        case 'duration-desc': return (b.durationDays ?? 0) - (a.durationDays ?? 0);
        case 'duration-asc': return (a.durationDays ?? 0) - (b.durationDays ?? 0);
        case 'status': {
          const order: Record<string, number> = { 'BLOCKED': 0, 'IN_PROGRESS': 1, 'NOT_STARTED': 2, 'DONE': 3 };
          return (order[a.status || ''] ?? 99) - (order[b.status || ''] ?? 99);
        }
        default: return 0;
      }
    });

    return result;
  }

  get paginatedTasks(): TaskDTO[] {
    const filtered = this.filteredTasks;
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalFiltered(): number {
    return this.filteredTasks.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

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

  // Double-click to edit
  onCardDblClick(task: TaskDTO): void {
    if (task.id) {
      this.router.navigate(['/tasks', task.id, 'edit']);
    }
  }

  // Delete with confirmation
  askDelete(task: TaskDTO, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = task;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget?.id) return;
    this.taskService.deactivateTask(this.deleteTarget.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        this.loadTasks();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deleting task';
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        this.cdr.detectChanges();
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }
}
