import type { UUID } from 'crypto';

export type { UUID };

export interface NameListDto {
  id: UUID;
  name: string;
}

export interface NameAmListDto {
  id: UUID;
  name: string;
  nameAm: string;
}