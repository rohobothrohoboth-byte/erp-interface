import type { BaseDto } from '../BaseDto';

export interface JobDescriptionListDto extends BaseDto {
  title: string;
  department: string;
  responsibilities: string;
  requirements: string;
  isActive: boolean;
}

export interface JobDescriptionAddDto {
  title: string;
  department: string;
  responsibilities: string;
  requirements: string;
  isActive: boolean;
}

export interface JobDescriptionModDto extends JobDescriptionAddDto {
  id: string;
  rowVersion: string;
}
