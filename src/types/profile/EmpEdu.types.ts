import type { UUID } from "crypto";

export interface EmpEduListDto {
  id: UUID;

  eduLevel: string;
  institution: string;
  fieldOfStudy: string;
  gpa?: number | null;
  status: string;
  dateStart: string;
  dateEnd: string;
  certificateFileId?: string | null;
  certificateFile?: any;
}

export interface EmpEduAddDto {
  eduLevel: string | null;
  institution: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string;
  gpa?: number | null;
  certificateFileId?: string | null;
} 


export interface EmpEduModDto {
  id: UUID;
  eduLevel: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string; // ISO string format
  endDate: string | null; // Can be null
  gpa: number | null;
  status: string;
  rowVersion: string;
}