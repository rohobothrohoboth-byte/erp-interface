// pageUserManagement.tsx - Complete fixed version

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { EmpSearchRes, UUID } from "../../../types/core/EmpSearchRes";
import { motion } from "framer-motion";
import { usermgmtApi } from "../../../services/core/usermgmt/usermgmt.api";
import EmployeeTable from "../../../components/core/usermgmt/employeeTable";
import type { AdminEmpListDto } from "../../../types/hr/employee";
import { useNavigate } from "react-router-dom";
import EmployeeSearch, { type AdminEmployeeFilters } from "../../../components/core/usermgmt/EmployeeSearch";
import { getAllAppUsers } from "../../../services/auth/account/account.api";

// ✅ ADD THE MAPPING FUNCTION HERE
const mapEmployeeData = (employee: any): AdminEmpListDto => {
  return {
    id: employee.id,
    code: employee.code || employee.employeeCode || '—',
    empFullName: employee.empFullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'No Name',
    empFullNameAm: employee.empFullNameAm || employee.firstNameAm || '',
    gender: employee.gender || 'N/A',
    empState: employee.empState || 'Not specified',
    branch: employee.branchName || employee.branch || '—',
    department: employee.departmentName || employee.department || '—',
    position: employee.positionName || employee.position || '—',
    jobGrade: employee.jobGradeName || employee.jobGrade || '—',
    empType: employee.empType || '',
    empNature: employee.empNature || '',
    workArr: employee.workArr || '',
    photo: employee.photo || '',
    hasAccount: employee.hasAccount || employee.appUserId !== null,
    isAccountActive: employee.isAccountActive || employee.isActive,
    isDeleted: employee.isDeleted || false,
    dateAdd: employee.dateAdd || new Date(),
    dateMod: employee.dateMod || null,
    rowVersion: employee.rowVersion || ''
  };
};

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [employeesTableData, setEmployeesTableData] = useState<AdminEmpListDto[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<AdminEmpListDto[]>([]);
  const [allEmployees, setAllEmployees] = useState<AdminEmpListDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [userStatusMap, setUserStatusMap] = useState<Map<string, { hasAccount: boolean; isActive: boolean; userId: string }>>(new Map());
  const [filters, setFilters] = useState<AdminEmployeeFilters>({
    department: "",
    branch: "",
    empState: "",
    role: "",
    gender: "",
  });
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Fetch all app users to check account status
  const fetchUserStatuses = useCallback(async (): Promise<Map<string, { hasAccount: boolean; isActive: boolean; userId: string }>> => {
    try {
      const users = await getAllAppUsers();
      const map = new Map();
      users.forEach((user: any) => {
        const empId = user.employeeId;
        if (empId && empId !== "00000000-0000-0000-0000-000000000000") {
          map.set(empId, {
            hasAccount: true,
            isActive: user.isActive === true,
            userId: user.id
          });
        }
      });
      return map;
    } catch (error) {
      console.error("Failed to fetch user statuses:", error);
      return new Map();
    }
  }, []);

  // ✅ UPDATED: Use the mapping function
  const convertToAdminEmpListDto = useCallback((employee: any, statusMap: Map<string, any>): AdminEmpListDto => {
    // First, map the employee data
    const mapped = mapEmployeeData(employee);

    // Then add the user status from the map
    const userStatus = statusMap.get(employee.id);

    return {
      ...mapped,
      hasAccount: !!userStatus || mapped.hasAccount,
      isAccountActive: userStatus?.isActive || mapped.isAccountActive || false,
      userId: userStatus?.userId || mapped.userId,
    };
  }, []);

  // Filter and search employees
  const applyFiltersAndSearch = useCallback((employees: AdminEmpListDto[]) => {
    return employees.filter((employee) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
          !searchTerm ||
          employee.empFullName.toLowerCase().includes(searchLower) ||
          employee.code.toLowerCase().includes(searchLower) ||
          (employee.department && employee.department.toLowerCase().includes(searchLower)) ||
          (employee.position && employee.position.toLowerCase().includes(searchLower));

      const matchesDepartment = !filters.department || employee.department === filters.department;
      const matchesBranch = !filters.branch || employee.branch === filters.branch;
      const matchesStatus = !filters.empState || employee.empState === filters.empState;
      const matchesGender = !filters.gender || employee.gender === filters.gender;

      return matchesSearch && matchesDepartment && matchesBranch && matchesStatus && matchesGender;
    });
  }, [searchTerm, filters]);

  // Fetch all employees from API
  const fetchAllEmployees = useCallback(async (page: number = 1) => {
    if (!isMounted.current) return;

    setTableLoading(true);
    setError(null);

    try {
      // First fetch user statuses and wait for it to complete
      const statusMap = await fetchUserStatuses();

      if (!isMounted.current) return;

      // Update the state with the map
      setUserStatusMap(statusMap);

      // Fetch all employees from the API
      const apiEmployees = await usermgmtApi.getAllEmployeesAdmin();

      if (!isMounted.current) return;

      // ✅ Convert API response to AdminEmpListDto format using the mapping function
      const convertedEmployees: AdminEmpListDto[] = Array.isArray(apiEmployees)
          ? apiEmployees.map(emp => convertToAdminEmpListDto(emp, statusMap))
          : [];

      setAllEmployees(convertedEmployees);

      // Apply filters and search
      const filtered = applyFiltersAndSearch(convertedEmployees);
      setFilteredEmployees(filtered);

      // Apply pagination
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedEmployees = filtered.slice(startIndex, startIndex + itemsPerPage);

      setEmployeesTableData(paginatedEmployees);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setTotalItems(filtered.length);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
      if (isMounted.current) {
        setError(err.message || "Failed to load employee list");
        setAllEmployees([]);
        setFilteredEmployees([]);
        setEmployeesTableData([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } finally {
      if (isMounted.current) {
        setTableLoading(false);
      }
    }
  }, [fetchUserStatuses, convertToAdminEmpListDto, applyFiltersAndSearch]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchAllEmployees(currentPage);

    return () => {
      isMounted.current = false;
    };
  }, [fetchAllEmployees, currentPage]);

  // Apply filters when they change (without refetching from API)
  useEffect(() => {
    if (allEmployees.length > 0) {
      const filtered = applyFiltersAndSearch(allEmployees);
      setFilteredEmployees(filtered);

      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedEmployees = filtered.slice(startIndex, startIndex + itemsPerPage);

      setEmployeesTableData(paginatedEmployees);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setTotalItems(filtered.length);
    }
  }, [searchTerm, filters, allEmployees, currentPage, applyFiltersAndSearch]);

  const handleAddAccount = (employeeData: AdminEmpListDto) => {
    navigate('/core/user-management/add-v2', {
      state: {
        employee: {
          id: employeeData.id as UUID,
          code: employeeData.code,
          empFullName: employeeData.empFullName,
          empFullNameAm: employeeData.empFullNameAm,
          gender: employeeData.gender,
          dept: employeeData.department,
          position: employeeData.position,
          hasAccount: employeeData.hasAccount,
          branch: employeeData.branch,
          empState: employeeData.empState,
        } satisfies EmpSearchRes,
      },
    });
  };

  const handleEditAccount = async (employeeData: AdminEmpListDto) => {
    const empSearchRes: EmpSearchRes = {
      id: employeeData.id as UUID,
      code: employeeData.code,
      empFullName: employeeData.empFullName,
      empFullNameAm: employeeData.empFullNameAm,
      gender: employeeData.gender,
      dept: employeeData.department,
      position: employeeData.position,
      hasAccount: employeeData.hasAccount,
      isAccountActive: employeeData.isAccountActive,
      branch: employeeData.branch,
      empState: employeeData.empState,
    };

    const appUserId = userStatusMap.get(employeeData.id)?.userId || employeeData.id;

    navigate(`/core/user-management/edit/${employeeData.id}`, {
      state: {
        employee: empSearchRes,
        appUserId: appUserId
      }
    });
  };

  const handleEmployeeSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setHasSearched(searchValue.length > 0);
    setError(null);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setHasSearched(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddEmployee = () => {
    navigate("/core/add-employee");
  };

  const handleRefreshEmployees = () => {
    fetchAllEmployees(currentPage);
  };

  return (
      <>
        <section className="w-full bg-gray-50 overflow-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
          >
            <div>
              <div className="pb-6">
                <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent mr-2">
                  User
                </span>
                  Management
                </h1>
              </div>

              {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Error:</span> {error}
                    </div>
                  </div>
              )}

              <EmployeeSearch
                  searchTerm={searchTerm}
                  setSearchTerm={handleEmployeeSearch}
                  filters={filters}
                  setFilters={handleFiltersChange}
                  onRefresh={handleRefreshEmployees}
                  loading={tableLoading}
                  onAddEmployee={handleAddEmployee}
              />

              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
              >
                <EmployeeTable
                    employees={employeesTableData}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    onEmployeeUpdate={() => {}}
                    onEmployeeStatusChange={() => {}}
                    onEmployeeTerminate={() => {}}
                    onAddAccount={handleAddAccount}
                    onEditAccount={handleEditAccount}
                    showAddAccountButton={true}
                    loading={tableLoading}
                />
              </motion.div>
            </div>
          </motion.div>
        </section>
      </>
  );
};

export default UserManagement;