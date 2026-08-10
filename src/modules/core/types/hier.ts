import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface HierListDto extends BaseDto {
  parent: string;
  child: string;
  parentAm: string;
  childAm: string;
}

export interface AddHierDto {
  parentId: UUID;
  childId: UUID;
}

export interface EditHierDto {
  id: UUID;
  parentId: UUID;
  childId: UUID;
  rowVersion: string;
}