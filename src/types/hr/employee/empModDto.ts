import type { UUID } from 'crypto';

interface BaseDto{
  rowVersion: string;
  isDeleted: boolean;
  id: UUID;
}

// ── EmpModBasicDto ─────────────────────────────────────────────────────────
export interface EmpModBasicDto extends BaseDto {
  branchId:         UUID;
  jobGradeId:       UUID;
  jgStepId:         UUID;
  positionId:       UUID;
  departmentId:     UUID;
  firstName:        string;
  firstNameAm:      string;
  middleName:       string;
  middleNameAm:     string;
  lastName:         string;
  lastNameAm:       string;
  gender:           string; // enum.Gender
  nationality:      string;
  employmentDate:   string; // ISO string
  employmentType:   string; // enum.EmpType
  employmentNature: string; // enum.EmpNature
  workArrangement:  string; // enum.WorkArrangement
  file?:            File | null;
}

// ── EmpModBioDto ───────────────────────────────────────────────────────────
export interface EmpModBioDto  extends BaseDto {
  employeeId:    UUID;
  hasData:       boolean;
  birthDate:     string; // ISO string
  birthLocation: string;
  motherFullName:string;
  maritalStatus: string; // enum.MaritalStatus
  tin:           string;
  bankAccountNo: string;
  pensionNumber: string;
  addressType:   string; // enum.AddressType
  country?:      string;
  region:        string;
  subcity?:      string;
  zone?:         string;
  woreda?:       string;
  kebele?:       string;
  houseNo?:      string;
  telephone:     string;
  poBox?:        string;
  fax?:          string;
  email?:        string;
  website?:      string;
}

// ── EmpModGuarDto ──────────────────────────────────────────────────────────
export interface EmpModGuarDto  extends BaseDto {
  employeeId:  UUID;
  hasData:     boolean;
  firstName:   string;
  middleName:  string;
  lastName:    string;
  gender:      string; // enum.Gender
  nationality: string;
  relation:    string; // enum.Relation
  addressType: string; // enum.AddressType
  country?:    string;
  region:      string;
  subcity?:    string;
  zone?:       string;
  woreda?:     string;
  kebele?:     string;
  houseNo?:    string;
  telephone:   string;
  poBox?:      string;
  fax?:        string;
  email?:      string;
  website?:    string;
  file?:       File | null;
}

// ── ModFileDto ─────────────────────────────────────────────────────────────
export interface ModFileDto {
  id:         UUID;
  employeeId: UUID;
  file:       File;
}
