import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface CompListDto extends BaseDto {
  name: string;
  nameAm: string;
  branchCount: string;
}

export interface AddCompDto {
  name: string;
  nameAm: string;
}

export interface EditCompDto {
  id: UUID;
  name: string;
  nameAm: string;
  rowVersion: string;
}

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50); 
};