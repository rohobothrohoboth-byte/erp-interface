export interface GoalDto {
  id: string;
  employeeId: string;
  title: string;
  description?: string | null;
  status: string;
  startDate: string;
  targetDate: string;
  completedDate?: string | null;
  progressPercent: number;
  weight?: string | null;
  reviewId?: string | null;
  notes?: string | null;
}

export interface GoalCreateDto {
  employeeId: string;
  title: string;
  description?: string | null;
  startDate: string;
  targetDate: string;
  weight?: string | null;
  reviewId?: string | null;
  notes?: string | null;
}

export interface KPIDto {
  id: string;
  employeeId: string;
  name: string;
  description?: string | null;
  metricUnit?: string | null;
  targetValue: number;
  actualValue: number;
  periodStart: string;
  periodEnd: string;
  goalId?: string | null;
  notes?: string | null;
}

export interface PerformanceReviewDto {
  id: string;
  employeeId: string;
  reviewerId?: string | null;
  templateId?: string | null;
  title: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  overallRating?: string | null;
  score?: number | null;
  summary?: string | null;
  employeeComments?: string | null;
  managerComments?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export interface PerformanceReviewCreateDto {
  employeeId: string;
  reviewerId?: string | null;
  templateId?: string | null;
  title: string;
  periodStart: string;
  periodEnd: string;
  summary?: string | null;
}

export interface ReviewDecisionDto {
  reviewerId?: string | null;
  comments?: string | null;
  rejectionReason?: string | null;
  overallRating?: string | null;
  score?: number | null;
}
