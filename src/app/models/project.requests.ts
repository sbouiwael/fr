export interface CreateProjectRequest {
  name: string;
  description?: string | null;

  startDate: string;         // YYYY-MM-DD (required)
  endDate?: string | null;

  active?: boolean;          // default true
  projectManagerId: number;  // required

  // NEW (optional)
  portfolioName?: string | null;
  programName?: string | null;
  subProgramName?: string | null;
  objective?: string | null;
  calendarName?: string | null;

  baselineStartDate?: string | null; // YYYY-MM-DD
  baselineEndDate?: string | null;   // YYYY-MM-DD

  progress?: number | null;  // 0..100
}

export type UpdateProjectRequest = Partial<CreateProjectRequest>;