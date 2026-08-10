import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface AddHolidayDto {
  name: string;
  date: string; // ISO date string
  isPublic: boolean;
  fiscalYearId: UUID; // Added this required field
}

export interface HolidayDto extends BaseDto {
  id: UUID;
  name: string;
  date: string;
  description?: string;
  isActive?: boolean;
  fiscalYearId?: UUID;
  isPublic: boolean;
}

export interface HolidayListDto extends BaseDto {
  id: UUID;
  name: string;
  date: string;
  dateStr: string; // Format: "MMMM dd, yyyy" (e.g., "January 15, 2024")
  dateStrAm: string; // Ethiopian calendar format: "MMMM dd, yyyy"
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  fiscalYearId: UUID;
  fiscalYearName?: string;
  isPublic: boolean;
  isPublicStr: string;
  fiscYear: string;
}

export interface EditHolidayDto {
  id: UUID;
  name: string;
  date: string;
  isPublic: boolean;
  rowVersion: string;
  
}