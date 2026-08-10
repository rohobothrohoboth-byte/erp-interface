import type { UUID } from 'crypto';

export type { UUID };

export interface NameList {
  id: UUID;
  name: string;
}

export interface ModPerMenuListDto {
  perModuleId: UUID;
  perModule: string;
  perMenuList: NameList[];
}

