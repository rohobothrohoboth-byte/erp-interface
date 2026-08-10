// pages/core/EditAccountPage.tsx

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Shield, User, Building2, Mail, Activity, Sun, Moon, AlertCircle, Loader2 } from "lucide-react";
import { EditAccountTabs } from "@/modules/core/components/usermgmt/EditAccountTabs";
import { getAccountByEmployeeId, getUserApiPermissions, getAppUserByEmployeeId } from "@/modules/auth/services/account/account.api";
import { Button } from "@/shared/components/ui/button";
import toast from "react-hot-toast";

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  return { isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) };
};

export default function EditAccountPage() {
  const { empId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [employee, setEmployee] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccountActive, setIsAccountActive] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!empId) {
        setError("No employee ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const stateEmployee = location.state?.employee;
        let appUserId = location.state?.appUserId;

        console.log("Received appUserId from state:", appUserId);
        console.log("Received employee data:", stateEmployee);

        if (!stateEmployee) {
          throw new Error("Employee data not found in navigation state");
        }

        if (!appUserId && stateEmployee) {
          appUserId = stateEmployee.appUserId || stateEmployee.userId || null;
          console.log("AppUserId from employee data:", appUserId);
        }

        if (!appUserId) {
          try {
            const appUser = await getAppUserByEmployeeId(empId);
            appUserId = appUser?.id || appUser?.userId || null;
            console.log("Fetched AppUser ID from API:", appUserId);
          } catch (error) {
            console.warn("Could not fetch AppUser ID:", error);
          }
        }

        const accountActive = stateEmployee.isAccountActive === true;
        setIsAccountActive(accountActive);
        setEmployee(stateEmployee);

        const employeeIdForApi = empId;
        console.log("Using EmployeeId for API:", employeeIdForApi);

        const account = await getAccountByEmployeeId(employeeIdForApi);
        const apiPermissions = await getUserApiPermissions(employeeIdForApi);

        setAccountData({
          userId: employeeIdForApi,
          appUserId: appUserId,
          modules: account?.modules || account?.moduleIds || [],
          permissions: account?.permissions || account?.menuIds || [],
          apiPermissions: apiPermissions || account?.apiPermissions || [],
          roleId: account?.roleId,
          isActive: accountActive,
          hasAccount: stateEmployee.hasAccount === true,
        });

      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load account data");
        toast.error(err.message || "Failed to load account data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empId, location]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading account data...</p>
          </div>
        </div>
    );
  }

  if (error || !employee || !accountData) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Account</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Account data not found"}</p>
            <Button onClick={() => navigate("/core/users")} className="bg-red-600 text-white">Go Back</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />
        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">User Management</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">Edit Account Permissions</h1>
              <p className="text-sm text-slate-500 mt-1">
                Modify system access for: <span className="font-semibold text-emerald-600">{employee?.empFullName}</span>
                {!isAccountActive && <span className="ml-2 text-amber-600 text-xs">(Account Inactive)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Button variant="outline" onClick={() => navigate("/core/users")} className="gap-2">
                <ArrowLeft size={16} /> Back to Users
              </Button>
            </div>
          </div>

          {/* ✅ REPLACE EditAccountWizard with EditAccountTabs */}
          <EditAccountTabs
              onBackToAccounts={() => navigate("/core/users")}
              onAccountUpdated={() => {
                toast.success("Account updated successfully!");
                navigate("/core/users");
              }}
              onAccountDeleted={() => {
                toast.success("Account deleted successfully!");
                navigate("/core/users");
              }}
              employee={employee}
              accountData={{
                userId: accountData.appUserId || accountData.userId,
                modules: accountData.modules || [],
                moduleNames: accountData.moduleNames || [],
                permissions: accountData.permissions || [],
                permissionNames: accountData.permissionNames || [],
                apiPermissions: accountData.apiPermissions || [],
                apiPermissionNames: accountData.apiPermissionNames || [],
                isActive: accountData.isActive !== false,
                roleId: accountData.roleId,
                appUserId: accountData.appUserId,
                hasAccount: accountData.hasAccount,
              }}
          />
        </div>
      </div>
  );
}