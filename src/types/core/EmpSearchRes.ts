export type UUID = string;
export interface EmpSearchRes {
  id: UUID;
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  code: string;
  branch: string;
  dept: string;
  position: string;
  empState: String;
  hasAccount: boolean;
}