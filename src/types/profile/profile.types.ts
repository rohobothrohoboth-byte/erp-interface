// ── Profile Info (header) ──────────────────────────────────────────────────
export interface ProfileInfoDto {
  fullName: string;
  fullNameAm: string;
  position: string;
  empState: string; // e.g. "Pending", "Active"
}

// ── Profile Card (GetProOverview) ─────────────────────────────────────────
export interface ProfileCardDto {
  tenure: string;
  perStr: string;
  training: string;
  attendPer: number;    // e.g. 78
  attendMonth: string;  // e.g. "May 2026"
  repToName: string;
  repToPos: string;
}

// ── Basic Info (GetProBasic — includes personal, employment, salary, address) ──
export interface ProfileBasicDto {
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
  // Address
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

// ── Emergency Contact (GetProEmContact) ───────────────────────────────────
export interface ProfileEmContactDto {
  hasContact: boolean;
  contact: {
    firstName: string;
    firstNameAm: string;
    middleName: string;
    middleNameAm: string;
    lastName: string;
    lastNameAm: string;
    nationality: string;
    gender: string;
    relation: string;
    telephone: string;
    country: string;
    region: string;
    subcity: string;
    zone: string;
    woreda: string;
    kebele: string;
    houseNo: string;
    poBox: string;
    addressType: string;
    fax: string;
    email: string;
    website: string;
  } | null;
}

// ── Family (GetProFamily) ──────────────────────────────────────────────────
export interface ProfileFamilyMemberDto {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  gender: string;
  relation: string;
}

export interface ProfileFamilyDto {
  employeeId: string;
  family: ProfileFamilyMemberDto[];
}


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
