export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | string;

export interface TaskDTO {
  id?: number;
  name: string;
  description?: string | null;

  projectId: number;
  parentTaskId?: number | null;

  durationDays: number;
  workloadHours?: number; // calcul backend

  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null;

  status?: TaskStatus;
  progress?: number;

  active?: boolean;
  createdAt?: string;
}
