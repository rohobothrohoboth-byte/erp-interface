// ── Profile Info (header) ──────────────────────────────────────────────────
export interface ProfileInfoDto {
  fullName: string;
  fullNameAm: string;
  position: string;
  empState: string; // e.g. "Pending", "Active"
}

// ── Profile Card (overview stats) ─────────────────────────────────────────
export interface ProfileCardDto {
  tenure: string;
  perStr: string;
  training: string;
  attendance: string;   // e.g. "95%"
  repToName: string;
  repToPos: string;
}

// ── Basic Info ─────────────────────────────────────────────────────────────
export interface ProfileBasicDto {
  code: string;
  gender: string;
  nationality: string;
  birthDate: string;
  maritalStatus: string;
  empDate: string;
  position: string;
  department: string;
  branch: string;
  empType: string;
  empNature: string;
  workArr: string;
}

// ── Salary ─────────────────────────────────────────────────────────────────
export interface ProfileSalaryDto {
  salary: string;
  currency: string;
  salaryPayFreq: string;
  effectiveFromStr: string;
  jgStep: string;
  jobGrade: string;
}

// ── Address ────────────────────────────────────────────────────────────────
export interface ProfileAddressDto {
  addressTypeStr: string;
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

// ── Biographical + Financial (combined endpoint) ───────────────────────────
export interface ProfileBioDto {
  id: string;
  marriageCertId: string | null;
  birthCertId: string | null;
  birthLocation: string;
  motherFullName: string;
  hasBirthCertStr: string;
  hasMarriageCertStr: string;
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
}

// ── Leave Balance ──────────────────────────────────────────────────────────
export interface EmpLeaveBalDto {
  leavePolicyId: string;
  leaveType: string;
  percent: number;
  totalDays: string;
  remainDays: string;
  usedDays: string;
}

// ── Photo ──────────────────────────────────────────────────────────────────
export interface ProfilePhotoDto {
  id: string;
  fileName: string;
  contentType: string;
  photoSize: string;
  photo: string; // base64 or URL
}
