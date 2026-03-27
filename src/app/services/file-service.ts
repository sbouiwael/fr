import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  uploadFile(projectId: number, subdirectory: string, file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subdirectory', subdirectory);
    return this.http.post<{ filename: string }>(`${this.baseUrl}/${projectId}/files`, formData);
  }

  listFiles(projectId: number, subdirectory: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${projectId}/files`, {
      params: { subdirectory }
    });
  }
}
