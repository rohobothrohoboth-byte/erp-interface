import type { UUID } from '@/modules/list/types/list';

// types/NameList/nameList.ts

export interface NameListItem {
  id: string;
  name: string;
  key?: string;
  icon?: string;  // Add this
  order?: number; // Add this
}

export interface RoleListItem {
  id: UUID;
  role: string;
}

// export interface JgStepNameItem {
//   id: UUID;
//   name: string; // JOB GRADE STEP NAME
//   jobGrade: string; // JOB GRADE
// }