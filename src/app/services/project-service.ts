import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectDTO } from '../models/project';
import { CreateProjectRequest } from '../models/project.requests';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly baseUrl = 'http://localhost:8082/api/projects';

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(this.baseUrl);
  }

  createProject(payload: CreateProjectRequest): Observable<ProjectDTO> {
    return this.http.post<ProjectDTO>(this.baseUrl, payload);
  }

  deactivateProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
