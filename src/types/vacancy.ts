export interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  status: 'open' | 'closed' | 'draft';
  postedDate: string;
  closingDate: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  openings: number;
  applicants: number;
  benefits?: string[];
  // New fields
  postNumber?: string;
  jobGrade?: string;
  requiredGender?: string;
  workArrangement?: string;
  keySkills?: string[];
}

export interface VacancyApplication {
  id: string;
  vacancyId: string;
  employeeId: string;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
}
