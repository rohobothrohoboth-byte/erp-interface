import type { UUID } from 'crypto';

export type { UUID };

export interface NameList {
  id: UUID;
  name: string;
}

export interface MenuPerApiListDto {
  perMenuId: UUID;
  perMenu: string;
  perApiList: NameList[];
}