export interface ProjectDTO {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | null;     // ISO "YYYY-MM-DD"
  endDate?: string | null;       // ISO "YYYY-MM-DD"
  projectManagerId?: number | null;
  active: boolean;
  createdAt?: string | null;
}
