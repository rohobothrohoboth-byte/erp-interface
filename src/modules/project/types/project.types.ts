export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type TaskStatus = 'Backlog' | 'In Progress' | 'Blocked' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Project = {
  id: string;
  code: string;
  name: string;
  manager: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
};

export type ProjectTask = {
  id: string;
  projectCode: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimateHours: number;
};
