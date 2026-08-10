import type { UUID } from 'crypto';

export interface BaseDto {
  id: UUID;
  isDeleted: boolean;
  rowVersion: string;
  createdAt: string;
  createdAtAm: string;
  modifiedAt: string;
  modifiedAtAm: string;
}