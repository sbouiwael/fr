import { ProjectDTO } from './project';

export interface PortefeuilleDTO {
  id: number;
  nom: string;
  description?: string | null;
  projects: ProjectDTO[];
}

export interface PortefeuilleCreateUpdateRequest {
  nom: string;
  description?: string | null;
}
