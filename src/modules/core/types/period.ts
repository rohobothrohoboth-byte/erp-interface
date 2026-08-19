import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/core/types/BaseDto';
import type { Quarter } from '@/modules/core/types/enum';

export type { UUID };

// Backend accepts: Weekly | Monthly | Quarterly | SemiAnnual | EightMonth | Yearly | Custom
export type PeriodType =
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'SemiAnnual'
  | 'EightMonth'
  | 'Yearly'
  | 'Custom';

export const PERIOD_TYPE_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'SemiAnnual', label: 'Semi-Annual' },
  { value: 'EightMonth', label: 'Eight Month' },
  { value: 'Yearly', label: 'Yearly' },
  { value: 'Custom', label: 'Custom' },
];

export interface PeriodListDto extends BaseDto {
  quarter: Quarter;
  periodType?: PeriodType;
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
  periodType?: PeriodType;
  fiscalYearId: UUID;
}

export interface EditPeriodDto {
  id: UUID;
  name: string;
  dateStart: string;
  dateEnd: string;
  isActive: string;
  quarter: Quarter;
  periodType?: PeriodType;
  fiscalYearId: UUID;
  rowVersion: string;
}