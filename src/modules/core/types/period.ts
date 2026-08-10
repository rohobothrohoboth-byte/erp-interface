import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';
import type { Quarter } from '@/modules/core/types/enum';

export type { UUID };

export interface PeriodListDto extends BaseDto {
  quarter: Quarter;
  fiscalYearId: UUID;
  name: string;
  quarterStr: string;
  fiscYear: string;
  isActive: string;
  isActiveStr: string;
  dateStart: string; // DateTime in C# becomes string in TypeScript
  dateEnd: string; // DateTime in C# becomes string in TypeScript
  dateStartStr: string;
  dateStartStrAm: string;
  dateEndStr: string;
  dateEndStrAm: string;
}

export interface AddPeriodDto {
  name: string;
  dateStart: string;
  dateEnd: string;
  quarter: Quarter;
  fiscalYearId: UUID;
}

export interface EditPeriodDto {
  id: UUID;
  name: string;
  dateStart: string;
  dateEnd: string;
  isActive: string;
  quarter: Quarter;
  fiscalYearId: UUID;
  rowVersion: string;
}