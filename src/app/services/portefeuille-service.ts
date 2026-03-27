import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PortefeuilleDTO, PortefeuilleCreateUpdateRequest } from '../models/portefeuille';
import { ProjectDTO } from '../models/project';

@Injectable({ providedIn: 'root' })
export class PortefeuilleService {
  private readonly baseUrl = `${environment.apiUrl}/portefeuilles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PortefeuilleDTO[]> {
    return this.http.get<PortefeuilleDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<PortefeuilleDTO> {
    return this.http.get<PortefeuilleDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: PortefeuilleCreateUpdateRequest): Observable<PortefeuilleDTO> {
    return this.http.post<PortefeuilleDTO>(this.baseUrl, payload);
  }

  update(id: number, payload: PortefeuilleCreateUpdateRequest): Observable<PortefeuilleDTO> {
    return this.http.put<PortefeuilleDTO>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addProject(portefeuilleId: number, projectId: number): Observable<PortefeuilleDTO> {
    return this.http.post<PortefeuilleDTO>(`${this.baseUrl}/${portefeuilleId}/projects/${projectId}`, {});
  }

  removeProject(portefeuilleId: number, projectId: number): Observable<PortefeuilleDTO> {
    return this.http.delete<PortefeuilleDTO>(`${this.baseUrl}/${portefeuilleId}/projects/${projectId}`);
  }

  getUnassignedProjects(): Observable<ProjectDTO[]> {
    return this.http.get<ProjectDTO[]>(`${this.baseUrl}/unassigned-projects`);
  }
}
