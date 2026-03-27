import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';

import { TaskService } from '../../services/task-service';
import { TaskDependencyService } from '../../services/task-dependency-service';
import { TaskDTO } from '../../models/task';
import { TaskDependencyDTO } from '../../models/task-dependency';

import { GanttGrid, CellEdit, NewTaskRequest } from './gantt-grid';
import { GanttTimeline } from './gantt-timeline';
import { GanttTimescale } from './gantt-timescale';
import {
  GanttTask, TimelineConfig, BarRect, ArrowPath, TimescaleRow, ZoomLevel,
} from './gantt.models';
import {
  buildTimelineConfig, computeBar, computeArrow, generateTimescale,
  buildTaskTree, flattenTree, buildPredecessorsLabel, computeCriticalPath,
  dateToX,
} from './gantt.utils';

@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, GanttGrid, GanttTimeline, GanttTimescale],
  templateUrl: './gantt.html',
  styleUrls: ['./gantt.css'],
})
export class Gantt implements OnInit, OnDestroy {
  @ViewChild('gridBody') gridBody!: ElementRef<HTMLDivElement>;
  @ViewChild('timelineBody') timelineBody!: ElementRef<HTMLDivElement>;
  @ViewChild('timescaleHeader') timescaleHeader!: ElementRef<HTMLDivElement>;

  projectId!: number;
  loading = true;
  errorMessage = '';

  // Raw data
  private rawTasks: TaskDTO[] = [];
  dependencies: TaskDependencyDTO[] = [];

  // Tree + flat list
  private treeRoots: GanttTask[] = [];
  tasks: GanttTask[] = []; // flattened visible rows
  collapsedIds = new Set<number>();

  // Computed view data
  config!: TimelineConfig;
  bars: BarRect[] = [];
  arrows: ArrowPath[] = [];
  timescale!: TimescaleRow;

  zoom: ZoomLevel = 'day';
  selectedTaskId: number | null = null;
  gridWidth = 560;
  showCriticalPath = true;

  private sub?: Subscription;
  private resizing = false;
  private resizeStartX = 0;
  private resizeStartWidth = 0;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private depService: TaskDependencyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this.projectId = Number(raw);

    if (!Number.isFinite(this.projectId) || this.projectId <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid project ID';
      return;
    }

    this.loadData();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.sub = forkJoin({
      tasks: this.taskService.getTasksByProject(this.projectId),
      deps: this.depService.getByProject(this.projectId),
    }).subscribe({
      next: ({ tasks, deps }) => {
        this.rawTasks = (tasks ?? []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        this.dependencies = deps ?? [];
        this.rebuildAll();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = err?.status
          ? `HTTP ${err.status} — ${err.statusText}`
          : 'Failed to load project data.';
        this.cdr.detectChanges();
      },
    });
  }

  private rebuildAll(): void {
    // 1. Build hierarchy tree
    this.treeRoots = buildTaskTree(this.rawTasks);

    // 2. Compute critical path
    const criticalIds = this.showCriticalPath
      ? computeCriticalPath(this.flatAll(), this.dependencies)
      : new Set<number>();

    // Mark critical tasks
    this.markCritical(this.treeRoots, criticalIds);

    // 3. Flatten visible rows
    this.tasks = flattenTree(this.treeRoots, this.collapsedIds);

    // 4. Build predecessors labels
    const taskIdToRow = new Map<number, number>();
    this.tasks.forEach((t, i) => { if (t.id != null) taskIdToRow.set(t.id, i); });
    for (const t of this.tasks) {
      if (t.id != null) {
        t.predecessorsLabel = buildPredecessorsLabel(t.id, this.dependencies, taskIdToRow);
      }
    }

    // 5. Build timeline config, bars, arrows, timescale
    this.rebuildChart();
  }

  private rebuildChart(): void {
    this.config = buildTimelineConfig(this.tasks, this.zoom);

    // Compute bars
    this.bars = [];
    const barMap = new Map<number, BarRect>();
    this.tasks.forEach((task, i) => {
      const bar = computeBar(task, i, this.config);
      if (bar) {
        this.bars.push(bar);
        barMap.set(bar.taskId, bar);
        task.bar = bar;
      }
    });

    // Compute arrows
    this.arrows = [];
    this.dependencies.forEach((dep) => {
      const predBar = barMap.get(dep.predecessorTaskId);
      const succBar = barMap.get(dep.successorTaskId);
      if (predBar && succBar) {
        this.arrows.push({
          id: dep.id ?? 0,
          path: computeArrow(predBar, succBar, dep.type ?? 'FS'),
          type: dep.type ?? 'FS',
        });
      }
    });

    this.timescale = generateTimescale(this.config);
  }

  private flatAll(): GanttTask[] {
    return flattenTree(this.treeRoots, new Set());
  }

  private markCritical(nodes: GanttTask[], criticalIds: Set<number>): void {
    for (const node of nodes) {
      node.isCritical = node.id != null && criticalIds.has(node.id);
      if (node.children) this.markCritical(node.children, criticalIds);
    }
  }

  // ── Zoom ──

  setZoom(level: ZoomLevel): void {
    this.zoom = level;
    this.rebuildChart();
    this.cdr.detectChanges();
  }

  // ── Critical path toggle ──

  toggleCriticalPath(): void {
    this.showCriticalPath = !this.showCriticalPath;
    this.rebuildAll();
    this.cdr.detectChanges();
  }

  // ── Scroll to Today ──

  scrollToToday(): void {
    if (!this.config || !this.timelineBody) return;
    const todayX = dateToX(new Date(), this.config);
    const viewport = this.timelineBody.nativeElement;
    viewport.scrollLeft = Math.max(0, todayX - viewport.clientWidth / 3);
    if (this.timescaleHeader) {
      this.timescaleHeader.nativeElement.scrollLeft = viewport.scrollLeft;
    }
  }

  // ── Zoom to fit ──

  zoomToFit(): void {
    if (!this.timelineBody) return;
    const viewportWidth = this.timelineBody.nativeElement.clientWidth;
    if (viewportWidth <= 0 || this.tasks.length === 0) return;

    // Find min start, max end
    let minX = Infinity, maxX = 0;
    for (const bar of this.bars) {
      if (bar.x < minX) minX = bar.x;
      const right = bar.isMilestone ? bar.x + 12 : bar.x + bar.width;
      if (right > maxX) maxX = right;
    }

    if (maxX <= minX) return;
    const rangeWidth = maxX - minX + 40; // padding

    // Pick the best zoom level
    if (rangeWidth <= viewportWidth * 0.8) {
      this.zoom = 'day';
    } else if (rangeWidth <= viewportWidth * 3) {
      this.zoom = 'week';
    } else {
      this.zoom = 'month';
    }

    this.rebuildChart();
    this.cdr.detectChanges();

    // Scroll to start of content
    setTimeout(() => {
      if (this.timelineBody) {
        const newMinX = this.bars.length > 0 ? Math.min(...this.bars.map(b => b.x)) : 0;
        this.timelineBody.nativeElement.scrollLeft = Math.max(0, newMinX - 20);
        if (this.timescaleHeader) {
          this.timescaleHeader.nativeElement.scrollLeft = this.timelineBody.nativeElement.scrollLeft;
        }
      }
    });
  }

  // ── Expand / Collapse ──

  onToggleExpand(taskId: number): void {
    if (this.collapsedIds.has(taskId)) {
      this.collapsedIds.delete(taskId);
    } else {
      this.collapsedIds.add(taskId);
    }
    this.rebuildAll();
    this.cdr.detectChanges();
  }

  // ── Scroll sync ──

  onGridScroll(event: Event): void {
    if (this.timelineBody) {
      this.timelineBody.nativeElement.scrollTop = (event.target as HTMLElement).scrollTop;
    }
  }

  onTimelineScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.gridBody) {
      this.gridBody.nativeElement.scrollTop = el.scrollTop;
    }
    if (this.timescaleHeader) {
      this.timescaleHeader.nativeElement.scrollLeft = el.scrollLeft;
    }
  }

  // ── Splitter drag ──

  onSplitterPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.resizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.gridWidth;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onSplitterPointerMove(event: PointerEvent): void {
    if (!this.resizing) return;
    const dx = event.clientX - this.resizeStartX;
    this.gridWidth = Math.max(250, Math.min(900, this.resizeStartWidth + dx));
  }

  onSplitterPointerUp(): void {
    this.resizing = false;
  }

  // ── Task selection ──

  onTaskSelected(taskId: number): void {
    this.selectedTaskId = this.selectedTaskId === taskId ? null : taskId;
  }

  // ── Inline edit ──

  onCellEdited(edit: CellEdit): void {
    const task = this.findRawTask(edit.taskId);
    if (!task) return;

    const updated: TaskDTO = { ...task, [edit.field]: edit.value };
    this.taskService.updateTask(edit.taskId, updated).subscribe({
      next: (saved) => {
        this.replaceRawTask(edit.taskId, saved);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to save edit:', err);
        this.errorMessage = 'Failed to save change.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Add new task ──

  onAddTask(req: NewTaskRequest): void {
    const maxSort = this.rawTasks.reduce((m, t) => Math.max(m, t.sortOrder ?? 0), 0);

    const newTask: TaskDTO = {
      name: req.name,
      projectId: this.projectId,
      durationDays: 1,
      sortOrder: maxSort + 1,
      status: 'NOT_STARTED',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
    };

    this.taskService.createTask(newTask).subscribe({
      next: (saved) => {
        this.rawTasks.push(saved);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create task:', err);
        this.errorMessage = 'Failed to create task.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Drag bar to move ──

  onBarDragEnd(event: { taskId: number; daysDelta: number }): void {
    const task = this.findRawTask(event.taskId);
    if (!task || !task.startDate) return;

    const start = new Date(task.startDate);
    start.setDate(start.getDate() + event.daysDelta);
    const newStart = start.toISOString().split('T')[0];

    let newEnd: string | undefined;
    if (task.endDate) {
      const end = new Date(task.endDate);
      end.setDate(end.getDate() + event.daysDelta);
      newEnd = end.toISOString().split('T')[0];
    }

    const updated: TaskDTO = { ...task, startDate: newStart, endDate: newEnd ?? task.endDate };
    this.taskService.updateTask(event.taskId, updated).subscribe({
      next: (saved) => {
        this.replaceRawTask(event.taskId, saved);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to move task:', err);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
    });
  }

  // ── Drag bar edge to resize ──

  onBarResizeEnd(event: { taskId: number; newDurationDays: number }): void {
    const task = this.findRawTask(event.taskId);
    if (!task) return;

    const updated: TaskDTO = { ...task, durationDays: event.newDurationDays };
    if (task.startDate) {
      const end = new Date(task.startDate);
      end.setDate(end.getDate() + event.newDurationDays);
      updated.endDate = end.toISOString().split('T')[0];
    }

    this.taskService.updateTask(event.taskId, updated).subscribe({
      next: (saved) => {
        this.replaceRawTask(event.taskId, saved);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to resize task:', err);
        this.rebuildAll();
        this.cdr.detectChanges();
      },
    });
  }

  // ── Helpers ──

  private findRawTask(taskId: number): TaskDTO | undefined {
    return this.rawTasks.find(t => t.id === taskId);
  }

  private replaceRawTask(taskId: number, saved: TaskDTO): void {
    const idx = this.rawTasks.findIndex(t => t.id === taskId);
    if (idx >= 0) this.rawTasks[idx] = saved;
  }
}
