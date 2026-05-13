export const Gender = {
  "0": 'Male',
  "1": 'Female'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const GenderAm = {
  "0": 'ወንድ',
  "1": 'ሴት'
} as const;
export type GenderAm = typeof GenderAm[keyof typeof GenderAm];

export const PositionGender = {
  "0": 'Male',
  "1": 'Female',
  "2": 'Male/Female'
} as const;
export type PositionGender = typeof PositionGender[keyof typeof PositionGender];

export const PositionGenderAm = {
  "0": 'ወንድ',
  "1": 'ሴት',
  "2": 'ሁለቱም'
} as const;
export type PositionGenderAm = typeof PositionGenderAm[keyof typeof PositionGenderAm];

export const YesNo = {
  "0": 'Yes',
  "1": 'No'
} as const;
export type YesNo = typeof YesNo[keyof typeof YesNo];

export const YesNoAm = {
  "0": 'አዎ',
  "1": 'አይ'
} as const;
export type YesNoAm = typeof YesNoAm[keyof typeof YesNoAm];

export const WorkOption = {
  "0": 'Morning',
  "1": 'Afternoon',
  "2": 'Both',
  "3": 'None'
} as const;
export type WorkOption = typeof WorkOption[keyof typeof WorkOption];

export const WorkOptionAm = {
  "0": 'ጠዋት',
  "1": 'ከሰዓት',
  "2": 'ሁለቱም',
  "3": 'ምንም'
} as const;
export type WorkOptionAm = typeof WorkOptionAm[keyof typeof WorkOptionAm];

export const Per = {
  "0": 'Day',
  "1": 'Month',
  "2": 'Year'
} as const;
export type Per = typeof Per[keyof typeof Per];

export const PerAm = {
  "0": 'ቀን',
  "1": 'ወር',
  "2": 'አመት'
} as const;
export type PerAm = typeof PerAm[keyof typeof PerAm];

export const ProfessionType = {
  "0": 'Professional',
  "1": 'Semi-Professional',
  "2": 'Non-Professional'
} as const;
export type ProfessionType = typeof ProfessionType[keyof typeof ProfessionType];

export const EmpType = {
  "0": 'Replacement',
  "1": 'New Opening',
  "2": 'Additional Required',
  "3": 'Old Employee'
} as const;
export type EmpType = typeof EmpType[keyof typeof EmpType];

export const EmpNature = {
  "0": 'Permanent / Full-time',
  "1": 'Contract / Fixed-term',
  "2": 'Probation',
  "3": 'Intern / Trainee',
  "4": 'Part-time / Casual'
} as const;
export type EmpNature = typeof EmpNature[keyof typeof EmpNature];

export const MaritalStat = {
  "0": 'Single / Not Married',
  "1": 'Married',
  "2": 'Widow/er',
  "3": 'Divorced',
  "4": 'Not Mentioned'
} as const;
export type MaritalStat = typeof MaritalStat[keyof typeof MaritalStat];

export const AddressType = {
  "0": 'Residence',
  "1": 'Work Place'
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

export const WorkArrangement = {
  "0": 'On-site',
  "1": 'Remote',
  "2": 'Hybrid',
  "3": 'Shift-based',
  "4": 'Rotational / Roster-based'
} as const;
export type WorkArrangement = typeof WorkArrangement[keyof typeof WorkArrangement];

export const ReviewStat = {
  "0": 'Approve',
  "1": 'Modify',
  "2": 'Reject'
} as const;
export type ReviewStat = typeof ReviewStat[keyof typeof ReviewStat];

export const JobPostingType = {
  "0": 'Internal',
  "1": 'External',
  "2": 'Internal & External'
} as const;
export type JobPostingType = typeof JobPostingType[keyof typeof JobPostingType];

export const PostingStatus = {
  "0": 'Pending Approval',
  "1": 'Published',
  "2": 'Closed',
  "3": 'On Hold',
  "4": 'Cancelled'
} as const;
export type PostingStatus = typeof PostingStatus[keyof typeof PostingStatus];

export const PostStatus = {
  "0": 'Pending Approval',
  "1": 'On Hold',
  "2": 'Cancelled'
} as const;
export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export const ApplicationStatus = {
  "0": "Applied",
  "1": "Under Review",
  "2": "Shortlisted",
  "3": "Rejected",
  "4": "Withdrawn",
  "5": "Evaluation Passed",
  "6": "Offer Extended",
  "7": "Offer Accepted",
  "8": "Offer Rejected",
  "9": "On Hold",
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

/* =======================
   InterviewStatus
======================= */
export const InterviewStatus = {
  "0": "Scheduled",
  "1": "In Progress",
  "2": "Completed",
  "3": "Cancelled",
  "4": "Rescheduled",
  "5": "No Show",
} as const;

export type InterviewStatus =
  typeof InterviewStatus[keyof typeof InterviewStatus];


/* =======================
   OfferStatus
======================= */
export const OfferStatus = {
  "0": "Draft",
  "1": "Pending Approval",
  "2": "Approved",
  "3": "Rejected",
  "4": "Extended",
  "5": "Accepted",
  "6": "Declined",
  "7": "Withdrawn",
  "8": "Expired",
} as const;

export type OfferStatus =
  typeof OfferStatus[keyof typeof OfferStatus];


/* =======================
   EmployeeStatus
======================= */
export const EmployeeStatus = {
  "0": "Inactive",
  "1": "Active",
  "2": "On Leave",
  "3": "Suspended",
  "4": "Terminated",
  "5": "Retired",
} as const;

export type EmployeeStatus =
  typeof EmployeeStatus[keyof typeof EmployeeStatus];


/* =======================
   ApprovalStatus
======================= */
export const ApprovalStatus = {
  "0": "Pending",
  "1": "Approved",
  "2": "Rejected",
  "3": "Recalled",
  "4": "Escalated",
} as const;

export type ApprovalStatus =
  typeof ApprovalStatus[keyof typeof ApprovalStatus];


/* =======================
   OnboardingStatus
======================= */
export const OnboardingStatus = {
  "0": "Pending",
  "1": "In Progress",
  "2": "Completed",
  "3": "On Hold",
  "4": "Cancelled",
} as const;

export type OnboardingStatus =
  typeof OnboardingStatus[keyof typeof OnboardingStatus];

  export const ReqStatus = {
  "0": "Pending Approval",
  "1": "Approved",
  "2": "Rejected",
  "3": "Cancelled",
  "4": "Closed",
} as const;

export type ReqStatus =
  typeof ReqStatus[keyof typeof ReqStatus];

export const EmpState = {
  "0": "Pending",
  "1": "Approved",
  "2": "Active",
  "3": "Under Probation",
  "4": "Terminated",
  "5": "StandBy",
  "6": "Retired",
  "7": "On Leave",
} as const;

export type EmpState = typeof EmpState[keyof typeof EmpState];

export const ReviewDecision = {
  Accept: 'Accept',
  Decline: 'Decline',
} as const;

export type ReviewDecision = typeof ReviewDecision[keyof typeof ReviewDecision];

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
