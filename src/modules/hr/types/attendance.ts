export type DaySchedule = {
  day: string;
  startTime?: string;
  endTime?: string;
  isWorkingDay?: boolean;
  [key: string]: unknown;
};

export type ShiftSchedule = {
  id?: string;
  name?: string;
  days?: DaySchedule[];
  [key: string]: unknown;
};
