import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  AlertCircle,
  RefreshCw,
  User
} from 'lucide-react';
import { attendanceApi } from '@/modules/hr/services/attandance/attendanceApi';
import { employeeApi } from '@/modules/hr/services/attandance/employeeApi';
import dayjs from 'dayjs';

interface TimeClockProps {
  employeeId?: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string | null;
  employeeCode: string | null;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Holiday' | 'Weekend';
  hoursWorked: number;
  overtimeHours: number;
  isLate: boolean;
  lateMinutes: number;
  shiftName: string | null;
  notes: string | null;
  isEarlyDeparture?: boolean;
  earlyDepartureMinutes?: number;
}

interface AttendanceSummary {
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  averageHoursPerDay: number;
  attendanceRate: number;
}

// Get employee info from JWT token
const getEmployeeInfoFromToken = () => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          id: payload.employeeId || payload.empId || payload.employee_id ||
              payload.sub || payload.nameid || '',
          name: payload.employeeName || payload.name || payload.unique_name ||
              payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Employee',
          email: payload.email || payload.Email ||
              payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
          department: payload.department || payload.Department || '',
          position: payload.position || payload.Position || '',
          employeeCode: payload.employeeCode || payload.EmployeeCode || ''
        };
      }
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  return {
    id: localStorage.getItem('employeeId') || '',
    name: localStorage.getItem('employeeName') || 'Employee',
    email: localStorage.getItem('userEmail') || '',
    department: localStorage.getItem('department') || '',
    position: localStorage.getItem('position') || '',
    employeeCode: localStorage.getItem('employeeCode') || ''
  };
};

// Helper to check if a date is today (Ethiopia time)
const isTodayEthiopia = (dateStr: string | null): boolean => {
  if (!dateStr) return false;

  const ethiopiaOffset = 3 * 60 * 60 * 1000;
  const now = new Date();
  const ethiopiaNow = new Date(now.getTime() + ethiopiaOffset);
  const today = new Date(ethiopiaNow.getFullYear(), ethiopiaNow.getMonth(), ethiopiaNow.getDate());

  const recordDate = new Date(dateStr);
  const recordDateUTC = new Date(Date.UTC(
      recordDate.getUTCFullYear(),
      recordDate.getUTCMonth(),
      recordDate.getUTCDate()
  ));

  return today.getFullYear() === recordDateUTC.getFullYear() &&
      today.getMonth() === recordDateUTC.getMonth() &&
      today.getDate() === recordDateUTC.getDate();
};

// Format time for display (Ethiopia time)
const formatTime = (dateStr: string | null): string => {
  if (!dateStr) return '--:--';
  const date = new Date(dateStr);
  const ethiopiaOffset = 3 * 60 * 60 * 1000;
  const ethiopiaTime = new Date(date.getTime() + ethiopiaOffset);
  return ethiopiaTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Format date for display
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Main TimeClock Component
const TimeClock: React.FC<TimeClockProps> = ({ employeeId: propEmployeeId }) => {
  const employeeInfo = getEmployeeInfoFromToken();
  const employeeId = propEmployeeId || employeeInfo.id;

  // ✅ Get employee name from API or token
  const [employeeFullName, setEmployeeFullName] = useState<string>(employeeInfo.name || 'Employee');
  const [employeeDepartment, setEmployeeDepartment] = useState<string>(employeeInfo.department || '');
  const [employeePosition, setEmployeePosition] = useState<string>(employeeInfo.position || '');

  // State
  const [clockStatus, setClockStatus] = useState<'in' | 'out' | 'completed'>('in');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(dayjs().format('dddd, MMMM D, YYYY'));
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [location] = useState<string>('Office');
  const [isClockInDisabled, setIsClockInDisabled] = useState<boolean>(true);
  const [isClockOutDisabled, setIsClockOutDisabled] = useState<boolean>(true);
  const [stats, setStats] = useState<AttendanceSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);

  const isMounted = useRef<boolean>(true);
  const clockInProgress = useRef<boolean>(false);
  const clockOutProgress = useRef<boolean>(false);

  // ✅ Fetch employee details from API
  const fetchEmployeeDetails = useCallback(async () => {
    if (!employeeId) return;

    try {
      // Try to get employee details from API
      const employees = await employeeApi.fetchAllEmployees();
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || employeeInfo.name;
        setEmployeeFullName(fullName);
        setEmployeeDepartment(employee.departmentName || employee.department || '');
        setEmployeePosition(employee.positionName || employee.position || '');
        console.log('✅ Employee details loaded:', fullName);
      }
    } catch (error) {
      console.error('❌ Error fetching employee details:', error);
      // Keep token values as fallback
    }
  }, [employeeId, employeeInfo.name]);

  // Load today's attendance record
  const loadTodayRecord = useCallback(async () => {
    if (!employeeId) {
      setInitialLoading(false);
      setIsClockInDisabled(true);
      setIsClockOutDisabled(true);
      return;
    }

    try {
      const response = await attendanceApi.getTodayAttendance(employeeId);

      // Extract record from response
      let record = null;
      if (response) {
        if (response.data !== undefined) {
          record = response.data;
          if (Array.isArray(record)) {
            record = record.length > 0 ? record[0] : null;
          }
        } else if (response.id) {
          record = response;
        } else if (Array.isArray(response)) {
          record = response.length > 0 ? response[0] : null;
        }
      }

      if (!isMounted.current) return;

      if (!record) {
        setTodayRecord(null);
        setIsClockInDisabled(false);
        setIsClockOutDisabled(true);
        setClockStatus('in');
        setMessage(null);
        setRecentActivity('No activity today');
        setInitialLoading(false);
        return;
      }

      if (record.date && isTodayEthiopia(record.date)) {
        setTodayRecord(record);

        if (record.checkIn && !record.checkOut) {
          // ✅ Currently clocked in
          setClockStatus('out');
          setIsClockInDisabled(true);
          setIsClockOutDisabled(false);
          setMessage({ type: 'info', text: 'You are currently clocked in' });
          setRecentActivity(`⏰ Clocked in at ${formatTime(record.checkIn)}`);

        } else if (record.checkIn && record.checkOut) {
          // ✅ Completed for today
          setClockStatus('completed');
          setIsClockInDisabled(true);
          setIsClockOutDisabled(true);
          setMessage({ type: 'info', text: '✅ Shift completed for today' });
          setRecentActivity(`✅ Clocked out at ${formatTime(record.checkOut)}`);
        } else {
          setIsClockInDisabled(false);
          setIsClockOutDisabled(true);
          setClockStatus('in');
          setRecentActivity('No activity today');
        }
      } else {
        setTodayRecord(null);
        setIsClockInDisabled(false);
        setIsClockOutDisabled(true);
        setClockStatus('in');
        setMessage(null);
        setRecentActivity('No activity today');
      }
    } catch (error) {
      console.error('Error loading today record:', error);
      if (!isMounted.current) return;

      setTodayRecord(null);
      setIsClockInDisabled(false);
      setIsClockOutDisabled(true);
      setClockStatus('in');
      setMessage(null);
      setRecentActivity('No activity today');
    } finally {
      if (isMounted.current) {
        setInitialLoading(false);
      }
    }
  }, [employeeId]);

  // Load attendance stats
  const loadStats = useCallback(async () => {
    if (!employeeId) return;

    try {
      const statsData = await attendanceApi.getAttendanceStats(
          employeeId,
          dayjs().month() + 1,
          dayjs().year()
      );
      if (isMounted.current && statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [employeeId]);

  // Initial load
  useEffect(() => {
    isMounted.current = true;

    const loadData = async () => {
      await Promise.all([fetchEmployeeDetails(), loadTodayRecord(), loadStats()]);
    };
    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchEmployeeDetails, loadTodayRecord, loadStats]);

  // Clock In
  const handleClockIn = async () => {
    if (clockInProgress.current) return;

    if (!employeeId) {
      setMessage({ type: 'error', text: 'Employee ID not found' });
      return;
    }

    if (todayRecord?.checkIn && !todayRecord?.checkOut) {
      setMessage({ type: 'warning', text: 'You are already clocked in today!' });
      setIsClockInDisabled(true);
      setIsClockOutDisabled(false);
      setClockStatus('out');
      return;
    }

    clockInProgress.current = true;
    setLoading(true);
    setMessage(null);

    try {
      const record = await attendanceApi.clockIn(employeeId);

      if (isMounted.current && record) {
        setTodayRecord(record);
        setClockStatus('out');
        setIsClockInDisabled(true);
        setIsClockOutDisabled(false);
        setRecentActivity(`⏰ Clocked in at ${formatTime(record.checkIn)}`);
        setMessage({
          type: 'success',
          text: `✅ Clocked in successfully at ${formatTime(record.checkIn)}`
        });
        await loadStats();
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('Clock in error:', error);

      if (!isMounted.current) return;

      const errorMessage = error?.response?.data?.title || error?.message || '';
      if (errorMessage.includes('already clocked in')) {
        setMessage({ type: 'warning', text: 'You are already clocked in today!' });
        setIsClockInDisabled(true);
        setIsClockOutDisabled(false);
        setClockStatus('out');
        await loadTodayRecord();
      } else {
        const errorMsg = error?.response?.data?.title || error?.message || 'Failed to clock in. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
        setRetryCount(prev => prev + 1);
      }
    } finally {
      clockInProgress.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    if (clockOutProgress.current) return;

    if (!employeeId) {
      setMessage({ type: 'error', text: 'Employee ID not found' });
      return;
    }

    if (!todayRecord) {
      setMessage({ type: 'error', text: 'No active clock-in record found' });
      return;
    }

    if (todayRecord.checkOut) {
      setMessage({ type: 'warning', text: 'You have already clocked out for today' });
      setIsClockOutDisabled(true);
      return;
    }

    clockOutProgress.current = true;
    setLoading(true);
    setMessage(null);

    try {
      const record = await attendanceApi.clockOut(employeeId);

      if (isMounted.current && record) {
        setTodayRecord(record);
        setClockStatus('completed');
        setIsClockInDisabled(true);
        setIsClockOutDisabled(true);
        setRecentActivity(`✅ Clocked out at ${formatTime(record.checkOut)}`);
        setMessage({
          type: 'success',
          text: `✅ Clocked out successfully at ${formatTime(record.checkOut)}`
        });
        await Promise.all([loadStats(), loadTodayRecord()]);
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('Clock out error:', error);

      if (!isMounted.current) return;

      const errorMessage = error?.response?.data?.title || error?.message || '';
      if (errorMessage.includes('already clocked out')) {
        setMessage({ type: 'warning', text: 'You have already clocked out for today' });
        setIsClockOutDisabled(true);
        await loadTodayRecord();
      } else {
        const errorMsg = error?.response?.data?.title || error?.message || 'Failed to clock out. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
        setRetryCount(prev => prev + 1);
      }
    } finally {
      clockOutProgress.current = false;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setMessage(null);
    setInitialLoading(true);
    await Promise.all([loadTodayRecord(), loadStats()]);
    setMessage({ type: 'info', text: 'Data refreshed successfully' });
    setTimeout(() => {
      if (isMounted.current) {
        setMessage(null);
      }
    }, 3000);
  };

  // Timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(dayjs().format('dddd, MMMM D, YYYY'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get today's status
  const getTodayStatus = () => {
    if (!todayRecord) return { text: 'Not Started', color: '#d9d9d9', icon: '📌' };
    if (todayRecord.checkIn && todayRecord.checkOut) return { text: '✅ Completed', color: '#52c41a', icon: '✅' };
    if (todayRecord.checkIn) return { text: '⏰ Active', color: '#faad14', icon: '⏰' };
    return { text: '📌 Not Started', color: '#d9d9d9', icon: '📌' };
  };

  const status = getTodayStatus();
  const attendanceRate = stats?.attendanceRate || 0;
  const rateColor = attendanceRate >= 90 ? '#52c41a' : attendanceRate >= 75 ? '#faad14' : '#ff4d4f';

  // Get status message for the clock status display
  const getStatusMessage = () => {
    if (clockStatus === 'in') return 'Ready to Clock In';
    if (clockStatus === 'out') return 'Ready to Clock Out';
    if (clockStatus === 'completed') return '✅ Shift Completed';
    return 'Ready to Clock In';
  };

  // Loading state
  if (initialLoading) {
    return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
          <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: 24,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
            <p style={{ marginTop: '16px', color: '#8c8c8c', fontSize: 16 }}>
              Loading attendance data...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '100%',
          maxWidth: 500,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={24} color="#fff" />
              <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 600 }}>
                Time Clock
              </h2>
            </div>
            <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#fff',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
            >
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span style={{ fontSize: 12 }}>Refresh</span>
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Welcome */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#8c8c8c' }}>Welcome back,</div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1a1a2e' }}>
                {employeeFullName}
              </h3>
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} /> {location}
              </span>
                {employeeDepartment && (
                    <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                  <User size={12} style={{ display: 'inline', marginRight: 4 }} /> {employeeDepartment}
                </span>
                )}
              </div>
            </div>

            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #f0f0f0' }} />

            {/* Date & Time */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
                {currentDate}
              </div>
              <div style={{ fontSize: 48, fontWeight: 600, margin: '4px 0', color: '#1a1a2e' }}>
                {currentTime}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: clockStatus === 'in' ? '#52c41a' :
                    clockStatus === 'out' ? '#faad14' : '#52c41a'
              }} />
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                {getStatusMessage()}
              </span>
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity && (
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                {recentActivity}
              </span>
                </div>
            )}

            {retryCount > 0 && (
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#faad14' }}>
                Attempt {retryCount + 1}...
              </span>
                </div>
            )}

            {/* Clock Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                  onClick={handleClockIn}
                  disabled={isClockInDisabled || loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    height: 56,
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 500,
                    border: 'none',
                    cursor: isClockInDisabled || loading ? 'not-allowed' : 'pointer',
                    background: isClockInDisabled ? '#d9d9d9' : '#52c41a',
                    color: '#fff',
                    transition: 'all 0.3s',
                    opacity: isClockInDisabled || loading ? 0.7 : 1
                  }}
              >
                {loading && clockStatus === 'in' ? (
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                    <CheckCircle size={20} />
                )}
                {isClockInDisabled ? '✅ Clocked In' : '🟢 Clock In'}
              </button>

              <button
                  onClick={handleClockOut}
                  disabled={isClockOutDisabled || loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    height: 56,
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 500,
                    border: 'none',
                    cursor: isClockOutDisabled || loading ? 'not-allowed' : 'pointer',
                    background: isClockOutDisabled ? '#d9d9d9' : '#faad14',
                    color: '#fff',
                    transition: 'all 0.3s',
                    opacity: isClockOutDisabled || loading ? 0.7 : 1
                  }}
              >
                {loading && clockStatus === 'out' ? (
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                    <XCircle size={20} />
                )}
                {isClockOutDisabled ? '✅ Clocked Out' : '🟡 Clock Out'}
              </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: message.type === 'success' ? '#f6ffed' :
                      message.type === 'error' ? '#fff2f0' :
                          message.type === 'warning' ? '#fffbe6' : '#e6f7ff',
                  border: `1px solid ${
                      message.type === 'success' ? '#b7eb8f' :
                          message.type === 'error' ? '#ffccc7' :
                              message.type === 'warning' ? '#ffe58f' : '#91d5ff'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {message.type === 'warning' && <AlertCircle size={16} color="#faad14" />}
                    <span style={{
                      fontSize: 13,
                      color: message.type === 'success' ? '#52c41a' :
                          message.type === 'error' ? '#ff4d4f' :
                              message.type === 'warning' ? '#faad14' : '#1890ff'
                    }}>
                  {message.text}
                </span>
                  </div>
                  <button
                      onClick={() => setMessage(null)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 16,
                        color: '#8c8c8c',
                        padding: '0 4px'
                      }}
                  >
                    ×
                  </button>
                </div>
            )}

            {/* Today's Stats */}
            <hr style={{ margin: '16px 0 10px', border: 'none', borderTop: '1px solid #f0f0f0' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#8c8c8c' }}>
              Today's Summary
            </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <div style={{
                textAlign: 'center',
                padding: '6px 4px',
                background: '#f6f8fa',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>Status</div>
                <span style={{
                  display: 'inline-block',
                  padding: '1px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  marginTop: 1,
                  background: status.color === '#52c41a' ? '#f6ffed' :
                      status.color === '#faad14' ? '#fff7e6' : '#f5f5f5',
                  color: status.color === '#52c41a' ? '#52c41a' :
                      status.color === '#faad14' ? '#faad14' : '#8c8c8c'
                }}>
                {status.icon} {status.text}
              </span>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '6px 4px',
                background: '#f6f8fa',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>Hours</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {todayRecord?.hoursWorked?.toFixed(2) ?? '--:--'}
                </div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '6px 4px',
                background: '#f6f8fa',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>Overtime</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {todayRecord?.overtimeHours?.toFixed(2) ?? '0.00'}
                </div>
              </div>
            </div>

            {/* Attendance Rate */}
            {stats && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: '#8c8c8c' }}>Attendance Rate</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: rateColor }}>
                  {attendanceRate.toFixed(1)}%
                </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 6,
                    background: '#f0f0f0',
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(attendanceRate, 100)}%`,
                      height: '100%',
                      background: rateColor,
                      borderRadius: 3,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
            )}
          </div>

          <div style={{
            padding: '10px 24px',
            background: '#fafafa',
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center'
          }}>
          <span style={{ fontSize: 11, color: '#8c8c8c' }}>
            {employeeDepartment || 'HRM System'} {employeePosition ? `• ${employeePosition}` : ''}
          </span>
          </div>
        </div>

        <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
  );
};

export default TimeClock;