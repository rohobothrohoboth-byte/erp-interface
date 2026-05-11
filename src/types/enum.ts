export const AbsentReason = {
  "0": "Late",
  "1": "DD",
  "2": "Absent",
} as const;
export type AbsentReason = (typeof AbsentReason)[keyof typeof AbsentReason];

export const AdmissionType = {
  "0": "Regular",
  "1": "Extension",
  "2": "Distance",
  "3": "Unknown",
} as const;
export type AdmissionType = (typeof AdmissionType)[keyof typeof AdmissionType];

export const AwardReason = {
  "0": "Good Manner",
  "1": "Better Service",
  "2": "Other",
} as const;
export type AwardReason = (typeof AwardReason)[keyof typeof AwardReason];

export const AwardType = {
  "0": "Certificate",
  "1": "Cash",
  "2": "Other",
} as const;
export type AwardType = (typeof AwardType)[keyof typeof AwardType];

export const CommitteeRole = {
  "0": "Member",
  "1": "Chair Person",
  "2": "Secretary",
} as const;
export type CommitteeRole = (typeof CommitteeRole)[keyof typeof CommitteeRole];

export const CriterionType = {
  "0": "Education Type",
  "1": "Practical Exam",
  "2": "Work Experience",
  "3": "Clean from any Disciplinary Case",
  "4": "Armed Exam",
  "5": "Document",
  "6": "Physical Appearance",
  "7": "Education Level",
  "8": "Written Exam",
  "9": "Work Experience In Company",
  "10": "Performance",
} as const;
export type CriterionType = (typeof CriterionType)[keyof typeof CriterionType];

export const EducationLevel = {
  "0": "Preparatory",
  "1": "Collage",
  "2": "TVT",
  "3": "University",
  "4": "Elementary",
  "5": "None",
  "6": "High School",
} as const;
export type EducationLevel =
  (typeof EducationLevel)[keyof typeof EducationLevel];

export const HolidayCondition = {
  "0": "Half Day",
  "1": "Full Day",
} as const;
export type HolidayCondition =
  (typeof HolidayCondition)[keyof typeof HolidayCondition];

export const LanguageSkill = {
  "0": "Writing",
  "1": "Listening",
  "2": "Speaking",
  "3": "Reading",
} as const;
export type LanguageSkill = (typeof LanguageSkill)[keyof typeof LanguageSkill];

export const LeaveCondition = {
  "0": "With Half Salary",
  "1": "With No Salary",
  "2": "With Full Salary",
} as const;
export type LeaveCondition =
  (typeof LeaveCondition)[keyof typeof LeaveCondition];

export const LeaveType = {
  "0": "Annual Leave",
  "1": "Maternity Leave",
  "2": "Sick Leave",
  "3": "Paternity Leave",
  "4": "Court Case",
  "5": "Mourning Leave",
  "6": "Wedding Leave",
  "7": "Education Level",
  "8": "Prenatal Leave",
  "9": "Pregnancy Leave",
} as const;
export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

export const LeaveUsage = {
  "0": "Half Day",
  "1": "Full Day",
} as const;
export type LeaveUsage = (typeof LeaveUsage)[keyof typeof LeaveUsage];

export const MeasureTaken = {
  "0": "Promoted",
  "1": "Salary Increment",
} as const;
export type MeasureTaken = (typeof MeasureTaken)[keyof typeof MeasureTaken];

export const MeasureType = {
  "0": "2 Days Salary",
  "1": "5 Days Salary",
  "2": "10 Days Salary",
  "3": "15 Days Salary",
  "4": "One Month Salary",
  "5": "Primary Written Warning",
  "6": "Secondary Written Warning",
  "7": "Final Written Warning",
  "8": "Transfer",
} as const;
export type MeasureType = (typeof MeasureType)[keyof typeof MeasureType];

export const PerformanceEvaluation = {
  "0": "Good",
  "1": "V.Good",
  "2": "Fair",
  "3": "Excellent",
} as const;
export type PerformanceEvaluation =
  (typeof PerformanceEvaluation)[keyof typeof PerformanceEvaluation];

export const PositionChangeReason = {
  "0": "Demotion",
  "1": "Performance",
  "2": "Computation",
} as const;

export type PositionChangeReason =
  (typeof PositionChangeReason)[keyof typeof PositionChangeReason];

export const Rating = {
  "0": "V.Good",
  "1": "Good",
  "2": "Fair",
  "3": "Excellent",
  "4": "Unsatisfactory",
} as const;

export type Rating =
  (typeof Rating)[keyof typeof Rating];

export const Relation = {
  "0": "Daughter",
  "1": "Father",
  "2": "Brother",
  "3": "Son",
  "4": "Aunt",
  "5": "Sister",
  "6": "Wife",
  "7": "Uncle",
  "8": "Husband",
  "9": "Mother",
  "10": "Child",
  "11": "Friend",
   "12": "Unknown",
} as const;

export type Relation =
  (typeof Relation)[keyof typeof Relation];

export const ReportType = {
  "0": "Weekly",
  "1": "Monthly",
  "2": "3 Months",
  "3": "6 Months",
  "4": "9 Months",
  "5": "Yearly",
} as const;

export type ReportType =
  (typeof ReportType)[keyof typeof ReportType];

export const SalaryChangeReason = {
  "0": "Performance",
  "1": "Annual Increment",
  "2": "Promotion",
} as const;

export type SalaryChangeReason =
  (typeof SalaryChangeReason)[keyof typeof SalaryChangeReason];

export const SkillLevel = {
  "0": "Satisfactory",
  "1": "Excellent",
  "2": "Very Good",
  "3": "Good",
  "4": "Beginner",
} as const;

export type SkillLevel =
  (typeof SkillLevel)[keyof typeof SkillLevel];

export const SponsorType = {
  "0": "Government",
  "1": "Self Sponsored",
  "2": "Unknown",
} as const;

export type SponsorType =
  (typeof SponsorType)[keyof typeof SponsorType];

export const TerminationReason = {
  "0": "በሞት",
  "1": "Pension",
  "2": "Transfer",
  "3": "Termination of Contract",
  "4": "ሌላ/ባልታወቀ",
  "5": "በራሱ",
  "6": "ስነ ምግባር",
} as const;

export type TerminationReason =
  (typeof TerminationReason)[keyof typeof TerminationReason];

export const TrainingSource = {
  "0": "Based on Training Need Analysis",
  "1": "New",
  "2": "Transferred From Last year",
} as const;

export type TrainingSource =
  (typeof TrainingSource)[keyof typeof TrainingSource];

export const TrainingType = {
  "0": "Promotional Training",
  "1": "Off The Job Training",
  "2": "On The Job Training",
  "3": "Induction Training",
} as const;

export type TrainingType =
  (typeof TrainingType)[keyof typeof TrainingType];

export const TransferReason = {
  "0": "በራሶ ጥያቄ",
  "1": "ዝውውር",
  "2": "ቅጣት",
  "3": "የተሻለ ስራ",
  "4": "Unknown",
  "5": "በስራ ምክንያት",
} as const;

export type TransferReason =
  (typeof TransferReason)[keyof typeof TransferReason];

export const VoucherType = {
  "0": "PCPV",
  "1": "JV",
  "2": "BPV",
  "3": "CRV",
} as const;

export type VoucherType =
  (typeof VoucherType)[keyof typeof VoucherType];