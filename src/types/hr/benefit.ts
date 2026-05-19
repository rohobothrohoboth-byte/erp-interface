import type { UUID } from 'crypto';
import type { BaseDto } from './BaseDto';

export type { UUID };

export interface BenefitSetListDto extends BaseDto {
  name: string;
  benefit: number;
  per: string; // enum Pe
  perStr: string;
  benefitStr: string;
}

export interface BenefitSetAddDto {
  name: string;
  benefitValue: number;
  per: string; // enum Per
}

export interface BenefitSetModDto {
  id: UUID;
  name: string;
  benefitValue: number;
  per: string; // enum Per
  rowVersion: string;
}