// Types for the HR Training service (gateway: /training -> api/v1)

export interface TrainingProgram {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TrainingProgramCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
}

export interface TrainingCourse {
  id: string;
  programId: string;
  title: string;
  description?: string | null;
  instructor?: string | null;
  durationHours: number;
  location?: string | null;
  capacity: number;
  scheduledDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TrainingCourseCreate {
  programId: string;
  title: string;
  description?: string | null;
  instructor?: string | null;
  durationHours: number;
  location?: string | null;
  capacity: number;
  scheduledDate?: string | null;
}

export interface TrainingEnrollment {
  id: string;
  courseId: string;
  employeeId: string;
  enrolledAt: string;
  status: string;
  score?: number | null;
  certificateIssued: boolean;
  feedback?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TrainingEnrollmentCreate {
  courseId: string;
  employeeId: string;
  status?: string;
}
