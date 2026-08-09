import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Building2, Briefcase, Clock,
  User, AlertCircle, Heart, Baby, FileHeart, UserCheck, MapPin, RefreshCw,
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useLanguage } from '../../../i18n/LanguageContext';
import { leaveRequestService, type LeaveRequestDto } from '../../../services/hr/leave/leaveRequest.service';

export interface OnLeaveEmployeeType {
  id?: string;
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  department: string;
  position: string;
  branch?: string;
  leaveType: "Annual" | "Sick" | "Maternity" | "Unpaid" | "Paternity" | "Bereavement";
  startDate?: string;
  endDate?: string;
  days?: number;
}

interface Props {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const getLeaveTypeConfig = (type: OnLeaveEmployeeType["leaveType"]) => {
  const configs = {
    Annual: { icon: Calendar, color: "blue", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", descriptionKey: "annualLeaveDesc" },
    Sick: { icon: AlertCircle, color: "red", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800", descriptionKey: "sickLeaveDesc" },
    Maternity: { icon: Baby, color: "pink", bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800", descriptionKey: "maternityLeaveDesc" },
    Paternity: { icon: Heart, color: "purple", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", descriptionKey: "paternityLeaveDesc" },
    Bereavement: { icon: FileHeart, color: "gray", bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", descriptionKey: "bereavementLeaveDesc" },
    Unpaid: { icon: Clock, color: "amber", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", descriptionKey: "unpaidLeaveDesc" },
  };
  return configs[type] || configs.Annual;
};

const getInitials = (name: string): string =>
    name?.split(' ')?.map((n) => n[0])?.join('')?.toUpperCase() || '??';

const OnLeaveEmployee: React.FC<Props> = ({ limit = 5, showViewAll = true, onViewAll }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { permissions, role } = useAuthStore();
  const [employees, setEmployees] = useState<OnLeaveEmployeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if user has permission to view leave requests
  const checkPermission = () => {
    // Admin or super_admin always have access
    if (role === 'admin' || role === 'super_admin') {
      setHasPermission(true);
      return true;
    }

    // Check for specific permissions
    const canViewAllLeave = permissions?.some(module =>
        module.M?.some(menu =>
            menu.K === 'hr.leave.view' ||
            menu.C?.some(child => child.K === 'hr.leave.view')
        )
    );

    setHasPermission(!!canViewAllLeave);
    return !!canViewAllLeave;
  };

  const fetchOnLeaveEmployees = async () => {
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const onLeaveRequests = await leaveRequestService.getOnLeaveEmployees();

      const mappedEmployees: OnLeaveEmployeeType[] = onLeaveRequests.map((req: LeaveRequestDto) => {
        const leaveTypeMap: Record<string, OnLeaveEmployeeType["leaveType"]> = {
          'Annual': 'Annual', 'Sick': 'Sick', 'Maternity': 'Maternity',
          'Unpaid': 'Unpaid', 'Paternity': 'Paternity', 'Bereavement': 'Bereavement'
        };

        return {
          id: req.employeeId,
          empFullName: req.employeeName,
          empFullNameAm: req.employeeNameAm || '',
          gender: req.gender,
          department: req.department,
          position: req.position,
          branch: req.branch,
          leaveType: leaveTypeMap[req.leaveType] || 'Annual',
          startDate: req.startDate,
          endDate: req.endDate,
          days: req.daysRequested
        };
      });

      setEmployees(mappedEmployees);
    } catch (err: any) {
      console.error('Failed to fetch on-leave employees:', err);
      // Don't show error for 401, just show empty state
      if (err?.response?.status !== 401) {
        setError(t.failedToLoadLeaveEmployees || 'Failed to load on-leave employees');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasAccess = checkPermission();
    if (hasAccess) {
      fetchOnLeaveEmployees();

      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchOnLeaveEmployees, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const handleViewEmployee = (employeeId?: string) => {
    if (employeeId) navigate(`/hr/employees/record/${employeeId}`);
  };

  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    else navigate("/hr/on-leave");
  };

  const displayedEmployees = limit ? employees.slice(0, limit) : employees;
  const totalOnLeave = displayedEmployees.length;
  const totalDays = displayedEmployees.reduce((acc, emp) => acc + (emp.days || 0), 0);

  const leaveTypeCounts = displayedEmployees.reduce((acc, emp) => {
    acc[emp.leaveType] = (acc[emp.leaveType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // No permission state
  if (!hasPermission) {
    return (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.noPermissionToView || 'No permission to view on-leave employees'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.contactAdministrator || 'Contact your administrator'}</p>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 p-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
          ))}
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchOnLeaveEmployees} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="w-3 h-3 mr-1" /> {t.retry || 'Retry'}
          </Button>
        </div>
    );
  }

  if (displayedEmployees.length === 0) {
    return (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.noEmployeesOnLeave || 'No employees on leave'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.allEmployeesActive || 'All employees are currently active'}</p>
        </div>
    );
  }

  return (
      <div className="space-y-3">
        {/* Stats Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
              {totalOnLeave} {t.onLeave || 'On Leave'}
            </Badge>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{totalDays} {t.totalDays || 'total days'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(leaveTypeCounts).slice(0, 3).map(([type, count]) => {
              const config = getLeaveTypeConfig(type as OnLeaveEmployeeType["leaveType"]);
              const Icon = config.icon;
              return (
                  <div key={type} className="flex items-center gap-1">
                    <div className={`p-0.5 rounded ${config.bg}`}>
                      <Icon className={`w-2.5 h-2.5 ${config.text}`} />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{count}</span>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Employees List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {displayedEmployees.map((employee) => {
            const leaveConfig = getLeaveTypeConfig(employee.leaveType);
            const LeaveIcon = leaveConfig.icon;

            return (
                <div
                    key={employee.id}
                    onClick={() => handleViewEmployee(employee.id)}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className={`text-xs ${leaveConfig.bg} ${leaveConfig.text}`}>
                      {getInitials(employee.empFullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {employee.empFullName}
                      </h4>
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${leaveConfig.bg}`}>
                        <LeaveIcon className={`w-2.5 h-2.5 ${leaveConfig.text}`} />
                        <span className={`text-xs font-medium ${leaveConfig.text}`}>{t[employee.leaveType.toLowerCase() as keyof typeof t] || employee.leaveType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{employee.department || t.na || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{employee.position || t.na || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{employee.days || 0} {t.days || 'days'}</span>
                      </div>
                    </div>

                    {employee.startDate && (
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(employee.startDate).toLocaleDateString()} - {new Date(employee.endDate!).toLocaleDateString()}</span>
                        </div>
                    )}
                  </div>
                </div>
            );
          })}
        </div>

        {/* Footer */}
        {showViewAll && employees.length > limit && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleViewAll} variant="ghost" size="sm" className="w-full text-slate-500">
                {t.viewAllEmployeesOnLeave || 'View all'} {employees.length} {t.employeesOnLeave || 'employees on leave'}
              </Button>
            </div>
        )}
      </div>
  );
};

export default OnLeaveEmployee;