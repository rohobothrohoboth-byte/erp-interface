import React, { useState, useEffect } from "react";
import type { EmpSearchRes, UUID } from "../../../types/core/EmpSearchRes";
import EmployeeSearchFilters from "../../../components/hr/employee/EmployeeSearchFilters";
import { motion } from "framer-motion";
import { usermgmtApi } from "../../../services/core/usermgmt/usermgmt.api";
import EmployeeTable from "../../../components/core/usermgmt/employeeTable";
import type { EmployeeListDto } from "../../../types/hr/employee";
import { useNavigate } from "react-router-dom";
import EmployeeSearch, { type AdminEmployeeFilters } from "../../../components/core/usermgmt/EmployeeSearch";


const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // State for employee table
  const [employeesTableData, setEmployeesTableData] = useState<EmployeeListDto[]>(
    [],
  );
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeListDto[]>(
    [],
  );
  const [allEmployees, setAllEmployees] = useState<EmployeeListDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState<AdminEmployeeFilters>({
    department: "",
    branch: "",
    empState: "",
    role: "",
    gender: "",
  });
   const navigate = useNavigate();
  // Helper function to determine employee status based on actual data
  const determineEmployeeStatus = (
    employee: EmployeeListDto,
  ): "active" | "on-leave" => {
    // TODO: Replace with actual status logic from your API
    // For now, default to "active"
    return "active";
  };

  // Convert EmployeeListDto to EmployeeListDto format using actual employee data
  const convertToEmployeeListDto = (employee: EmployeeListDto): EmployeeListDto => {
    // const currentYear = new Date().getFullYear();
    // const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    // const currentDay = String(new Date().getDate()).padStart(2, '0');
    // const employmentDate = employee.employmentDate || `${currentYear}-${currentMonth}-${currentDay}`;

    return {
      id: employee.id,
      code: employee.code,
      empFullName: employee.empFullName,
      empFullNameAm: employee.empFullNameAm,
      gender: employee.gender,
      department: employee.department,
      position: employee.position,
      branch: employee.branch,
      empState: employee.empState,
      hasAccount: employee.hasAccount,
      createdAt: employee.createdAt,
      isDeleted: employee.isDeleted,
      rowVersion: employee.rowVersion,
      createdAtAm: employee.createdAtAm,
      modifiedAt: employee.modifiedAt,
      modifiedAtAm: employee.modifiedAtAm,
    };
  };

  // Filter and search employees
  const applyFiltersAndSearch = (employees: EmployeeListDto[]) => {
    return employees.filter((employee) => {
      // Apply search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        employee.empFullName.toLowerCase().includes(searchLower) ||
        employee.code.toLowerCase().includes(searchLower) ||
        (employee.department &&
          employee.department.toLowerCase().includes(searchLower)) ||
        (employee.position &&
          employee.position.toLowerCase().includes(searchLower));

      // Apply department filter
      const matchesDepartment =
        !filters.department || employee.department === filters.department;

      // Apply branch filter
      const matchesBranch =
        !filters.branch || employee.branch === filters.branch;

      // Apply status filter
      const matchesStatus =
        !filters.empState || employee.empState === filters.empState;

      // Apply gender filter
      const matchesGender =
        !filters.gender || employee.gender === filters.gender;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesBranch &&
        matchesStatus &&
        matchesGender
      );
    });
  };

  // Fetch all employees from API
  const fetchAllEmployees = async (page: number = 1) => {
    setTableLoading(true);
    setError(null);
 


    try {
      // Fetch all employees from the API
      const apiEmployees = await usermgmtApi.getAllEmployees();
      console.log("API Response:", apiEmployees);

      // Check if response is in expected format
      if (!Array.isArray(apiEmployees)) {
        console.warn("API response is not an array:", apiEmployees);
        // Still proceed with empty array instead of throwing error
      }

      // Convert API response to EmployeeListDto format
      const convertedEmployees: EmployeeListDto[] = Array.isArray(apiEmployees)
        ? apiEmployees.map(convertToEmployeeListDto)
        : [];

      setAllEmployees(convertedEmployees);

      // Apply filters and search
      const filtered = applyFiltersAndSearch(convertedEmployees);
      setFilteredEmployees(filtered);

      // Apply pagination
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedEmployees = filtered.slice(
        startIndex,
        startIndex + itemsPerPage,
      );

      setEmployeesTableData(paginatedEmployees);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setTotalItems(filtered.length);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
      setError(err.message || "Failed to load employee list");

      // Set empty arrays instead of using mock data
      setAllEmployees([]);
      setFilteredEmployees([]);
      setEmployeesTableData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setTableLoading(false);
    }
  };

  // Initial fetch and refetch when filters/page change
  useEffect(() => {
    fetchAllEmployees(currentPage);
  }, [currentPage]);

  // Apply filters when they change
  useEffect(() => {
    if (allEmployees.length > 0) {
      const filtered = applyFiltersAndSearch(allEmployees);
      setFilteredEmployees(filtered);

      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedEmployees = filtered.slice(
        startIndex,
        startIndex + itemsPerPage,
      );

      setEmployeesTableData(paginatedEmployees);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setTotalItems(filtered.length);
    } else {
      // Reset if no employees
      setFilteredEmployees([]);
      setEmployeesTableData([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [searchTerm, filters, allEmployees, currentPage]);

  const handleAddAccount = (employeeData: EmployeeListDto) => {
    const empSearchRes: EmpSearchRes = {
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
    };

   navigate(`/core/user-management/add/${employeeData.id}`);

  };

  const handleEditAccount = async (employeeData: EmployeeListDto) => {
    const empSearchRes: EmpSearchRes = {
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
    };

    try {
      setTableLoading(true);
      // Fetch actual account data from API
      const accountData = await usermgmtApi.getAccountData(
        employeeData.id as UUID,
      );

      navigate(`/core/user-management/edit/${employeeData.id}`);
    } catch (error: any) {
      console.error("Failed to fetch account data:", error);
      setError(error.message || "Failed to load account data");
    } finally {
      setTableLoading(false);
    }
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

  const handleEmployeeDelete = (employeeId: string) => {
    console.log("Delete employee:", employeeId);
    setEmployeesTableData((prev) =>
      prev.filter((emp) => emp.id !== employeeId),
    );
    setFilteredEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    setAllEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    setTotalItems((prev) => prev - 1);
  };

  const handleAddEmployee = () => {
    navigate("/core/add-employee");
  };

  const handleRefreshEmployees = () => {
    fetchAllEmployees(currentPage);
  };

  // Check if we should show "no results" message
  const showNoResultsMessage =
    hasSearched && filteredEmployees.length === 0 && !tableLoading;

  // Check if we should show the table (always show it, even if empty)
  // const showEmployeeTable = !showNoResultsMessage;

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

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Error:</span> {error}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Searching for employee with code: {searchTerm}</span>
                </div>
              </div>
            )}

            {/* Employee Search Filters */}
            <EmployeeSearch
              searchTerm={searchTerm}
              setSearchTerm={handleEmployeeSearch}
              filters={filters}
              setFilters={handleFiltersChange}
              // employees={filteredEmployees}
              onRefresh={handleRefreshEmployees}
              loading={tableLoading}
              onAddEmployee={handleAddEmployee}
            />

            {/* Show no results message */}
            {/* {showNoResultsMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? `No employees found matching "${searchTerm}". Try adjusting your search terms or filters.`
                    : "No employees match the selected filters. Try adjusting your filter criteria."}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      department: "",
                      branch: "",
                      empState: "",
                      role: "",
                      gender: "",
                    });
                    setHasSearched(false);
                  }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md font-medium transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </motion.div>
            )} */}

            {/* Employee Table Section - Always show even if empty */}
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
                onEmployeeDelete={handleEmployeeDelete}
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
