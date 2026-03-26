import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProjectDTO } from '../models/project';
import { CreateProjectRequest, UpdateProjectRequest } from '../models/project.requests';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(this.baseUrl);
  }

  getProjectById(id: number): Observable<ProjectDTO> {
    return this.http.get<ProjectDTO>(`${this.baseUrl}/${id}`);
  }

  getByManager(managerId: number): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(`${this.baseUrl}/manager/${managerId}`);
  }

  createProject(payload: CreateProjectRequest): Observable<ProjectDTO> {
    return this.http.post<ProjectDTO>(this.baseUrl, payload);
  }

  updateProject(id: number, payload: UpdateProjectRequest): Observable<ProjectDTO> {
    return this.http.put<ProjectDTO>(`${this.baseUrl}/${id}`, payload);
  }

  deactivateProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}