import { TaskDTO, TaskStatus } from '../../models/task';
import { DependencyType } from '../../models/task-dependency';

export type ZoomLevel = 'day' | 'week' | 'month';

export interface ZoomConfig {
  pixelsPerDay: number;
  topLabel: 'months' | 'years';
  bottomLabel: 'days' | 'weeks' | 'months';
}

export const ZOOM_CONFIGS: Record<ZoomLevel, ZoomConfig> = {
  day:   { pixelsPerDay: 36, topLabel: 'months', bottomLabel: 'days' },
  week:  { pixelsPerDay: 12, topLabel: 'months', bottomLabel: 'weeks' },
  month: { pixelsPerDay: 3,  topLabel: 'years',  bottomLabel: 'months' },
};

export const ROW_HEIGHT = 36;
export const BAR_HEIGHT = 22;
export const BAR_Y_OFFSET = (ROW_HEIGHT - BAR_HEIGHT) / 2;
export const SUMMARY_HEIGHT = 10;
export const MILESTONE_SIZE = 12;
export const INDENT_PX = 20;

export interface TimelineConfig {
  startDate: Date;
  endDate: Date;
  zoom: ZoomLevel;
  pixelsPerDay: number;
  totalWidth: number;
  totalHeight: number;
}

export interface BarRect {
  taskId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  progressWidth: number;
  status: TaskStatus;
  name: string;
  rowIndex: number;
  isSummary: boolean;
  isMilestone: boolean;
  isCritical: boolean;
  hasBaseline: boolean;
  baselineX: number;
  baselineWidth: number;
}

export interface ArrowPath {
  id: number;
  path: string;
  type: DependencyType;
}

export interface HeaderCell {
  label: string;
  x: number;
  width: number;
  isWeekend?: boolean;
}

export interface TimescaleRow {
  top: HeaderCell[];
  bottom: HeaderCell[];
}

export interface GridLine {
  x: number;
  isWeekend: boolean;
  isMajor: boolean; // first of month
}

export interface GanttTask extends TaskDTO {
  bar?: BarRect;
  children?: GanttTask[];
  isExpanded?: boolean;
  level?: number;
  isSummary?: boolean;
  isMilestone?: boolean;
  isCritical?: boolean;
  flatIndex?: number;
  predecessorsLabel?: string;
  // Computed summary dates (min start of children, max end of children)
  summaryStart?: string | null;
  summaryEnd?: string | null;
}
