export const YesNoAm = {
  "0": 'አዎ',
  "1": 'አይ'
} as const;
export type YesNoAm = typeof YesNoAm[keyof typeof YesNoAm];

export const YesNo = {
  "0": 'Yes',
  "1": 'No'
} as const;
export type YesNo = typeof YesNo[keyof typeof YesNo];

export const BranchType = {
  "0": 'Head Office',
  "1": 'Regional',
  "2": 'Local',
  "3": 'Virtual'
} as const;
export type BranchType = typeof BranchType[keyof typeof BranchType];

export const BranchStat = {
  "0": 'Active',
  "1": 'Inactive',
  "2": 'Under construction'
} as const;
export type BranchStat = typeof BranchStat[keyof typeof BranchStat];

export const DeptStat = {
  "0": 'Active',
  "1": 'Inactive'
} as const;
export type DeptStat = typeof DeptStat[keyof typeof DeptStat];

// Period Quarter enum
export const Quarter = {
  "0": '1st Quarter',
  "1": '2nd Quarter',
  "2": '3rd Quarter',
  "3": '4th Quarter'
} as const;
export type Quarter = typeof Quarter[keyof typeof Quarter];

export const PeriodStat = {
  "0": 'Active',
  "1": 'Inactive'
} as const;
export type PeriodStat = typeof PeriodStat[keyof typeof PeriodStat];

export const LeaveCategory = {
  "0": 'Paid',
  "1": 'Unpaid',
  "2": 'Special'
} as const;
export type LeaveCategory = typeof LeaveCategory[keyof typeof LeaveCategory];

export const PolicyGender = {
  "0": 'Male',
  "1": 'Female',
  "2": 'Male & Female'
} as const;
export type PolicyGender = typeof PolicyGender[keyof typeof PolicyGender];

export const LeaveCondition = {
  "0": "With Half Salary",
  "1": "With Full Salary",
  "2": "With No Salary",
} as const;
export type LeaveCondition = (typeof LeaveCondition)[keyof typeof LeaveCondition];

export const ApprovalRole = {
  "0": "Manager",
  "1": "Hr",
  "2": "Director",


} as const;
export type ApprovalRole = (typeof ApprovalRole)[keyof typeof ApprovalRole];

export const PolicyStatus = {
  "0": "Active",
  "1": "Inactive",
} as const;
export type PolicyStatus = (typeof PolicyStatus)[keyof typeof PolicyStatus];

export const ConditionOperator = {
  "0": "Equals",
  "1": "Not Equals",
  "2": "Greater than",
  "3": "Less than",
  "4": "Greater than or Equals",
  "5": "Less than or Equals",
} as const;
export type ConditionOperator =
  (typeof ConditionOperator)[keyof typeof ConditionOperator];

  export const Priority = {
    "0": "High",
    "1": "Medium",
    "2": "Low",
  } as const;
  export type Priority = (typeof Priority)[keyof typeof Priority];

  export const ConditionField = {
    "0": "Employement Nature",
    "1": "Gender",
    "2": "Service Months",
    "3": "Work Arrangement",
    "4": "Job Grade",
  } as const;
  export type ConditionField =
    (typeof ConditionField)[keyof typeof ConditionField];


export const LedgerSource = {
  "0": "Accrual",
  "1": "Leave Approved",
  "2": "Adjustment",
  "3": "Encashment",
  "4": "Carry Over",
  "5": "Expiry",
} as const;
export type LedgerSource = (typeof LedgerSource)[keyof typeof LedgerSource];

 export const LedgerEntryType = {
   "0": "Accrual",
   "1": "Request",
   "2": "Approval",
   "3": "Deduction",
 } as const;
 export type LedgerEntryType =
   (typeof LedgerEntryType)[keyof typeof LedgerEntryType];

   export const AccuralSource = {
     "0": "SYSTEM",
     "1": "MANUAL",
   } as const;
   export type AccuralSource = (typeof AccuralSource)[keyof typeof AccuralSource];

   export const EmpLeavePolReason = {
     "0": "Employee Onboarding",
     "1": "Request",
     "2": "Transfer",
     "3": "Policy Migration",
   } as const;
   export type EmpLeavePolReason =
     (typeof EmpLeavePolReason)[keyof typeof EmpLeavePolReason];

     export const AccrualFrequency = {
       "0": "Annual",
       "1": "BiAnnual",
       "2": "Quarterly",
       "3": "Monthly",
       "4": "Daily",
       "5": "None",
     } as const;
     export type AccrualFrequency =
       (typeof AccrualFrequency)[keyof typeof AccrualFrequency];

        export const Status = {
          "0": "Pending",
          "1": "Approved",
          "2": "Rejected",
          "3": "Cancelled",
        } as const;
      export type Status =
          (typeof Status)[keyof typeof Status];