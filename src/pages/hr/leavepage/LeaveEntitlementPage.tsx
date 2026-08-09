// LeaveEntitlementPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { leaveApi } from '../../../services/hr/leave/leave.api';
import { useAuthStore } from '../../../stores/auth.store';
import { showToast } from '../../../lib/toast';
import { Button } from '../../../components/ui/button';
import { empApi } from '../../../services/hr/employee/emp.api';  // Use empApi directly

interface LeaveEntitlement {
  id: string;
  leaveTypeId: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryForward: number;
  fiscalYear: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}

interface EmployeeInfo {
  name: string;
  employeeCode: string;
  department: string;
}

const LeaveEntitlementPage = () => {
  const { userName, employeeId, role } = useAuthStore();
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: userName || 'Current User',
    employeeCode: employeeId ? employeeId.slice(0, 8) : 'EMP001',
    department: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch employee details from backend using empApi
  const fetchEmployeeDetails = async () => {
    if (!employeeId) return;

    try {
      const employee = await empApi.getEmployeeById(employeeId);
      if (employee) {
        setEmployeeInfo({
          name: employee.empFullName || employee.empFullNameAm || userName || 'Current User',
          employeeCode: employee.code || employee.code || (employeeId ? employeeId.slice(0, 8) : 'EMP001'),
          department: employee.department || employee.department || 'Employee'
        });
      } else {
        // Fallback
        setEmployeeInfo(prev => ({
          ...prev,
          department: role === 'admin' ? 'Administration' : (role === 'hr' ? 'Human Resources' : 'Employee')
        }));
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setEmployeeInfo(prev => ({
        ...prev,
        department: role === 'admin' ? 'Administration' : (role === 'hr' ? 'Human Resources' : 'Employee')
      }));
    }
  };

  const fetchEntitlements = async () => {
    setLoading(true);
    try {
      const response = await leaveApi.getMyLeaveBalances();
      console.log('API Response:', response);

      if (response && Array.isArray(response) && response.length > 0) {
        const mappedEntitlements = response.map((item: any, index: number) => ({
          id: item.leaveTypeId || index.toString(),
          leaveTypeId: item.leaveTypeId || '',
          leaveType: item.leaveType || 'Annual Leave',
          totalDays: Number(item.assignedEntitlement) || Number(item.totalDays) || 0,
          usedDays: Number(item.balance) || Number(item.usedDays) || 0,
          remainingDays: Number(item.remainingBalance) || Number(item.remainDays) || 0,
          carryForward: Number(item.carryForward) || 0,
          fiscalYear: item.fiscalYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          effectiveFrom: item.effectiveFrom || '',
          effectiveTo: item.effectiveTo || null,
          isActive: item.isActive ?? true,
        }));
        setEntitlements(mappedEntitlements);
      } else {
        console.log('No entitlement data found');
        setEntitlements([]);
      }
    } catch (error: any) {
      console.error('Error fetching leave entitlements:', error);
      showToast.error(error?.message || 'Failed to load leave entitlements');
      setEntitlements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchEntitlements(), fetchEmployeeDetails()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    Promise.all([fetchEntitlements(), fetchEmployeeDetails()]);
  }, []);

  const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
  };

  const getRemainingDaysColor = (days: number) => {
    if (days <= 0) return 'text-red-600 bg-red-50';
    if (days <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const displayName = employeeInfo.name;
  const displayEmployeeCode = employeeInfo.employeeCode;
  const displayDepartment = employeeInfo.department;

  if (loading) {
    return (
        <Card className="border rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50 p-4 border-b">
            <CardTitle className="text-lg font-semibold">Leave Entitlements</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="border rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 p-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Leave Entitlements</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {entitlements.length} {entitlements.length === 1 ? 'Type' : 'Types'}
            </Badge>
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
            >
              {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                  <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="font-medium">Employee</TableHead>
                  <TableHead className="font-medium">Department</TableHead>
                  <TableHead className="font-medium">Leave Type</TableHead>
                  <TableHead className="font-medium text-center">Total Days</TableHead>
                  <TableHead className="font-medium text-center">Used Days</TableHead>
                  <TableHead className="font-medium text-center">Remaining Days</TableHead>
                  <TableHead className="font-medium text-center">Carry Forward</TableHead>
                  <TableHead className="font-medium">Fiscal Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entitlements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-gray-300" />
                          <p>No entitlement data found</p>
                          <p className="text-sm text-gray-400">
                            Please run policy assignment first
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : (
                    entitlements.map((entitlement) => (
                        <TableRow key={entitlement.id} className="hover:bg-gray-50">
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                                {getInitials(displayName)}
                              </div>
                              <div>
                                <div className="font-medium">{displayName}</div>
                                <div className="text-xs text-gray-500">{displayEmployeeCode}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge variant="outline" className="bg-gray-100">
                              {displayDepartment}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm inline-block">
                              {entitlement.leaveType}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center font-medium">
                            {entitlement.totalDays}
                            {entitlement.totalDays === 0 && (
                                <span className="text-xs text-gray-400 ml-1">(No policy assigned)</span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center text-amber-600">
                            {entitlement.usedDays}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center">
                            <div className={`${getRemainingDaysColor(entitlement.remainingDays)} px-3 py-1 rounded-full text-sm inline-block font-medium`}>
                              {entitlement.remainingDays} days
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-center">
                            {entitlement.carryForward > 0 ? entitlement.carryForward : '—'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-gray-500">
                            {entitlement.fiscalYear}
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
  );
};

export default LeaveEntitlementPage;