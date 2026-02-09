import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskAssignmentDTO } from '../models/task-assignment';

@Injectable({ providedIn: 'root' })
export class TaskAssignmentService {
  private readonly baseUrl = `${environment.apiUrl}/assignments`;

  constructor(private http: HttpClient) {}

  getByTask(taskId: number): Observable<TaskAssignmentDTO[]> {
    return this.http.get<TaskAssignmentDTO[]>(`${this.baseUrl}/task/${taskId}`);
  }

  getByUser(userId: number): Observable<TaskAssignmentDTO[]> {
    return this.http.get<TaskAssignmentDTO[]>(`${this.baseUrl}/user/${userId}`);
  }

  create(dto: TaskAssignmentDTO): Observable<TaskAssignmentDTO> {
    return this.http.post<TaskAssignmentDTO>(this.baseUrl, dto);
  }

  updateHours(assignmentId: number, hours: number): Observable<TaskAssignmentDTO> {
    return this.http.put<TaskAssignmentDTO>(`${this.baseUrl}/${assignmentId}/hours/${hours}`, {});
  }

  deactivate(assignmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${assignmentId}`);
  }
}
