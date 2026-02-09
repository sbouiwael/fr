export interface TaskAssignmentDTO {
  id?: number;
  taskId: number;
  userId: number;
  assignedHours: number;

  active?: boolean;
  createdAt?: string;
}
