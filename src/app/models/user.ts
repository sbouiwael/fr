export type Role = 'PM' | 'PMO' | 'DEV' | 'QA' | 'DEVOPS' | 'RH' | 'ADMIN' | string;

export interface UserDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  weeklyCapacity: number;

  active?: boolean;
  createdAt?: string;
}
