export type Department = {
  id: string;
  name: string;
  manager: string;
  location: string;
  status: "active" | "inactive";
  employeeCount: number;
  budget?: number;
  description?: string;
  createdAt: string;
};

export type DepartmentFormValues = Omit<Department, 'id' | 'employeeCount' | 'createdAt'>;