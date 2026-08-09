import type { UUID } from "crypto";

export interface EmpExpListDto {
  id: UUID;
  company: string;
  posTitle: string;
  location: string;
  respo: string;
  status: string;
  startDate: string;
  endDate: string | null;
  dateStart: string;
  dateEnd: string;
  experienceLetterFileId?: string | null;
  experienceLetterFile?: any;
}
export interface EmpExpAddDto {
  company: string | null;
  posTitle: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  respo?: string | null;
  experienceLetterFileId?: string | null;
}


export interface EmpExpModDto {
  id: UUID;
  company: string;
  posTitle: string;
  location: string;
  respo: string;
  startDate: string; // ISO string format
  endDate: string | null; // Can be null
  status: string;
  rowVersion: string;
}