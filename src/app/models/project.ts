export interface ProjectDTO {
  id: number;

  name: string;
  description?: string | null;

  startDate: string;           // backend: LocalDate (required)
  endDate?: string | null;

  active: boolean;
  projectManagerId: number;

  // NEW (optional)
  portfolioName?: string | null;
  programName?: string | null;
  subProgramName?: string | null;
  objective?: string | null;
  calendarName?: string | null;

  baselineStartDate?: string | null;
  baselineEndDate?: string | null;

  progress?: number | null;
}