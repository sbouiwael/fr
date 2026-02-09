export interface CreateProjectRequest {
  name: string;
  description?: string | null;
  startDate: string;           // required
  endDate?: string | null;
  projectManagerId: number;    // required
  active?: boolean;            // default true
}
