export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TaskDependencyDTO {
  id?: number;
  predecessorTaskId: number;
  successorTaskId: number;
  type?: DependencyType;
  createdAt?: string;
}

export interface TaskDependencyCreateRequest {
  predecessorTaskId: number;
  successorTaskId: number;
  type?: DependencyType;
}
