import type { BaseDto } from './BaseDto';

export interface OnboardingTaskListDto extends BaseDto {
  taskName: string;
  description: string;
  sequenceOrder: number;
}

export interface OnboardingTaskAddDto {
  taskName: string;
  description: string;
  sequenceOrder: number;
}

export interface OnboardingTaskModDto extends OnboardingTaskAddDto {
  id: string;
  rowVersion: string;
}
