import type { OnLeaveEmployee } from "@/modules/hr/components/dashboard/OnLeaveEmployee";

export const dashboardMetrics = {
  totalEmployees: 110,
  activeEmployees: 105,
  onLeaveEmployees: 5,
  openPositions: 8,
  newHires: 12,
  turnoverRate: 3.2,
  averageTenure: 3.6,
  upcomingTrainings: 4,
  pendingLeaveRequests: 7,
  pendingAppraisals: 15,
};

interface Department {
  id: string;
  name: string;
  employeeCount: number;
  vacancies: number;
  manager: string;
  location: string;
}

export const departments: Department[] = [
  {
    id: 'd1',
    name: 'Human Resources',
    employeeCount: 15,
    vacancies: 2,
    manager: 'John Smith',
    location: 'New York'
  },
  {
    id: 'd2',
    name: 'Something',
    employeeCount: 42,
    vacancies: 5,
    manager: 'Robert Chen',
    location: 'San Francisco'
  },
  {
    id: 'd3',
    name: 'Marketing',
    employeeCount: 18,
    vacancies: 1,
    manager: 'Lisa Wagner',
    location: 'Chicago'
  },
  {
    id: 'd4',
    name: 'Sales',
    employeeCount: 23,
    vacancies: 3,
    manager: 'Carlos Rodriguez',
    location: 'Miami'
  },
  {
    id: 'd5',
    name: 'Finance',
    employeeCount: 12,
    vacancies: 0,
    manager: 'Jennifer Kim',
    location: 'New York'
  },
];

export const employeeStatusData = {
  active: 120,
  inactive: 35,
}

// pending activities data

export interface TimeOffRequest {
  name: string
  avatar: string
  days: number
  reason: string
}

export interface AttendanceApproval {
  name: string
  avatar: string
  hoursCompleted: number
  totalHours: number
}

export const timeOffRequests: TimeOffRequest[] = [
  { name: 'John Doe', avatar: 'avatar1.png', days: 3, reason: 'Vacation' },
  { name: 'Jane Smith', avatar: 'avatar2.png', days: 2, reason: 'Medical Leave' },
]

export const attendanceApprovals: AttendanceApproval[] = [
  { name: 'Alice Brown', avatar: 'avatar3.png', hoursCompleted: 6, totalHours: 8 },
  { name: 'Bob Johnson', avatar: 'avatar4.png', hoursCompleted: 4, totalHours: 6 },
]

//recent activity

export interface ActivityItem {
  name: string
  jobTitle: string
  time: string
  status: 'Hired' | 'Promoted' | 'Left' | 'On Leave'
}

export const recentActivities: ActivityItem[] = [
  { name: 'John Doe', jobTitle: 'Manager', time: 'Today, 10:45 AM', status: 'Promoted' },
  { name: 'Emily Carter', jobTitle: 'Manager', time: 'Yesterday, 2:30 PM', status: 'On Leave' },
  { name: 'David Kim', jobTitle: 'lvl 1 employee', time: 'May 15, 4:15 PM', status: 'Hired' },
  { name: 'Sophia Lee', jobTitle: 'HR Specialist', time: 'May 14, 11:20 AM', status: 'Left' },
]
// Upcoming events

export interface EventItem {
  title: string
  date: string
  time: string
  location: string
  type?: 'Meeting' | 'Holiday' | 'Training'
}

export const upcomingEvents: EventItem[] = [
  {
    title: 'Quarterly Team Meeting',
    date: 'June 5, 2025',
    time: '10:00 AM – 11:30 AM',
    location: 'Conference Room A',
    type: 'Meeting',
  },
  {
    title: 'Annual Company Picnic',
    date: 'June 12, 2025',
    time: 'All Day',
    location: 'Central Park',
    type: 'Holiday',
  },
  {
    title: 'Leadership Workshop',
    date: 'June 20, 2025',
    time: '2:00 PM – 4:00 PM',
    location: 'Zoom',
    type: 'Training',
  },
]

export const onLeaveEmployees: OnLeaveEmployee[] = [
  {
    empFullName: "Abel Tesfaye",
    empFullNameAm: "አበል ተስፋዬ",
    gender: "Male",
    department: "IT",
    position: "Software Engineer",
    leaveType: "Annual",
  },
  {
    empFullName: "Selamawit Haile",
    empFullNameAm: "ሰላማዊት ሀይሌ",
    gender: "Female",
    department: "HR",
    position: "HR Officer",
    leaveType: "Sick",
  },
  {
    empFullName: "Daniel Yohannes",
    empFullNameAm: "ዳንኤል ዮሐንስ",
    gender: "Male",
    department: "Finance",
    position: "Accountant",
    leaveType: "Maternity",
  },
  {
    empFullName: "Hanna Mulu",
    empFullNameAm: "ሐና ሙሉ",
    gender: "Female",
    department: "Marketing",
    position: "Marketing Specialist",
    leaveType: "Unpaid",
  },
];