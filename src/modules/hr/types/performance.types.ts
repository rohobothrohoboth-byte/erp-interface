// Types for the HR Performance service (gateway: /performance -> api/v1)

export interface Kpi {
  id: string;
  name: string;
  description?: string | null;
  metric?: string | null;
  target?: number | null;
  weight: number;
  category?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface KpiCreate {
  name: string;
  description?: string | null;
  metric?: string | null;
  target?: number | null;
  weight: number;
  category?: string | null;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: string;
  progress: number;
  kpiId?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface GoalCreate {
  employeeId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status?: string;
  progress?: number;
  kpiId?: string | null;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  overallScore?: number | null;
  status: string;
  comments?: string | null;
  reviewDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PerformanceReviewCreate {
  employeeId: string;
  reviewerId: string;
  period: string;
  overallScore?: number | null;
  status?: string;
  comments?: string | null;
  reviewDate?: string | null;
}
