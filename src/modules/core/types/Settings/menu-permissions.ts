import type { UUID } from "crypto";
import type { BaseDto } from "@/modules/core/types/BaseDto";

export type { UUID };

export interface NameList {
  id: string;
  name: string;
}

// Main DTOs
export interface ModPerMenuListDto {
  perModuleId: UUID;
  perModule: string;
  perMenuList: NameList[];
  // Add these if they exist in your API response
  id?: UUID;
  name?: string;
  desc?: string;
}

export interface PerMenuListDto extends BaseDto {
  perModuleId: UUID; // PerModule
  order: number;
  isChild: boolean;
  key: string;
  label: string;
  isChildStr: string;
  parent: string;
  module: string; // PerModule
  path: string;
  icon: string;
  parentKey: string;
}

export interface PerMenuAddDto {
  perModuleId: UUID;
  key: string;
  label: string;
  path: string;
  icon: string;
  isChild: boolean;
  parentKey: string;
  order: number;
}

export interface PerMenuModDto {
  id: UUID;
  perModuleId: UUID;  // Make sure this is camelCase (lowercase p)
  key: string;
  label: string;
  path: string;
  icon: string;
  isChild: boolean;
  parentKey: string;  // This will be mapped to parentId in the payload
  order: number;
}