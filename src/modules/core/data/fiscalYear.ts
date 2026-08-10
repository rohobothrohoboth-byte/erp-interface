import type { FiscYearListDto } from '@/modules/core/types/fiscalYear';

export const initialFiscalYears: FiscYearListDto[] = [
  {
    id: '1',
    name: 'FY 2023',
    isActive: 'No',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    startDateAm: '2015-01-01',
    endDateAm: '2015-12-31',
    createdAt: '2022-11-15',
    createdAtAm: '2014-11-15',
    modifiedAt: '2023-01-10',
    modifiedAtAm: '2015-01-10',
    rowVersion: '1'
  },
  {
    id: '2',
    name: 'FY 2024',
    isActive: 'Yes',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    startDateAm: '2016-01-01',
    endDateAm: '2016-12-31',
    createdAt: '2023-11-20',
    createdAtAm: '2015-11-20',
    modifiedAt: '2024-01-05',
    modifiedAtAm: '2016-01-05',
    rowVersion: '1'
  }
];

export function convertToEthiopianDate(gregorianDate: string): string {
  const date = new Date(gregorianDate);
  const ethiopianYear = date.getFullYear() - 8;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${ethiopianYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};