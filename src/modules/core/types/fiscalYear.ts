export type YesNo = 'Yes' | 'No';

export type FiscYearListDto = {
  id: string;
  name: string;
  isActive: YesNo;
  startDate: string;
  endDate: string;
  startDateAm: string;
  endDateAm: string;
  createdAt: string;
  createdAtAm: string;
  modifiedAt: string;
  modifiedAtAm: string;
  rowVersion: string;
};

export type NewFiscalYear = {
  name: string;
  dateStart: string;
  dateEnd: string;
  isActive: YesNo;
};