import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmployeeManagementHeader from '../../../components/hr/employee/EmployeeManagementHeader';
import EmployeeStatsCards from '../../../components/hr/employee/EmployeeStatsCards';
import EmployeeSearchFilters, { type HREmployeeFilters } from '../../../components/hr/employee/EmployeeSearchFilters';
import EmployeeTable from '../../../components/hr/employee/EmployeeTable';
import type { EmployeeListDto } from '../../../types/hr/employee';
import { empApi } from '../../../services/hr/employee/emp.api';
import type { UUID } from 'crypto';

// Extended type for local state management
type EmployeeWithStatus = EmployeeListDto & {
  status?: "active" | "on-leave";
  employmentTypeStr?: string;
  nationality?: string;
};

const EmployeeManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<HREmployeeFilters>({
    department: '',
    branch: '',
    empState: '',
    empNature: '',
    gender: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Load employees from API on component mount
  useEffect(() => {
    loadEmployeesFromAPI();
  }, []);

  // Load employees from API
  const loadEmployeesFromAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const employeesData = await empApi.getAllEmployees();
      
      // Add status and other required fields to employees
      const employeesWithStatus: EmployeeWithStatus[] = employeesData.map((emp: EmployeeListDto) => ({
        ...emp,
        status: "active", // Default status, you can modify this based on your business logic
        employmentTypeStr: emp.empType, // Map empType to employmentTypeStr
        nationality: "Ethiopian" // Default nationality, you can modify this based on your data
      }));
      
      setEmployees(employeesWithStatus);
      
      // Update previous stats
      setPreviousStats({
        total: employeesWithStatus.length,
        active: employeesWithStatus.filter(e => e.status === "active").length,
        onLeave: employeesWithStatus.filter(e => e.status === "on-leave").length
      });
      
    } catch (error) {
      console.error('Error fetching employees from API:', error);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check for new employee data when component mounts or when returning from add employee page
  useEffect(() => {
    const checkForNewEmployee = () => {
      const newEmployeeData = sessionStorage.getItem('newEmployee');
      const employeeAdded = sessionStorage.getItem('employeeAdded');
      
      if (newEmployeeData && employeeAdded === 'true') {
        try {
          const newEmployee = JSON.parse(newEmployeeData);
          handleAddEmployee(newEmployee);
          // Clear the stored data
          sessionStorage.removeItem('newEmployee');
          sessionStorage.removeItem('employeeAdded');
        } catch (error) {
          console.error('Error parsing new employee data:', error);
          setError('Error adding new employee data.');
        }
      }
    };

    checkForNewEmployee();

    // Also check when page becomes visible (user returns from add employee page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForNewEmployee();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Store current stats as previous stats when component mounts or data changes
  useEffect(() => {
    const currentTotal = employees.length;
    const currentActive = employees.filter(e => e.status === "active").length;
    const currentOnLeave = employees.filter(e => e.status === "on-leave").length;

    // Only update previous stats if we have actual data to prevent showing changes on initial load
    if (currentTotal > 0 && previousStats.total === 0) {
      setPreviousStats({
        total: currentTotal,
        active: currentActive,
        onLeave: currentOnLeave
      });
    }
  }, [employees]);

  const handleAddEmployee = (newEmployee: EmployeeWithStatus) => {
    console.log('Adding new employee to state:', newEmployee);
    
    // Update previous stats before adding new employee
    setPreviousStats({
      total: employees.length,
      active: employees.filter(e => e.status === "active").length,
      onLeave: employees.filter(e => e.status === "on-leave").length
    });
    
    const updatedEmployees = [newEmployee, ...employees];
    setEmployees(updatedEmployees);
    setCurrentPage(1);
  };

  const handleEmployeeUpdate = (updatedEmployee: EmployeeWithStatus) => {
    // Update previous stats before making changes
    setPreviousStats({
      total: employees.length,
      active: employees.filter(e => e.status === "active").length,
      onLeave: employees.filter(e => e.status === "on-leave").length
    });

    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    
    setEmployees(updatedEmployees);
  };

  const handleEmployeeStatusChange = (employeeId: string, newStatus: "active" | "on-leave") => {
    // Update previous stats before making changes
    setPreviousStats({
      total: employees.length,
      active: employees.filter(e => e.status === "active").length,
      onLeave: employees.filter(e => e.status === "on-leave").length
    });

    const updatedEmployees = employees.map(emp => 
      emp.id === employeeId ? { 
        ...emp, 
        status: newStatus
      } : emp
    );
    
    setEmployees(updatedEmployees);
  };

  // NEW: Handle employee deletion
  const handleEmployeeDelete = async (employeeId: string) => {
    try {
      setError(null);
      // Call the API to delete the employee
      await empApi.deleteEmployee(employeeId as UUID);
      
      // Update previous stats before making changes
      setPreviousStats({
        total: employees.length,
        active: employees.filter(e => e.status === "active").length,
        onLeave: employees.filter(e => e.status === "on-leave").length
      });

      // Remove employee from local state
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      setEmployees(updatedEmployees);
      
      console.log('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Failed to delete employee. Please try again.');
    }
  };

  const handleEmployeeTerminate = async (employeeId: string) => {
    try {
      setError(null);
      // Call the API to delete the employee
      await empApi.deleteEmployee(employeeId as UUID);
      
      // Update previous stats before making changes
      setPreviousStats({
        total: employees.length,
        active: employees.filter(e => e.status === "active").length,
        onLeave: employees.filter(e => e.status === "on-leave").length
      });

      // Remove employee from local state
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      setEmployees(updatedEmployees);
      
      console.log('Employee terminated successfully');
    } catch (error) {
      console.error('Error terminating employee:', error);
      setError('Failed to terminate employee. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadEmployeesFromAPI();
      console.log('Data refreshed from API');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      (employee.empFullName?.toLowerCase() || '').includes(searchLower) ||
      (employee.empFullNameAm?.toLowerCase() || '').includes(searchLower) ||
      (employee.code?.toLowerCase() || '').includes(searchLower) ||
      (employee.department?.toLowerCase() || '').includes(searchLower) ||
      (employee.position?.toLowerCase() || '').includes(searchLower) ||
      (employee.employmentTypeStr?.toLowerCase() || '').includes(searchLower) ||
      (employee.nationality?.toLowerCase() || '').includes(searchLower);

    const matchesDepartment = !filters.department || employee.department === filters.department;
    const matchesBranch = !filters.branch || employee.branch === filters.branch;
    const matchesEmpState = !filters.empState || employee.empState === filters.empState;
    const matchesGender = !filters.gender || employee.gender === filters.gender;

    return matchesSearch && matchesDepartment && matchesBranch && matchesEmpState && matchesGender;
  });

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats based on current data
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const onLeaveEmployees = employees.filter(e => e.status === "on-leave").length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="w-full mx-auto">
        <div className="flex flex-col space-y-6">
          <EmployeeManagementHeader />
          
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {error.includes("load") ? (
                    <>
                      Failed to load employees.{" "}
                      <button
                        onClick={loadEmployeesFromAPI}
                        className="underline hover:text-red-800 font-semibold focus:outline-none"
                      >
                        Try again
                      </button>{" "}
                      later.
                    </>
                  ) : error.includes("terminate") ? (
                    "Failed to terminate employee. Please try again."
                  ) : error.includes("refresh") ? (
                    "Failed to refresh data. Please try again."
                  ) : error.includes("adding") ? (
                    "Error adding new employee data."
                  ) : (
                    error
                  )}
                </span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading State for Stats and Table */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-8"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employees...</p>
              </div>
            </motion.div>
          )}

          {/* Content Area - Only show when not loading */}
          {!loading && (
            <>
              <EmployeeStatsCards 
                totalEmployees={totalEmployees}
                activeEmployees={activeEmployees}
                onLeaveEmployees={onLeaveEmployees}
                previousTotal={previousStats.total}
                previousActive={previousStats.active}
                previousOnLeave={previousStats.onLeave}
              />

              <EmployeeSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
                loading={loading}
              />

              <EmployeeTable 
                employees={paginatedEmployees}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEmployees.length}
                onPageChange={setCurrentPage}
                onEmployeeUpdate={handleEmployeeUpdate}
                onEmployeeStatusChange={handleEmployeeStatusChange}
                onEmployeeTerminate={handleEmployeeTerminate}
                onEmployeeDelete={handleEmployeeDelete}
                loading={loading}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      when: "beforeChildren"
    } 
  }
};

export default EmployeeManagementPage;