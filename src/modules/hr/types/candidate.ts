export type Candidate = {
  id: string;
  name: string;
  position: string;
  source: string;
  stage: string;
  status: string;
  department: string;
  appliedDate: string;
  daysInStage: number;
  email: string;
  phone: string;
  resume: string;
  interviewDate?: string;
  experience: string;
  skills: string[];
  notes: string;
  education: string;
  location: string;
  salaryExpectation: string;
  history: {
    date: string;
    stage: string;
    status: string;
    note: string;
  }[];
};

export type HistoryEntry = {
  date: string;
  stage: string;
  status: string;
  note: string;
};