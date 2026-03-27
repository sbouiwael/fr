import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskDependencyDTO, TaskDependencyCreateRequest } from '../models/task-dependency';

@Injectable({ providedIn: 'root' })
export class TaskDependencyService {
  private readonly baseUrl = `${environment.apiUrl}/dependencies`;

  constructor(private http: HttpClient) {}

  getPredecessors(taskId: number): Observable<TaskDependencyDTO[]> {
    return this.http.get<TaskDependencyDTO[]>(`${this.baseUrl}/predecessors/${taskId}`);
  }

  getSuccessors(taskId: number): Observable<TaskDependencyDTO[]> {
    return this.http.get<TaskDependencyDTO[]>(`${this.baseUrl}/successors/${taskId}`);
  }

  create(req: TaskDependencyCreateRequest): Observable<TaskDependencyDTO> {
    return this.http.post<TaskDependencyDTO>(this.baseUrl, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByProject(projectId: number): Observable<TaskDependencyDTO[]> {
    return this.http.get<TaskDependencyDTO[]>(`${this.baseUrl}/project/${projectId}`);
  }
}
