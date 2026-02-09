import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskDTO } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  createTask(dto: TaskDTO): Observable<TaskDTO> {
    return this.http.post<TaskDTO>(this.baseUrl, dto);
  }

  getTasksByProject(projectId: number): Observable<TaskDTO[]> {
    return this.http.get<TaskDTO[]>(`${this.baseUrl}/project/${projectId}`);
  }

  getTaskById(id: number): Observable<TaskDTO> {
    return this.http.get<TaskDTO>(`${this.baseUrl}/${id}`);
  }

  updateTask(id: number, dto: TaskDTO): Observable<TaskDTO> {
    return this.http.put<TaskDTO>(`${this.baseUrl}/${id}`, dto);
  }

  deactivateTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
