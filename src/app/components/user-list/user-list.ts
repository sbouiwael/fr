import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../services/user-service';
import { UserDTO } from '../../models/user';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialog, Pagination],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserListComponent implements OnInit {
  users: UserDTO[] = [];
  loading = false;
  errorMessage = '';

  // Search & Sort
  searchTerm = '';
  sortBy = 'name-asc';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Delete confirmation
  showDeleteConfirm = false;
  deleteTarget: UserDTO | null = null;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): UserDTO[] {
    let result = this.users;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(u =>
        (u.firstName?.toLowerCase().includes(term)) ||
        (u.lastName?.toLowerCase().includes(term)) ||
        ((u.firstName + ' ' + u.lastName).toLowerCase().includes(term)) ||
        (u.email?.toLowerCase().includes(term)) ||
        (u.role?.toLowerCase().includes(term)) ||
        (u.weeklyCapacity?.toString().includes(term)) ||
        (u.createdAt?.includes(term)) ||
        (u.active !== false ? 'active' : 'inactive').includes(term)
      );
    }

    result = [...result].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc': return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
        case 'name-desc': return (b.firstName + ' ' + b.lastName).localeCompare(a.firstName + ' ' + a.lastName);
        case 'role': return (a.role || '').localeCompare(b.role || '');
        case 'capacity-desc': return (b.weeklyCapacity ?? 0) - (a.weeklyCapacity ?? 0);
        case 'capacity-asc': return (a.weeklyCapacity ?? 0) - (b.weeklyCapacity ?? 0);
        case 'active-first': return (b.active !== false ? 1 : 0) - (a.active !== false ? 1 : 0);
        case 'inactive-first': return (a.active !== false ? 1 : 0) - (b.active !== false ? 1 : 0);
        default: return 0;
      }
    });

    return result;
  }

  get paginatedUsers(): UserDTO[] {
    const filtered = this.filteredUsers;
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalFiltered(): number {
    return this.filteredUsers.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.users = [];

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.users = [];
        this.errorMessage =
          `HTTP ${err.status} - ${err.statusText} : ` +
          (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  // Double-click to edit
  onCardDblClick(user: UserDTO): void {
    if (user.id) {
      this.router.navigate(['/users', user.id, 'edit']);
    }
  }

  // Delete with confirmation
  askDelete(user: UserDTO, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = user;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget?.id) return;
    this.userService.deactivateUser(this.deleteTarget.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deleting user';
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
