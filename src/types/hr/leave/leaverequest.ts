import type { UUID } from "crypto";
import type { RawBaseDto } from "./BaseDto";

export type { UUID };

export interface LvRqstAddDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  comments: string;
}
export interface LeaveReqPendListDto {
  requestId: string;
  employeeId: string;
  employeeName: string;
  employeeNameAm: string;
  employeeCode: string;
  gender: string;
  departmentName: string;
  departmentNameAm: string;
  positionName: string;
  positionNameAm: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  isHalfDay: boolean;
  status: string;
  comments: string;
  requestedDate: string;
}

export interface LeaveReqOnLeaveDto {
  requestId: string;
  employeeId: string;
  employeeName: string;
  employeeNameAm: string;
  employeeCode: string;
  gender: string;
  departmentName: string;
  departmentNameAm: string;
  positionName: string;
  positionNameAm: string;
  branchName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
}
export interface LvRqstModDto {
  id: UUID;
  leaveTypeId: UUID;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  comments: string;
  rowVersion: string;
}

export interface LvRqstRevDto {
  id: string;
  decision: boolean;
  comment?: string;
}

export interface MyPendLvList extends RawBaseDto {
  daysRequestedStr: string;
  status: string;
  startDateStr: string;
  endDateStr: string;
  dateRequestedStr: string;
  leaveType: string;
  perApp: number;
  delMod: boolean;
  appStep: MyPendLvApp[];
}
export interface MyPendLvApp {
  step: string;
  appBy: string;
  decision: string;
  dateAppStr: string;
  isFinal: boolean;
  isCurrent: boolean;
  comment?: string | null;
}

export interface AppStepQryDto {
  id: UUID;
  empId: UUID;
  leaveTypeId: UUID;
  cur: number;
}

export interface PendLvReqList extends RawBaseDto {
  daysRequestedStr: string;
  status: string;
  startDateStr: string;
  endDateStr: string;
  dateRequestedStr: string;
  empName: string;
  code: string;
  leaveType: string;
  perApp: number;
}

export interface MyHistLvList {
  id: UUID;
  daysRequestedStr: string;
  status: string;
  startDateStr: string;
  endDateStr: string;
  dateRequestedStr: string;
  leaveType: string;
  perApp: number;
}

export interface HistLvReqList {
  id: UUID;
  daysRequestedStr: string;
  status: string;
  startDateStr: string;
  endDateStr: string;
  dateRequestedStr: string;
  empName: string;
  code: string;
  leaveType: string;
  perApp: number;
}

export interface LeaveReqDbList {
  name: string;
  nameAm: string;
  leaveType: string;
  reqDay: string;
}

export interface ViewLvReqJoin {
  id: string;
  dateAdd: string;
  startDate: string; 
  endDate: string; 
  daysRequested: number;
  isHalfDay: boolean;
  status: string;
  comments: string;
  currentAppStep: number;
  perApp: number;
  dateApp?: string | null; 
  employeeId: string; 
  branchId: string; 
  deptId: string; 
  leaveTypeId: string; 
  leaveType: string;
}

export interface ViewLvReqDto {
  employeeId: string; 
  totalDaysReq: string;
  status: string;
  startDate: string;
  endDate: string;
  dateRequested: string;
  dateApp: string;
  empName: string;
  empNameAm: string;
  code: string;
  gender: string;
  branch: string;
  dept: string;
  position: string;
  leaveType: string;
  perApp: number;
  appStep: MyPendLvApp[];
}