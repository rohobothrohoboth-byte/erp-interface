
import type { AddressType, EmpNature, EmpType, Gender, MaritalStat, WorkArrangement, YesNo } from "../enum";
import type { UUID } from 'crypto';

export type { UUID };
export interface Step1Dto {
    firstName: string;
    firstNameAm: string;
    middleName: string;
    middleNameAm: string; // Fixed: was liddleNameAm
    lastName: string;
    lastNameAm: string;
    nationality: string;
    gender: Gender;
    employmentDate: string;
    jobGradeId: UUID;
    positionId: UUID;
    departmentId: UUID;
    jgStepId: UUID;
    employmentType: EmpType;
    employmentNature: EmpNature;
    workArrangement: WorkArrangement;
    File: File | null; // Fixed: proper File type
    birthDate: string;
    maritalStatus: MaritalStat;

      addressType: AddressType;
    // addressTypeStr: string;
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

export interface Step2Dto {
    firstName: string;
    middleName: string; // Fixed: was liddleNameAm
    lastName: string;
    nationality: string;
    gender: Gender;
    relation: string;
    employeeId: UUID;
    addressType: AddressType;
    country: string;
    region: string;
    subcity: string;
    zone: string;
    woreda: string;
    kebele: string;
    houseNo: string;
    telephone: string;
    poBox?: string;
    fax?: string;
    email?: string;
    website?: string;
    File?: File | null; // Fixed: proper File type
}

// export interface Step2Dto {
//     birthDate: string;
//     birthLocation: string;
//     motherFullName: string;
//     hasBirthCert: YesNo;
//     hasMarriageCert: YesNo;
//     maritalStatus: MaritalStat;
//     employeeId: UUID;
//     tin: string;
//     bankAccountNo: string;
//     pensionNumber: string;
//     addressType: AddressType;
//     // addressTypeStr: string;
//     country: string;
//     region: string;
//     subcity: string;
//     zone: string;
//     woreda: string;
//     kebele: string;
//     houseNo: string;
//     telephone: string;
//     poBox: string;
//     fax: string;
//     email: string;
//     website: string;
// }

// export interface Step3Dto {
//   firstName: string;
//   firstNameAm: string;
//   middleName: string;
//   middleNameAm: string; // Fixed: was liddleNameAm
//   lastName: string;
//   lastNameAm: string;
//   nationality: string;
//   gender: Gender;
//   relation: string;
//   addressType: AddressType;
//   country: string;
//   region: string;
//   subcity: string;
//   zone: string;
//   woreda: string;
//   kebele: string;
//   houseNo: string;
//   telephone: string;
//   poBox: string;
//   fax: string;
//   email: string;
//   website: string;
//   employeeId: UUID;
// }

// export interface Step4Dto {
//     firstName: string;
//     firstNameAm: string;
//     middleName: string;
//     middleNameAm: string; // Fixed: was liddleNameAm
//     lastName: string;
//     lastNameAm: string;
//     nationality: string;
//     gender: Gender;
//     relation: string;
//     employeeId: UUID;
//     addressType: AddressType;
//     country: string;
//     region: string;
//     subcity: string;
//     zone: string;
//     woreda: string;
//     kebele: string;
//     houseNo: string;
//     telephone: string;
//     poBox: string;
//     fax: string;
//     email: string;
//     website: string;
//     File: File | null; // Fixed: proper File type
// }

export interface EmpAddPrintDto {
    // Basic Info
    employeeId: UUID; //Employee
    photo: string;
    fullName: string;
    fullNameAm: string;
    code: string;
    gender: string;
    nationality: string;
    employmentDate: string;
    employmentDateAm: string;
    jobGrade: string;
    position: string;
    department: string;
    branch: string;
    employmentType: string;
    employmentNature: string;
    workArr: string;

    // Biographical
    birthDate: string;
    birthDateAm: string;
    birthLocation: string;
    motherFullName: string;
    hasBirthCert: string;
    hasMarriageCert: string;
    maritalStatus: string;
    tin: string;
    bankAccountNo: string;
    pensionNumber: string;
    address: string;
    telephone: string;

    // Emergency Contact
    // conFullName: string;
    // conFullNameAm: string;
    // conNationality: string;
    // conGender: string;
    // conRelation: string;
    // conAddress: string;
    // conTelephone: string;

    // Guarantor
    guaFullName: string;
    guaFullNameAm: string;
    guaNationality: string;
    guaGender: string;
    guaRelation: string;
    guaAddress: string;
    guaTelephone: string;
    guaFileName: string;
    guaFileSize: string;
    guaFileType: string;
}

export interface BasicInfoDto {
  employeeId: UUID;
  photo: string;
  fullName: string;
  fullNameAm: string;
  code: string;
  gender: string;
  nationality: string;
  employmentDate: string;
  employmentDateAm: string;
  jobGrade: string;
  position: string;
  department: string;
  branch: string;
  employmentType: string;
  employmentNature: string;
  workArrangement: string;
}

export interface EmpAddRes {
    id: UUID;
}