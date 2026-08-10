export interface Department {
  id: string;
  name: string;
  manager: string;
  location: string;
  status: "active" | "inactive";
  employeeCount: number;
  budget?: number;
  description: string;
  createdAt: string;
  companyId: number; 
  branchId?: string; 
}

export const initialDepartments: Department[] = [
  {
    id: "dept-1",
    name: "Engineering",
    manager: "John Smith",
    location: "Addis Ababa",
    status: "active",
    employeeCount: 42,
    budget: 1200000,
    description: "Software development and engineering team",
    createdAt: "2022-01-15",
    companyId: 1, 
    branchId: "1"
  },
  {
    id: "dept-2",
    name: "Marketing",
    manager: "Sarah Johnson",
    location: "Addis Ababa",
    status: "active",
    employeeCount: 18,
    budget: 800000,
    description: "Marketing and communications",
    createdAt: "2022-02-20",
    companyId: 2,
    branchId: "1" 
  },
  {
    id: "dept-3",
    name: "Human Resources",
    manager: "Michael Brown",
    location: "Bahir Dar",
    status: "active",
    employeeCount: 10,
    budget: 500000,
    description: "HR and talent management",
    createdAt: "2022-01-10",
    companyId: 1,
    branchId: "2"
  },
  {
    id: "dept-4",
    name: "Finance",
    manager: "Emily Davis",
    location: "Addis Ababa",
    status: "active",
    employeeCount: 12,
    budget: 950000,
    description: "Financial operations and accounting",
    createdAt: "2022-03-05",
    companyId: 1,
    branchId: "1"
  },
  {
    id: "dept-5",
    name: "Operations",
    manager: "David Wilson",
    location: "Dire Dawa",
    status: "inactive",
    employeeCount: 0,
    budget: 300000,
    description: "Business operations (currently inactive)",
    createdAt: "2022-04-12",
    companyId: 2,
    branchId: "2"
  },
  {
    id: "dept-6",
    name: "Product Management",
    manager: "Jessica Lee",
    location: "Addis Ababa",
    status: "active",
    employeeCount: 8,
    budget: 700000,
    description: "Product strategy and roadmap",
    createdAt: "2022-05-18",
    companyId: 1,
    branchId: "1"
  },
  {
    id: "dept-7",
    name: "Customer Support",
    manager: "Robert Taylor",
    location: "Mekelle",
    status: "active",
    employeeCount: 25,
    budget: 600000,
    description: "Customer service and support",
    createdAt: "2022-06-22",
    companyId: 3,
    branchId: "2"
  },
  {
    id: "dept-8",
    name: "Design",
    manager: "Amanda Clark",
    location: "Addis Ababa",
    status: "active",
    employeeCount: 9,
    budget: 550000,
    description: "UI/UX and graphic design",
    createdAt: "2022-07-30",
    companyId: 3, 
    branchId: "1"
  }
];