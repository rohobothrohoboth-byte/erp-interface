import { useQuery } from "@tanstack/react-query";
import { fiscalYearApi } from "@/modules/core/services/fiscalyear/fisc.api";
import type { NameListItem } from '@/modules/list/types/NameList/nameList';

// FIXED: Use the core module fiscal year API
export const fiscNamesApi = {
  getActiveFiscalYear: async (): Promise<NameListItem | null> => {
    try {
      const allFiscalYears = await fiscalYearApi.getAllFiscalYears();
      const currentDate = new Date();

      // Find the active fiscal year based on current date
      const activeYear = allFiscalYears.find((year) => {
        const startDate = new Date(year.dateStart);
        const endDate = new Date(year.dateEnd);
        return currentDate >= startDate && currentDate <= endDate;
      });

      // Transform to NameListItem format if needed
      return activeYear ? { id: activeYear.id, name: activeYear.name } : null;
    } catch (error) {
      console.error("Error fetching active fiscal year:", error);
      return null;
    }
  },
};

// React Query hook for active fiscal year
export const useActiveFiscalYear = () => {
  return useQuery({
    queryKey: ["active-fiscal-year"],
    queryFn: () => fiscNamesApi.getActiveFiscalYear(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};