// ── ProInfo ────────────────────────────────────────────────────────────────
export interface ProInfo {
  fullName: string;
  fullNameAm: string;
  position: string;
  empState: string;
}

// ── ProOverview ────────────────────────────────────────────────────────────
export interface ProOverview {
  tenure: string;
  perStr: string;
  training: string;
  attendPer: number;
  attendMonth: string;
  repToName: string;
  repToPos: string;
}

// ── ProBasic ───────────────────────────────────────────────────────────────
export interface ProBasic {
  // Personal
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

// ── ProBio ─────────────────────────────────────────────────────────────────
export interface ProBio {
  id: string;
  birthLocation: string;
  motherFullName: string;
  hasBirthCert: string;
  hasMarriageCert: string;
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
  // Birth cert file
  biCertId: string | null;
  biCertName: string;
  biCertType: string;
  biCertSize: string;
  // Marriage cert file
  maCertId: string | null;
  maCertName: string;
  maCertType: string;
  maCertSize: string;
}

// ── ProContactList ─────────────────────────────────────────────────────────
export interface ProContactList {
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

// ── ProContact ─────────────────────────────────────────────────────────────
export interface ProContact {
  employeeId: string;
  hasContact: boolean;
  contact: ProContactList | null;
}

// ── ProFamilyList ──────────────────────────────────────────────────────────
export interface ProFamilyList {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  relation: string;
  gender: string;
  nationality: string;
}

// ── ProFamily ──────────────────────────────────────────────────────────────
export interface ProFamily {
  employeeId: string;
  family: ProFamilyList[];
}

// ── EmpGuaranty ────────────────────────────────────────────────────────────
export interface EmpGuaranty {
  fullName: string;
  gender: string;
  relation: string;
  nationality: string;
  telephone: string;
  email: string;
  // Address
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
  // File
  fileId: string;
  fileName: string;
  contentType: string;
  fileSizeStr: string;
}

// ── Photo ──────────────────────────────────────────────────────────────────
export interface ProfilePhotoDto {
  id: string;
  fileName: string;
  contentType: string;
  photoSize: string;
  photo: string;
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

// ── Mod DTOs (request bodies) ──────────────────────────────────────────────
export interface EmpBioModDto {
  id: string;
  birthLocation: string;
  motherFullName: string;
  hasBirthCert: string;
  hasMarriageCert: string;
  file1?: File | null; // birth cert
  file2?: File | null; // marriage cert
}

export interface EmpFinanceModDto {
  id: string;
  tin: string;
  bankAccountNo: string;
  pensionNumber: string;
}

export interface EmContactModDto {
  employeeId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  relation: string;
  addressType: string;
  country?: string;
  region: string;
  subcity?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  houseNo?: string;
  telephone: string;
  poBox?: string;
  fax?: string;
  email?: string;
  website?: string;
}

export interface EmpFamilyAddDto {
  employeeId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  relation: string;
}

export interface EmpFamilyModDto {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  relation: string;
}

// ── Legacy aliases (keep queries compiling without touching profile.queries.ts) ──
export type ProfileInfoDto      = ProInfo;
export type ProfileCardDto      = ProOverview;
export type ProfileBasicDto     = ProBasic;
export type ProfileBioDto       = ProBio ;
export type ProfileEmContactDto = ProContact;
export type ProfileFamilyDto    = ProFamily;
export type EmpGuarantyaDto    = EmpGuaranty;
