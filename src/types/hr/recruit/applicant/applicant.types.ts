// src/types/hr/recruit/applicant/applicant.types.ts

export interface JobAppInfoDto {
    id: string;
    postType: string;
    applicantId?: string | null;
    employeeId?: string | null;
    positionId: string;
    jgStepId: string;
    departmentId: string;
    periodId: string;
    jobApplicationId: string;
    applicant: string;
    postNumber: string;
    reqNumber: string;
    planCode: string;
    title: string;
    desc: string;
    qualification: string;
    keySkills: string;
    workLocation: string;
    preGender: string;
    contractType: string;
    position: string;
    jgStep: string;
    department: string;
    period: string;
}

export interface ApplicantListDto {
    id: string;
    applicant: string;
    email: string;
    phone?: string;
    position: string;
    department: string;
    statusStr: string;
    appliedDate: string;
    jobPostingNum?: string;
    jobPostingId?: string;
    dateAdd?: string;
    dateMod?: string;
    isDeleted: boolean;
    rowVersion: string;
}

// ✅ Extended ApplicantDetailDto with all fields needed for evaluation
export interface ApplicantDetailDto extends ApplicantListDto {
    coverLetter?: string;
    jobPostingId?: string;
    // ✅ Additional fields from JobAppInfo
    jobApplicationId?: string;
    postNumber?: string;
    reqNumber?: string;
    jgStep?: string;
    title?: string;
    contractType?: string;
    workLocation?: string;
    period?: string;
    qualification?: string;
    keySkills?: string;
    planCode?: string;
    desc?: string;
    preGender?: string;
    positionId?: string;
    jgStepId?: string;
    departmentId?: string;
    periodId?: string;
}