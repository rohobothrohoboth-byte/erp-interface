import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditEmployeeStepForm } from '@/modules/hr/components/employee/EditEmployee/EditEmployeeStepForm';
import type { UUID } from 'crypto';
import {
  ArrowLeft,
  User,
  Edit3,
  AlertTriangle,
  Save,
  Users,
  Briefcase,
  Calendar,
  Award,
  Building2,
  Loader2,
  UserCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmployeeList } from '@/modules/hr/services/employee/emp.queries';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export const EditEmployeePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: UUID }>();
  const [employee, setEmployee] = useState<any>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  // Fetch all employees to get the specific employee data
  const {
    data: employees = [],
    isLoading: empLoading,
    error: empError,
  } = useEmployeeList();

  // ============================================================
  // ✅ FIND EMPLOYEE BY ID
  // ============================================================

  useEffect(() => {
    if (employees.length > 0 && employeeId) {
      const found = employees.find(
          (emp: any) =>
              emp.id === employeeId ||
              emp.employeeId === employeeId ||
              emp.Id === employeeId
      );
      if (found) {
        setEmployee(found);
        // Store in session for the form
        sessionStorage.setItem('selectedEmployee', JSON.stringify(found));
      }
      setLoadingEmployee(false);
    } else if (!empLoading && employees.length === 0) {
      setLoadingEmployee(false);
    }
  }, [employees, employeeId, empLoading]);

  // ============================================================
  // ✅ CALCULATE STATS
  // ============================================================

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(
        (emp: any) => {
          const state = emp.empState || emp.EmpState || emp.status || '';
          return state.toLowerCase() === 'active' ||
              state.toLowerCase() === 'approved';
        }
    ).length;
    const onLeave = employees.filter(
        (emp: any) => {
          const state = emp.empState || emp.EmpState || emp.status || '';
          return state.toLowerCase() === 'on leave' ||
              state.toLowerCase() === 'leave';
        }
    ).length;

    return { total, active, onLeave };
  }, [employees]);

  // ============================================================
  // ✅ HANDLERS
  // ============================================================

  const handleBackToEmployees = () => {
    navigate('/hr/employees/record');
  };

  const handleEmployeeUpdated = (result: any) => {
    console.log('Employee updated successfully:', result);
    navigate('/hr/employees/record');
  };

  // ============================================================
  // ✅ LOADING STATE
  // ============================================================

  if (empLoading || loadingEmployee) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-2">
              {t.loadingEmployee || 'Loading Employee...'}
            </h3>
            <p className="text-slate-500">{t.pleaseWait || 'Please wait while we fetch the employee data.'}</p>
          </div>
        </div>
    );
  }

  // ============================================================
  // ✅ EMPLOYEE NOT FOUND
  // ============================================================

  if (!employeeId || (!empLoading && !employee && !loadingEmployee)) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-md w-full"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

              <div className="p-8 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center"
                >
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </motion.div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  {t.employeeNotFound || 'Employee Not Found'}
                </h2>

                <p className="text-gray-600 mb-6">
                  {t.employeeNotFoundMessage || 'The employee you are trying to edit could not be found. Please check the ID and try again.'}
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToEmployees}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.backToEmployees || 'Back to Employees'}
                </motion.button>
              </div>
            </div>

            <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-yellow-400/10 to-red-400/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
    );
  }

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Back Button and Title */}
              <div className="space-y-4">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleBackToEmployees}
                    className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 hover:bg-white hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  {t.backToEmployees || 'Back to Employees'}
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-2"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-sm">
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white tracking-wide">{t.editMode || 'EDIT MODE'}</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {t.editEmployee || 'Edit Employee'}
                  </h1>
                  <p className="text-slate-500 text-lg max-w-2xl">
                    {employee?.empFullName
                        ? `${t.editing || 'Editing'} ${employee.empFullName}`
                        : t.updateEmployeeInfo || 'Update employee information. Modify the fields below to make changes to the employee record.'}
                  </p>
                </motion.div>
              </div>

              {/* ✅ Quick Stats Cards - REAL DATA */}
              <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[280px]"
              >
                <StatCard
                    icon={<User className="w-4 h-4" />}
                    label={t.totalEmployees || 'Total'}
                    value={stats.total.toString()}
                    color="blue"
                />
                <StatCard
                    icon={<UserCheck className="w-4 h-4" />}
                    label={t.active || 'Active'}
                    value={stats.active.toString()}
                    color="green"
                />
                <StatCard
                    icon={<Clock className="w-4 h-4" />}
                    label={t.onLeave || 'On Leave'}
                    value={stats.onLeave.toString()}
                    color="amber"
                />
                <StatCard
                    icon={<Building2 className="w-4 h-4" />}
                    label={t.departments || 'Depts'}
                    value={employee?.department || 'N/A'}
                    color="purple"
                    isText
                />
              </motion.div>
            </div>
          </div>

          {/* Employee Info Banner */}
          {employee && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.editing || 'Editing'}:
                </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {employee.empFullName || employee.name || 'Unknown'}
                </span>
                  </div>
                  <div className="w-px h-4 bg-blue-200 dark:bg-blue-800" />
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{employee.position || employee.jobTitle || 'N/A'}</span>
                  </div>
                  <div className="w-px h-4 bg-blue-200 dark:bg-blue-800" />
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Building2 className="w-4 h-4" />
                    <span>{employee.department || 'N/A'}</span>
                  </div>
                  <div className="w-px h-4 bg-blue-200 dark:bg-blue-800" />
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{t.id || 'ID'}: {employee.code || employee.employeeCode || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
          )}

          {/* Main Form Container */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

              <div className="px-6 lg:px-8 pt-6 pb-4 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                    <Edit3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {t.editEmployeeInformation || 'Edit Employee Information'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {t.updateEmployeeDetails || 'Update the employee details and save changes'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <EditEmployeeStepForm
                    employeeId={employeeId}
                    onBackToEmployees={handleBackToEmployees}
                    onEmployeeUpdated={handleEmployeeUpdated}
                />
              </div>
            </div>
          </motion.div>

          {/* Footer Information */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>{t.changesSavedRealTime || 'Changes are saved in real-time'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>{t.encryptedConnection || 'Encrypted connection'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span>{t.auditTrailEnabled || 'Audit trail enabled'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
      `}</style>
      </div>
  );
};

// ============================================================
// STAT CARD COMPONENT
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'slate';
  isText?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, isText }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    slate: 'bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400',
  };

  return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-slate-200/50 dark:border-slate-700 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1.5 ${colors[color]} rounded-lg`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <p className={`text-sm font-semibold ${isText ? 'text-slate-800 dark:text-slate-200 truncate' : 'text-slate-800 dark:text-slate-200'}`}>
          {value}
        </p>
      </div>
  );
};

export default EditEmployeePage;