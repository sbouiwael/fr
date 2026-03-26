export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface TaskDTO {
  id?: number;

  name: string;
  description?: string | null;

  projectId: number;
  parentTaskId?: number | null;

  // NEW aligned fields (backend)
  wbsNumber?: string | null;
  mode?: string | null;

  durationDays?: number | null;
  workHours?: number | null;

  baselineDurationDays?: number | null;
  baselineStartDate?: string | null; // YYYY-MM-DD
  baselineEndDate?: string | null;   // YYYY-MM-DD

  actualWorkHours?: number | null;
  calendarName?: string | null;

  sortOrder?: number | null;

  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null;   // YYYY-MM-DD

  status?: TaskStatus | null;
  progress?: number | null;

  active?: boolean;
  createdAt?: string;
}