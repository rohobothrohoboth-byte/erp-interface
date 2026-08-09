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
  id: string;  // This must exist
  employeeId?: string;  // Alternative field name
  code: string;
  empFullName: string;
  empFullNameAm?: string;
  gender?: string;
  department?: string;
  position?: string;
  branch?: string;
  jobGrade?: string;
  employmentDate?: string;
  email?: string;
  phone?: string;
}
