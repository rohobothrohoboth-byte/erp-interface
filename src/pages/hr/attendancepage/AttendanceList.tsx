import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../../services/hr/attandance/employeeApi';
import { attendanceApi } from '../../../services/hr/attandance/attendanceApi';
import type { AttendanceRecord } from '../../../types/hr/attandance';

// ✅ Define Employee type locally
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  employeeCode: string;
  email: string;
  phone: string;
  department: string;
  departmentName: string;
  position: string;
  positionName: string;
  branch: string;
  branchName: string;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
  profilePicture?: string;
}

const AttendanceList: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [filters, setFilters] = useState({ date: '', status: '', department: '' });
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch all employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const empList = await employeeApi.fetchAllEmployees();
        console.log('✅ Employees loaded:', empList?.length || 0);
        setEmployees(empList || []);
      } catch (error) {
        console.error('❌ Error loading employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  // ✅ Fetch attendance AFTER employees are loaded
  useEffect(() => {
    // Only fetch attendance when employees are loaded
    if (!loadingEmployees) {
      console.log('✅ Employees loaded, fetching attendance...');
      fetchAttendance();
    }
  }, [loadingEmployees]); // ✅ Depends on loadingEmployees

  // ✅ When employees update, refresh attendance data with names
  useEffect(() => {
    if (!loadingEmployees && records.length > 0) {
      console.log('🔄 Refreshing employee names in records...');
      updateRecordNames();
    }
  }, [employees]); // ✅ When employees change, update names

  const fetchAttendance = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      const targetDate = date || selectedDate;
      console.log('📡 Fetching attendance for date:', targetDate);

      const response = await attendanceApi.getDailyReport(targetDate);
      console.log('📡 Attendance response:', response);

      let reportData = null;
      let recordsData: AttendanceRecord[] = [];

      // Extract records from response
      if (response) {
        if (response.data?.records) {
          reportData = response.data;
          recordsData = response.data.records || [];
        } else if (response.data?.data?.records) {
          reportData = response.data.data;
          recordsData = response.data.data.records || [];
        } else if (Array.isArray(response.data)) {
          recordsData = response.data;
        } else if (Array.isArray(response)) {
          recordsData = response;
        } else if (response.data?.items) {
          recordsData = response.data.items;
        } else if (response.data && typeof response.data === 'object') {
          if (response.data.id) {
            recordsData = [response.data];
          } else {
            recordsData = response.data.records || [];
          }
        }
      }

      console.log('📊 Extracted records:', recordsData.length);

      // ✅ Map employee names using the employee cache
      const recordsWithNames = recordsData.map((record: any) => {
        const employee = employees.find(e => e.id === record.employeeId);
        const employeeName = employee
            ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'Unknown'
            : getEmployeeNameFromCache(record.employeeId) || 'Unknown Employee';

        const departmentName = employee?.departmentName || employee?.department || 'N/A';

        return {
          ...record,
          employeeName: employeeName,
          departmentName: departmentName,
          displayDate: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        };
      });

      setRecords(recordsWithNames);

      // Set summary data
      if (reportData || recordsData.length > 0) {
        const total = recordsData.length;
        const present = recordsData.filter((r: any) => r.status === 'Present').length;
        const absent = recordsData.filter((r: any) => r.status === 'Absent').length;
        const late = recordsData.filter((r: any) => r.status === 'Late').length;
        const leave = recordsData.filter((r: any) => r.status === 'Leave').length;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

        setSummary({
          totalEmployees: reportData?.totalEmployees || total,
          presentCount: reportData?.presentCount || present,
          absentCount: reportData?.absentCount || absent,
          lateCount: reportData?.lateCount || late,
          leaveCount: reportData?.leaveCount || leave,
          attendanceRate: reportData?.attendanceRate || attendanceRate,
        });
      } else {
        setSummary(null);
      }

    } catch (error: any) {
      console.error('❌ Error fetching attendance:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch attendance records');
      setRecords([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to get employee name from cache
  const getEmployeeNameFromCache = (employeeId: string): string | null => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || null;
    }
    return null;
  };

  // ✅ Update record names when employees load
  const updateRecordNames = () => {
    if (records.length === 0) return;

    const updatedRecords = records.map((record: any) => {
      const employee = employees.find(e => e.id === record.employeeId);
      if (employee) {
        const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'Unknown';
        return {
          ...record,
          employeeName: fullName,
          departmentName: employee.departmentName || employee.department || 'N/A'
        };
      }
      return record;
    });

    setRecords(updatedRecords);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchAttendance(date);
    setFilters(prev => ({ ...prev, date: date }));
  };

  // Get unique departments from employees
  const departments = ['All', ...new Set(employees.map(e => e.departmentName || e.department).filter(Boolean))];

  // Filter records
  const filteredRecords = records.filter(record => {
    const recordDate = record.date ? new Date(record.date).toISOString().split('T')[0] : '';
    const matchesDate = filters.date ? recordDate === filters.date : true;
    const matchesStatus = filters.status ? record.status === filters.status : true;

    let matchesDepartment = true;
    if (filters.department && filters.department !== 'All' && filters.department !== '') {
      const employee = employees.find(e => e.id === record.employeeId);
      const deptName = employee?.departmentName || employee?.department || '';
      matchesDepartment = deptName === filters.department;
    }

    return matchesDate && matchesStatus && matchesDepartment;
  });

  const displayRecords = showFullHistory ? filteredRecords : filteredRecords.slice(0, 10);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Present: 'bg-green-100 text-green-800 border-green-200',
      Absent: 'bg-red-100 text-red-800 border-red-200',
      Late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Leave: 'bg-blue-100 text-blue-800 border-blue-200',
      Holiday: 'bg-purple-100 text-purple-800 border-purple-200',
      Weekend: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      Present: '✅',
      Absent: '❌',
      Late: '⏰',
      Leave: '🏖️',
      Holiday: '🎉',
      Weekend: '📅',
    };
    return icons[status] || '📌';
  };

  // Loading state
  if (loading || loadingEmployees) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance records...</p>
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 max-w-2xl mx-auto">
            <p className="font-medium text-lg">❌ Error loading attendance records</p>
            <p className="text-sm mt-1">{error}</p>
            <button
                onClick={() => fetchAttendance(selectedDate)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              🔄 Retry
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* ... rest of the component remains the same ... */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            📋 Attendance <span className="text-green-600">List</span>
            <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredRecords.length} records)
          </span>
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {showFullHistory ? '📊 Show Recent' : '📚 View Full History'}
            </button>
            <button
                onClick={() => fetchAttendance(selectedDate)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📅 Select Date</label>
              <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Department</label>
              <select
                  value={filters.department}
                  onChange={e => setFilters({ ...filters, department: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.filter(d => d && d !== 'All').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📌 Status</label>
              <select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📊 Filter by Date</label>
              <input
                  type="date"
                  value={filters.date}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
                onClick={() => {
                  setFilters({ date: '', status: '', department: '' });
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  fetchAttendance(new Date().toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              🗑️ Clear All Filters
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
                <p className="text-2xl font-bold text-gray-800">{summary.totalEmployees}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
                <p className="text-2xl font-bold text-green-600">{summary.presentCount}</p>
                <p className="text-sm text-gray-500">✅ Present</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500">
                <p className="text-2xl font-bold text-red-600">{summary.absentCount}</p>
                <p className="text-sm text-gray-500">❌ Absent</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
                <p className="text-2xl font-bold text-yellow-600">{summary.lateCount}</p>
                <p className="text-sm text-gray-500">⏰ Late</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-purple-500">
                <p className="text-2xl font-bold text-purple-600">{summary.leaveCount}</p>
                <p className="text-sm text-gray-500">🏖️ Leave</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-emerald-500">
                <p className="text-2xl font-bold text-emerald-600">{summary.attendanceRate}%</p>
                <p className="text-sm text-gray-500">📊 Attendance Rate</p>
              </div>
            </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Clock In</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Clock Out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hours</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
              </thead>
              <tbody>
              {displayRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">📭</span>
                        <p className="font-medium">No attendance records found</p>
                        <p className="text-sm mt-1">Try selecting a different date or clearing filters</p>
                      </div>
                    </td>
                  </tr>
              ) : (
                  displayRecords.map((record) => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    const departmentName = employee?.departmentName || employee?.department || record.departmentName || 'N/A';

                    return (
                        <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            <div className="flex items-center gap-2">
                              <span>{record.employeeName || 'Unknown Employee'}</span>
                              {record.employeeName === 'Unknown Employee' && (
                                  <span className="text-xs text-gray-400">(ID: {record.employeeId?.slice(0, 8)})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {departmentName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {record.hoursWorked > 0 ? record.hoursWorked.toFixed(2) : '-'}
                          </td>
                          <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-1 ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)} {record.status}
                        </span>
                          </td>
                        </tr>
                    );
                  })
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Show more/less */}
        {!showFullHistory && filteredRecords.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing 10 of {filteredRecords.length} records.
              <button
                  className="ml-2 text-green-600 hover:underline font-medium"
                  onClick={() => setShowFullHistory(true)}
              >
                Show all
              </button>
            </div>
        )}
      </div>
  );
};

export default AttendanceList;