// src/types/hr/recruit/onboardingTask.ts

export interface OnboardingTaskListDto {
  id: string;
  taskName: string;
  description: string;
  sequenceOrder: number;
  isDeleted: boolean;
  dateAdd: string;
  dateAddAm: string;
  dateMod: string | null;
  dateModAm: string;
  rowVersion: string; // ✅ Must be included
}

export interface OnboardingTaskAddDto {
  taskName: string;
  description: string;
  sequenceOrder: number;
}

export interface OnboardingTaskModDto {
  id: string;
  taskName: string;
  description: string;
  sequenceOrder: number;
  rowVersion: string; // ✅ Required for concurrency
}