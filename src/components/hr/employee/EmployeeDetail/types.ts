// ── Employee Detail DTOs ───────────────────────────────────────────────────
// These will be populated from the dedicated employee detail endpoints.
// Mirrors profile types but scoped to viewing another employee (no self-edit).

export interface EmpDetailInfo {
  fullName: string;
  fullNameAm: string;
  position: string;
  empState: string;
}

export interface EmpDetailOverview {
  tenure: string;
  perStr: string;
  training: string;
  attendPer: number;
  attendMonth: string;
  repToName: string;
  repToPos: string;
}

export interface EmpDetailBasic {
  code: string;
  gender: string;
  nationality: string;
  birthDate: string;
  maritalStatus: string;
  // Employment
  empDate: string;
  department: string;
  branch: string;
  empType: string;
  empNature: string;
  workArr: string;
  // Salary
  salary: string;
  currency: string;
  salaryPayFreq: string;
  effectiveFromStr: string;
  jgStep: string;
  jobGrade: string;
  // Address & Contact
  addressType: string;
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  telephone: string;
  poBox: string;
  fax: string;
  email: string;
  website: string;
}

export interface EmpDetailBio {
  id: string;
  birthLocation: string;
  motherFullName: string;
  hasBirthCert: string;
  hasMarriageCert: string;
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
}

export interface EmpDetailContactList {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  relation: string;
  gender: string;
  nationality: string;
  addressType: string;
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  telephone: string;
  poBox: string;
  fax: string;
  email: string;
  website: string;
}

export interface EmpDetailContact {
  employeeId: string;
  hasContact: boolean;
  contact: EmpDetailContactList | null;
}

export interface EmpDetailFamilyMember {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  relation: string;
  gender: string;
  nationality: string;
}

export interface EmpDetailFamily {
  employeeId: string;
  family: EmpDetailFamilyMember[];
}

export interface EmpDetailGuarantor {
  fullName: string;
  gender: string;
  relation: string;
  nationality: string;
  telephone: string;
  email: string;
  addressType: string;
  country: string;
  region: string;
  subcity: string;
  zone: string;
  woreda: string;
  kebele: string;
  houseNo: string;
  poBox: string;
  fax: string;
  website: string;
  fileId: string;
  fileName: string;
  contentType: string;
  fileSizeStr: string;
}

export interface EmpDetailDocument {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeStr: string;
  documentType: string;
  uploadedAt: string;
}

export interface EmpDetailLeaveBalance {
  leavePolicyId: string;
  leaveType: string;
  percent: number;
  totalDays: string;
  remainDays: string;
  usedDays: string;
}

export interface EmpDetailPhoto {
  id: string;
  fileName: string;
  contentType: string;
  photoSize: string;
  photo: string;
}
