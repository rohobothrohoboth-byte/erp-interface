import type { UUID } from 'crypto';
import type { BaseDto } from './BaseDto';
import type { ProfessionType } from './enum';

export type { UUID };

// Position Benefit Types (Updated)
export interface PositionBenefitListDto extends BaseDto {
  benefitSettingId: UUID;
  positionId: UUID;
  benefitName: string;
  perStr: string;
  benefit: string;
}

export interface PositionBenefitAddDto {
  benefitSettingId: UUID;
  positionId: UUID;
}

export interface PositionBenefitModDto {
  id: UUID;
  benefitSettingId: UUID;
  positionId: UUID;
  rowVersion: string;
}

// ... rest of your existing types remain the same
export interface PositionListDto extends BaseDto {
  departmentId: UUID;
  isVacant: '0' | '1';
  name: string;
  nameAm: string;
  noOfPosition: number;
  isVacantStr: string;
  department: string;
}

export interface PositionAddDto {
  name: string;
  nameAm: string;
  noOfPosition: number;
  isVacant: '0' | '1';
  departmentId: UUID;
}

export interface PositionModDto {
  id: UUID;
  name: string;
  nameAm: string;
  noOfPosition: number;
  isVacant: '0' | '1';
  departmentId: UUID;
  rowVersion: string;
}

// Position Experience Types
export interface PositionExpListDto extends BaseDto {
  positionId: UUID;
  samePosExp: number;
  otherPosExp: number;
  minAge: number;
  maxAge: number;
}

export interface PositionExpAddDto {
  samePosExp: number;
  otherPosExp: number;
  minAge: number;
  maxAge: number;
  positionId: UUID;
}

export interface PositionExpModDto {
  id: UUID;
  samePosExp: number;
  otherPosExp: number;
  minAge: number;
  maxAge: number;
  positionId: UUID;
  rowVersion: string;
}

// types/hr/position.ts

export interface PositionEduListDto extends BaseDto {
  positionId: UUID;
  educationQualId: UUID;
  educationLevel: string; // This is the string value like "Bachelor Degree"
  educationQual: string;
  positionName?: string;
}

export interface PositionEduAddDto {
  positionId: UUID;
  educationQualId: UUID;
  educationLevel: string; // Send the string value
}

export interface PositionEduModDto {
  id: UUID;
  positionId: UUID;
  educationQualId: UUID;
  educationLevel: string; // Send the string value
  rowVersion: string;
}

export interface BaseDto {
  id: UUID;
  isDeleted: boolean;
  rowVersion: string;
  dateAdd: string;
  dateMod: string | null;
}

// Position Requirement Types
export interface PositionReqListDto extends BaseDto {
  professionType: ProfessionType;
  positionId: UUID;
  gender: '0' | '1' | '2';
  saturdayWorkOption: '0' | '1' | '2';
  sundayWorkOption: '0' | '1' | '2';
  workingHours: number;
  genderStr: string;
  saturdayWorkOptionStr: string;
  sundayWorkOptionStr: string;
  professionTypeStr: string;
}

export interface PositionReqAddDto {
  gender: '0' | '1' | '2';
  saturdayWorkOption: '0' | '1' | '2' | '3';
  sundayWorkOption: '0' | '1' | '2' | '3';
  workingHours: number;
  professionType: ProfessionType;
  positionId: UUID;
}

export interface PositionReqModDto {
  id: UUID;
  gender: '0' | '1' | '2';
  saturdayWorkOption: '0' | '1' | '2' | '3';
  sundayWorkOption: '0' | '1' | '2' | '3';
  workingHours: number;
  professionType: ProfessionType;
  positionId: UUID;
  rowVersion: string;
}

// Service response types
export interface EducationLevelDto {
  id: UUID;
  name: string;

}

export interface ProfessionTypeDto {
  id: UUID;
  name: string;
  nameAm: string;
}

export interface BenefitSettingDto {
  id: UUID;
  name: string;
  nameAm: string;
}

// Combined types
export type PositionSettingType = 
  | 'experience' 
  | 'benefit' 
  | 'education' 
  | 'requirement';

export interface PositionSettingTab {
  id: PositionSettingType;
  label: string;
  description: string;
}

export interface PositionDetailsData {
  position: PositionListDto;
  experience?: PositionExpListDto[];
  benefits?: PositionBenefitListDto[];
  education?: PositionEduListDto[];
  requirements?: PositionReqListDto[];
}

export interface PositionFilters {
  searchTerm: string;
  departmentId?: UUID;
  minPositions?: number;
  maxPositions?: number;
}