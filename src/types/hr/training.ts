export interface TrainingProgramDto {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  durationHours?: number | null;
  provider?: string | null;
  isMandatory: boolean;
  startDate?: string | null;
  endDate?: string | null;
  courseCount: number;
}

export interface TrainingProgramCreateDto {
  code: string;
  title: string;
  description?: string | null;
  category?: string;
  durationHours?: number | null;
  provider?: string | null;
  isMandatory?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TrainingSessionDto {
  id: string;
  courseId: string;
  title: string;
  status: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  mode?: string | null;
  trainerName?: string | null;
  capacity?: number | null;
  enrollmentCount: number;
  notes?: string | null;
}

export interface TrainingEnrollmentDto {
  id: string;
  programId: string;
  courseId?: string | null;
  sessionId?: string | null;
  employeeId: string;
  status: string;
  enrolledAt: string;
  completedAt?: string | null;
  notes?: string | null;
}

export interface TrainingEnrollmentCreateDto {
  programId: string;
  courseId?: string | null;
  sessionId?: string | null;
  employeeId: string;
  notes?: string | null;
}

export interface TrainingCertificateDto {
  id: string;
  enrollmentId: string;
  employeeId: string;
  programId: string;
  certificateNumber: string;
  title: string;
  status: string;
  issuedAt: string;
  expiresAt?: string | null;
  issuedBy?: string | null;
  notes?: string | null;
}

export interface TrainingEvaluationDto {
  id: string;
  enrollmentId: string;
  employeeId: string;
  rating: number;
  feedback?: string | null;
  submittedAt: string;
}
