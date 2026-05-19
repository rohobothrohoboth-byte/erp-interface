export interface EmpDbReport {
  empTot: number;
  empAct: number;
  empPen: number;
  empSus: number;
  empRet: number;
  empStd: number;
  empTer: number;
  empLeave: number;
  empRej: number;
}

export interface EmpDbPendList {
  empFullName: string;
  empFullNameAm: string;
  code: string;
  gender: string;
  branch: string;
  department: string;
  position: string;
  jobGrade: string;
}