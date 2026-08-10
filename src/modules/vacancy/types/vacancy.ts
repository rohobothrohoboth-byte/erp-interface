// src/types/vacancy.ts

// src/types/vacancy.ts

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  departmentId?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship';
  status: 'open' | 'closed' | 'draft' | 'pending';
  postedDate: string;
  closingDate: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  keySkills: string[];
  salary?: string;
  jobGrade?: string;
  openings: number;
  applicants: number;
  requiredGender?: string;
  workArrangement?: string;
  employmentNature?: string;
  isInternal: boolean;
  externalUrl?: string;
  postNumber?: string;
  postTypeStr?: string;
}

export interface VacancyFilter {
  department?: string;
  location?: string;
  type?: string;
  status?: string;
  isInternal?: boolean;
  searchTerm?: string;
}

export interface VacancyApplication {
  id: string;
  vacancyId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  updatedDate: string;
}

// src/types/vacancy.ts

export interface VacancyListItem {
  id: string;
  numOpen: number;
  postNumber: string;
  position: string;
  department: string;
  location: string;
  empNatureStr: string;
  preGenderStr: string;
  jobGrade: string;
  isInternal: boolean;
  postTypeStr: string;
  datePosted: string;
  deadline: string;
}

// src/types/vacancy.ts

export interface VacancyDetail {
  id: string;
  numOpen: number;
  postNumber: string;
  position: string;
  department: string;
  location: string;
  jobGrade: string;
  salary: string;
  empNatureStr: string;
  preGenderStr: string;
  workArrStr: string;
  isInternal: boolean;
  postTypeStr: string;
  datePosted: string;
  deadline: string;
  jobDesc: string;
  keyRespoList: string[];  // ✅ Changed from keyRespo
  reqQualList: string[];   // ✅ Changed from reqQual
  keySkillsList: string[]; // ✅ Changed from keySkills
}