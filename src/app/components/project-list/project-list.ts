import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';

import { ProjectService } from '../../services/project-service';
import { ProjectDTO } from '../../models/project';
import { CreateProjectRequest } from '../../models/project.requests';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialog, Pagination],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.css'],
})
export class ProjectList implements OnInit {
  projects: ProjectDTO[] = [];
  loading = false;
  errorMessage = '';

  importing = false;
  importSuccess = '';
  importError = '';

  // Search & Sort
  searchTerm = '';
  sortBy = 'name-asc';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Delete confirmation
  showDeleteConfirm = false;
  deleteTarget: ProjectDTO | null = null;

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  get filteredProjects(): ProjectDTO[] {
    let result = this.projects;

    // Search across all fields
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        (p.name?.toLowerCase().includes(term)) ||
        (p.description?.toLowerCase().includes(term)) ||
        (p.startDate?.includes(term)) ||
        (p.endDate?.includes(term)) ||
        (p.portfolioName?.toLowerCase().includes(term)) ||
        (p.programName?.toLowerCase().includes(term)) ||
        (p.objective?.toLowerCase().includes(term)) ||
        (p.projectManagerId?.toString().includes(term)) ||
        (p.progress?.toString().includes(term)) ||
        (p.active ? 'active' : 'inactive').includes(term)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'startDate-asc': return (a.startDate || '').localeCompare(b.startDate || '');
        case 'startDate-desc': return (b.startDate || '').localeCompare(a.startDate || '');
        case 'progress-asc': return (a.progress ?? 0) - (b.progress ?? 0);
        case 'progress-desc': return (b.progress ?? 0) - (a.progress ?? 0);
        case 'active-first': return (b.active ? 1 : 0) - (a.active ? 1 : 0);
        case 'inactive-first': return (a.active ? 1 : 0) - (b.active ? 1 : 0);
        default: return 0;
      }
    });

    return result;
  }

  get paginatedProjects(): ProjectDTO[] {
    const filtered = this.filteredProjects;
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalFiltered(): number {
    return this.filteredProjects.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';
    this.projects = [];

    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.projects = [];
        this.errorMessage =
          `HTTP ${err.status} - ${err.statusText} : ` +
          (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
        console.error('Error fetching projects:', err);
        this.cdr.detectChanges();
      },
    });
  }

  onCardDblClick(project: ProjectDTO): void {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

  askDelete(project: ProjectDTO, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = project;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.projectService.deactivateProject(this.deleteTarget.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        this.loadProjects();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deleting project';
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing = true;
    this.importSuccess = '';
    this.importError = '';
    this.cdr.detectChanges();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          this.importing = false;
          this.importError = 'The Excel file is empty or has no data rows.';
          this.cdr.detectChanges();
          return;
        }

        const requests: CreateProjectRequest[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2;
          const get = (keys: string[]): any => this.findColumn(row, keys);

          const name = get(['nom', 'name']);
          const startDateRaw = get(['date début', 'date debut', 'start date', 'startdate']);
          const projectManagerIdRaw = get(['manager id', 'managerid', 'project manager id', 'projectmanagerid']);

          if (!name) { errors.push(`Row ${rowNum}: missing "Name"`); return; }
          if (!startDateRaw) { errors.push(`Row ${rowNum}: missing "Start Date"`); return; }

          const startDate = this.parseDate(startDateRaw);
          if (!startDate) { errors.push(`Row ${rowNum}: invalid start date "${startDateRaw}"`); return; }

          const endDateRaw = get(['date fin', 'end date', 'enddate']);
          const endDate = endDateRaw ? this.parseDate(endDateRaw) : null;
          const progressRaw = get(['progrès', 'progres', 'progress']);
          const progress = progressRaw != null ? Number(progressRaw) : null;

          requests.push({
            name: String(name), startDate,
            projectManagerId: projectManagerIdRaw ? Number(projectManagerIdRaw) : 1,
            description: get(['description']) ? String(get(['description'])) : null,
            endDate: endDate || null,
            portfolioName: get(['portfolio']) ? String(get(['portfolio'])) : null,
            programName: get(['programme', 'program']) ? String(get(['programme', 'program'])) : null,
            objective: get(['objectif', 'objective']) ? String(get(['objectif', 'objective'])) : null,
            progress: progress != null && !isNaN(progress) ? progress : null,
          });
        });

        if (requests.length === 0) {
          this.importing = false;
          this.importError = 'No valid rows found.\n' + errors.join('\n');
          this.cdr.detectChanges();
          return;
        }

        forkJoin(requests.map(r => this.projectService.createProject(r))).subscribe({
          next: (results) => {
            this.importing = false;
            const msg = `Successfully imported ${results.length} project(s).`;
            this.importSuccess = errors.length ? `${msg} ${errors.length} row(s) skipped:\n${errors.join('\n')}` : msg;
            this.loadProjects();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.importing = false;
            this.importError = 'Error creating projects: ' + (typeof err.error === 'string' ? err.error : JSON.stringify(err.error ?? err.message));
            this.cdr.detectChanges();
          },
        });
      } catch (ex: any) {
        this.importing = false;
        this.importError = 'Failed to parse Excel file: ' + (ex.message || ex);
        this.cdr.detectChanges();
      }
    };

    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  private findColumn(row: Record<string, any>, keys: string[]): any {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const match = rowKeys.find(k => k.toLowerCase().trim() === key);
      if (match !== undefined) return row[match];
    }
    return undefined;
  }

  private parseDate(value: any): string | null {
    if (typeof value === 'number') return this.formatDate(new Date(Math.round((value - 25569) * 86400 * 1000)));
    if (value instanceof Date) return this.formatDate(value);
    if (typeof value === 'string') { const d = new Date(value); if (!isNaN(d.getTime())) return this.formatDate(d); }
    return null;
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
