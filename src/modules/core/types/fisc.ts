import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';

export type { UUID };

export interface FiscYearListDto extends BaseDto {
  name: string;
  isActive: '0' | '1'; // Use string literals instead of YesNo type
  dateStart: string; 
  dateEnd: string;  
  isActiveStr: string;
  dateStartStr: string;
  dateStartStrAm: string;
  dateEndStr: string;
  dateEndStrAm: string;
}

export interface AddFiscYearDto {
  name: string;
  dateStart: string; 
  dateEnd: string;
}

export interface EditFiscYearDto {
  id: UUID;
  name: string;
  dateStart: string;
  dateEnd: string;
  isActive: '0' | '1'; // Using string literals instead of YesNo type
  rowVersion: string;
}