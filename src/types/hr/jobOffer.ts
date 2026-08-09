export interface JobOfferListDto {
  id: string;
  status: string;
  statusName?: string;
  jobApplicationId: string;
  offeredSalary?: number | null;
  currency?: string | null;
  startDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  hiredEmployeeId?: string | null;
  rowVersion?: string;
  [key: string]: unknown;
}

export interface JobOfferAddDto {
  jobApplicationId: string;
  offeredSalary?: number | null;
  currency?: string | null;
  startDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface JobOfferHireDto {
  id: string;
  rowVersion?: string;
  [key: string]: unknown;
}
