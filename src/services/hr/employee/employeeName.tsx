// services/hr/employee/employeeName.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import type { NameListDto } from "../../../types/hr/NameListDto";

export const employeeService = () => {
  const getAllNames = useQuery({
    queryKey: ["employees", "names"],
    queryFn: async (): Promise<NameListDto[]> => {
      try {
        const response = await api.get("/hrm/profile/v1/Employee/AllEmployee");
        return response.data?.data || [];
      } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
      }
    },
  });

  // ADD THIS METHOD - Fetch single employee by ID
  const getEmployeeById = async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/hrm/profile/v1/Employee/GetEmployee/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error("Error fetching employee:", error);
      return null;
    }
  };

  return {
    getAllNames,
    getEmployeeById,  // Add this to the returned object
  };
};