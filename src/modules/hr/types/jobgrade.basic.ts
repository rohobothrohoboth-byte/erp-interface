// types/jobGrade.ts
import type { LucideIcon } from 'lucide-react';

export type SalaryRange = {
  min: string;
  mid: string;
  max: string;
};

export type JobDescription = {
  id: number;
  text: string;
};

export type JobGrade = {
  id: string;
  grade: string;
  title: string;
  experience: string;
  roles: string[];
  salary: SalaryRange;
  skill: string;
  icon: LucideIcon;
  descriptions: JobDescription[];
  department?: string;
  category?: string;
};