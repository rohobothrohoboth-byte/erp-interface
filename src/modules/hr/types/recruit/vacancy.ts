import type { BaseDto } from "@/modules/hr/types/recruit/BaseDto";


export interface vacancyListDto extends BaseDto{
    numOpen: number;
    postNumber: string;
    position: string;
    location: string;
    workArr: string;
    datePosted: string;
    deadline: string;
    jobGrade: string;
}

export interface VacancyDetailDto extends BaseDto{
    numOpen: number;
    position: string;
    location: string;
    workArr: string;
    datePosted: string;
    deadline: string;
    jobGrade: string;
    numApp: number;
    jgStep: string;
    jobDesc: string;
    qualification: string;
    keySkills: string;
    workLocation: string;
    preGenderStr: string;
    contactTypeStr: string;
}