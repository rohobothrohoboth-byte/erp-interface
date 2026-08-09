import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddEmployeeStepForm } from '../../../components/hr/employee/AddEmployee/AddEmployeeStepForm';
import { ArrowLeft, Users, Briefcase, Award, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useBranches } from '../../../services/core/branch/branch.queries';
import { useDepartments } from '../../../services/core/department/dept.queries';
import { useEmployeeList } from '../../../services/hr/employee/emp.queries';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AddEmployeePage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Fetch real data from APIs
    const {
        data: branches = [],
        isLoading: branchesLoading,
        error: branchesError
    } = useBranches();

    const {
        data: departments = [],
        isLoading: deptsLoading,
        error: deptsError
    } = useDepartments();

    const {
        data: employees = [],
        isLoading: empLoading,
        error: empError
    } = useEmployeeList();

    // ============================================================
    // ✅ CALCULATE REAL STATS WITH PROPER FIELD MAPPING
    // ============================================================

    const statsData = useMemo(() => {
        // Log raw data to debug
        if (employees.length > 0) {
            console.log('Employee sample:', employees[0]);
            console.log('Employee fields:', Object.keys(employees[0]));
        }

        // Active employees - try multiple field names
        const active = employees.filter(emp => {
            const state = emp.empState || emp.EmpState || emp.employmentStatus || emp.status || '';
            return state.toLowerCase() === 'active' ||
                state.toLowerCase() === 'approved' ||
                state.toLowerCase() === 'active employee';
        }).length;

        // Departments - try multiple field names
        const depts = departments.filter(dept => {
            const stat = dept.deptStat || dept.status || dept.isActive || '';
            return stat === '0' || stat === 'Active' || stat === true;
        }).length;

        // Unique positions/roles
        const roles = new Set(
            employees
                .map(emp => emp.position || emp.Position || emp.jobTitle || emp.role)
                .filter(Boolean)
        ).size;

        // Branches - try multiple field names
        const activeBranches = branches.filter(branch => {
            const stat = branch.branchStat || branch.status || branch.isActive || '';
            return stat === '0' || stat === 'Active' || stat === true;
        }).length;

        return {
            active,
            depts: depts || departments.length,
            roles: roles || 0,
            branches: activeBranches || branches.length,
            totalEmployees: employees.length,
            totalDepartments: departments.length,
            totalBranches: branches.length,
        };
    }, [employees, departments, branches]);

    // ============================================================
    // ✅ HANDLERS
    // ============================================================

    const handleBackToEmployees = () => navigate('/hr/employees/record');

    const handleEmployeeAdded = (result: any) => {
        console.log('Employee added:', result);
        navigate('/hr/employees/record');
    };

    // ============================================================
    // ✅ LOADING STATE
    // ============================================================

    if (branchesLoading || deptsLoading || empLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-slate-600">{t.loadingDashboardData || 'Loading dashboard data...'}</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ✅ RENDER
    // ============================================================

    const hasError = branchesError || deptsError || empError;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <button
                        onClick={handleBackToEmployees}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t.backToEmployees || 'Back to Employees'}
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">{t.addNewEmployee || 'Add New Employee'}</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {t.registerNewTeamMember || 'Register a new team member.'} {t.requiredFieldsMarked || 'Fields marked with'} <span className="text-red-500">*</span> {t.areRequired || 'are required.'}
                    </p>
                </div>

                {/* Quick Stats - REAL DATA from API */}
                <div className="flex gap-3 flex-wrap">
                    <StatCard
                        icon={<Users className="w-4 h-4" />}
                        label={t.activeEmployees || 'Active Employees'}
                        value={statsData.active.toString()}
                        color="blue"
                        tooltip={`${statsData.active} ${t.activeEmployeesOutOf || 'active employees out of'} ${statsData.totalEmployees} ${t.total || 'total'}`}
                    />
                    <StatCard
                        icon={<Briefcase className="w-4 h-4" />}
                        label={t.departments || 'Departments'}
                        value={statsData.depts.toString()}
                        color="purple"
                        tooltip={`${statsData.depts} ${t.activeDepartments || 'active departments'} ${t.outOf || 'out of'} ${statsData.totalDepartments} ${t.total || 'total'}`}
                    />
                    <StatCard
                        icon={<Award className="w-4 h-4" />}
                        label={t.jobRoles || 'Job Roles'}
                        value={statsData.roles.toString()}
                        color="emerald"
                        tooltip={`${statsData.roles} ${t.distinctPositions || 'distinct positions across organization'}`}
                    />
                    <StatCard
                        icon={<Building2 className="w-4 h-4" />}
                        label={t.activeBranches || 'Active Branches'}
                        value={statsData.branches.toString()}
                        color="orange"
                        tooltip={`${statsData.branches} ${t.activeBranchesOutOf || 'active branches out of'} ${statsData.totalBranches} ${t.total || 'total'}`}
                    />
                </div>
            </div>

            {/* Error Messages if any */}
            {hasError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ {t.someDataCouldNotBeLoaded || 'Some data couldn\'t be loaded. Stats shown may be partial.'}
                        </p>
                        {branchesError && <p className="text-xs text-yellow-600 mt-1">• Branches: {branchesError.message || 'Failed to load'}</p>}
                        {deptsError && <p className="text-xs text-yellow-600">• Departments: {deptsError.message || 'Failed to load'}</p>}
                        {empError && <p className="text-xs text-yellow-600">• Employees: {empError.message || 'Failed to load'}</p>}
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <div className="p-6 lg:p-8">
                    <AddEmployeeStepForm
                        onBackToEmployees={handleBackToEmployees}
                        onEmployeeAdded={handleEmployeeAdded}
                    />
                </div>
            </div>
        </div>
    );
};

/* ==================== STAT CARD ==================== */
const StatCard = ({
                      icon,
                      label,
                      value,
                      color,
                      tooltip
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    tooltip?: string;
}) => {
    const { t } = useLanguage();
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
        slate: 'bg-slate-50 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400',
    };

    return (
        <div
            className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 text-center min-w-[85px] hover:shadow-md transition-shadow group relative cursor-help"
            title={tooltip}
        >
            <div className={`p-1.5 ${colors[color]} rounded-lg inline-flex mb-1`}>
                {icon}
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        </div>
    );
};

export default AddEmployeePage;