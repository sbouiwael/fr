import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { TaskService } from '../../services/task-service';
import { TaskDTO } from '../../models/task';

type Vm = {
  loading: boolean;
  errorMessage: string;
  taskId: number | null;
  task: TaskDTO | null;
};

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './task-details.html',
  styleUrls: ['./task-details.css'],
})
export class TaskDetails {
  vm$: Observable<Vm>;

  constructor(private route: ActivatedRoute, private taskService: TaskService) {
    this.vm$ = this.route.paramMap.pipe(
      map((pm) => {
        const id = Number(pm.get('id'));
        return Number.isFinite(id) && id > 0 ? id : null;
      }),
      distinctUntilChanged(),
      switchMap((taskId) => {
        if (taskId === null) {
          return of<Vm>({ loading: false, errorMessage: 'Invalid task id in URL.', taskId: null, task: null });
        }

        return this.taskService.getTaskById(taskId).pipe(
          map((task) => ({ loading: false, errorMessage: '', taskId, task: task ?? null })),
          startWith<Vm>({ loading: true, errorMessage: '', taskId, task: null }),
          catchError((err) => {
            console.error(err);
            const msg = err?.status ? `HTTP ${err.status} - ${err.statusText}` : 'Error loading task details.';
            return of<Vm>({ loading: false, errorMessage: msg, taskId, task: null });
          })
        );
      }),
      shareReplay(1)
    );
  }
}
