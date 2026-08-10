import type { UUID } from "crypto";
import type { BaseDto } from "@/modules/core/types/BaseDto";


export type { UUID };

// ✅ CHANGE TO PASCALCASE TO MATCH C# BACKEND
export interface LeaveAppStepAddDto {
  StepName: string;           // PascalCase
  StepOrder: number;          // PascalCase
  Role: string;               // PascalCase
  EmployeeId?: UUID | null;   // PascalCase
  IsFinal: boolean;           // PascalCase
  LeaveAppChainId: string;    // PascalCase
  TimeoutHours?: number | null; // PascalCase
}

export interface LeaveAppStepModDto {
  Id: UUID;                   // PascalCase
  StepName: string;           // PascalCase
  StepOrder: number;          // PascalCase
  Role: string;               // PascalCase
  EmployeeId?: UUID | null;   // PascalCase
  IsFinal: boolean;           // PascalCase
  TimeoutHours?: number | null; // PascalCase
  RowVersion: string;         // PascalCase
}

export interface LeaveAppStepListDto {
  Id: UUID;                   // PascalCase
  StepName: string;           // PascalCase
  StepOrder: number;          // PascalCase
  Role: string;               // PascalCase
  RoleStr?: string;           // PascalCase
  EmployeeId?: UUID | null;   // PascalCase
  Employee?: string;          // PascalCase
  IsFinal: boolean;           // PascalCase
  IsFinalStr?: string;        // PascalCase
  LeaveAppChain?: string;     // PascalCase
  TimeoutHours?: number | null; // PascalCase
  IsDeleted: boolean;         // PascalCase
  DateAdd: string;            // PascalCase
  DateMod?: string;           // PascalCase
  RowVersion?: string;        // PascalCase
}