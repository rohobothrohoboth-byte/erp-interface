import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface CompListDto extends BaseDto {
  name: string;
  nameAm: string;
  branchCount: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  mission?: string;
  vision?: string;
  values?: string;
  structure?: string;
}

export interface AddCompDto {
  name: string;
  nameAm: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  mission?: string;
  vision?: string;
  values?: string;
  structure?: string;
}

export interface EditCompDto {
  id: UUID;
  name: string;
  nameAm: string;
  rowVersion: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  mission?: string;
  vision?: string;
  values?: string;
  structure?: string;
}

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50); 
};