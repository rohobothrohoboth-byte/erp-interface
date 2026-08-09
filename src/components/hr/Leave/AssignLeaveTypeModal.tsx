// AssignLeaveTypeModal.tsx - Updated with optimized department counts

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Loader2, Search, ChevronLeft, ChevronRight, UserPlus, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import toast from 'react-hot-toast';
import { empApi } from '../../../services/hr/employee/emp.api';
import { departmentApi } from '../../../services/core/department/dept.api';
import { leavePolicyService } from '../../../services/core/settings/ModHrm/LeavePolicyService';
import type { LeaveTypeListDto } from '../../../types/core/Settings/leavetype';

interface Employee {
    id: string;
    name: string;
    code: string;
    department?: string;
    position?: string;
    email?: string;
    empFullName?: string;
}

interface AssignLeaveTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (data: any) => Promise<void>;
    leaveType?: LeaveTypeListDto | null;
    loading?: boolean;
}

const AssignLeaveTypeModal: React.FC<AssignLeaveTypeModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onAssign,
                                                                       leaveType,
                                                                       loading = false,
                                                                   }) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [assignmentType, setAssignmentType] = useState<'single' | 'bulk' | 'department' | 'all'>('single');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
    const [loadingPolicy, setLoadingPolicy] = useState(false);
    const [departmentCounts, setDepartmentCounts] = useState<Map<string, number>>(new Map());
    const [loadingDepartmentCounts, setLoadingDepartmentCounts] = useState(false);

    const pageSize = 20;

    const [formData, setFormData] = useState({
        assignedEntitlement: 20,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        assignmentReason: 'Manual'
    });

    // Fetch employees with pagination using real API
    const loadEmployees = useCallback(async () => {
        setLoadingEmployees(true);
        try {
            const params: any = {
                pageNumber: currentPage,
                pageSize: pageSize,
                searchTerm: searchTerm || undefined,
            };

            if (assignmentType === 'department' && selectedDepartment) {
                params.department = selectedDepartment;
            }

            const result = await empApi.getPaginatedEmployees(params);

            const mappedEmployees = result.items.map((emp: any) => ({
                id: emp.id,
                name: emp.empFullName || emp.name || '',
                code: emp.code || '',
                department: emp.department,
                position: emp.position,
                email: emp.email
            }));

            setEmployees(mappedEmployees);
            setTotalPages(result.totalPages);
            setTotalEmployees(result.totalCount);
        } catch (error) {
            console.error('Error loading employees:', error);
            toast.error('Failed to load employees list');
            setEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    }, [currentPage, searchTerm, assignmentType, selectedDepartment]);

    // Fetch departments for filter
    const loadDepartments = useCallback(async () => {
        try {
            const depts = await departmentApi.getAllDepartments();
            setDepartments(depts.map((d: any) => ({ id: d.id, name: d.name })));
        } catch (error) {
            console.error('Error loading departments:', error);
            setDepartments([]);
        }
    }, []);

    // Load department employee counts using the new optimized method
    // In AssignLeaveTypeModal.tsx - Update the loadDepartmentCounts function

// Load department employee counts - Alternative approach
    const loadDepartmentCounts = useCallback(async () => {
        if (!isOpen || assignmentType !== 'department') return;

        setLoadingDepartmentCounts(true);
        try {
            const countsMap = new Map();

            // Fetch all employees once and count by department client-side
            let allEmployees: Employee[] = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const result = await empApi.getPaginatedEmployees({
                    pageNumber: page,
                    pageSize: 500 // Fetch more at once
                });

                const mappedEmployees = result.items.map((emp: any) => ({
                    id: emp.id,
                    name: emp.empFullName || emp.name || '',
                    code: emp.code || '',
                    department: emp.department,
                    departmentId: emp.departmentId,
                    position: emp.position,
                    email: emp.email
                }));

                allEmployees = [...allEmployees, ...mappedEmployees];
                hasMorePages = page < result.totalPages;
                page++;
            }

            // Count employees by department
            for (const dept of departments) {
                const count = allEmployees.filter(emp =>
                    emp.department === dept.name ||
                    emp.departmentId === dept.id
                ).length;
                countsMap.set(dept.id, count);
                console.log(`Department ${dept.name}: ${count} employees`);
            }

            setDepartmentCounts(countsMap);
        } catch (error) {
            console.error('Error loading department counts:', error);
        } finally {
            setLoadingDepartmentCounts(false);
        }
    }, [departments, isOpen, assignmentType]);

    // Fetch the policy ID for the selected leave type
    const fetchPolicyForLeaveType = useCallback(async () => {
        if (!leaveType?.name) {
            return;
        }

        setLoadingPolicy(true);

        try {
            const allPolicies = await leavePolicyService.getAllLeavePolicies();

            const matchingPolicy = allPolicies.find((policy: any) =>
                policy.leaveType === leaveType.name && policy.status === 'Active'
            );

            if (matchingPolicy) {
                setSelectedPolicyId(matchingPolicy.id);
                console.log('Found policy:', matchingPolicy.name);
            } else {
                setSelectedPolicyId('');
                toast.error(`No active policy found for "${leaveType.name}"`);
            }
        } catch (error) {
            console.error('Error fetching policy:', error);
            setSelectedPolicyId('');
        } finally {
            setLoadingPolicy(false);
        }
    }, [leaveType?.name]);

    // When modal opens or leave type changes, fetch the policy
    useEffect(() => {
        if (isOpen && leaveType?.id) {
            fetchPolicyForLeaveType();
        }
    }, [isOpen, leaveType?.id, fetchPolicyForLeaveType]);

    useEffect(() => {
        if (isOpen) {
            loadDepartments();
            loadEmployees();
        }
    }, [isOpen, loadEmployees, loadDepartments]);

    // Load department counts when departments are loaded and in department mode
    useEffect(() => {
        if (departments.length > 0 && assignmentType === 'department') {
            loadDepartmentCounts();
        }
    }, [departments, assignmentType, loadDepartmentCounts]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, assignmentType, selectedDepartment]);

    // Handle select all on current page
    useEffect(() => {
        if (selectAll) {
            const currentPageIds = employees.map(emp => emp.id);
            setSelectedEmployees(prev => [...new Set([...prev, ...currentPageIds])]);
        } else {
            const currentPageIds = employees.map(emp => emp.id);
            setSelectedEmployees(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    }, [selectAll, employees]);

    const handleSelectEmployee = (employeeId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
        setSelectAll(false);
    };

    const handleSelectAllPages = async () => {
        if (selectedEmployees.length === totalEmployees && totalEmployees > 0) {
            setSelectedEmployees([]);
            setSelectAll(false);
        } else {
            toast.loading('Selecting all employees...', { id: 'select-all' });
            try {
                const allIds = await empApi.getAllEmployeeIds(
                    assignmentType === 'department' && selectedDepartment
                        ? { departmentId: selectedDepartment }
                        : undefined
                );
                setSelectedEmployees(allIds);
                toast.success(`Selected ${allIds.length} employees`, { id: 'select-all' });
            } catch (error) {
                console.error('Error fetching all employees:', error);
                toast.error('Failed to select all employees', { id: 'select-all' });
            }
        }
    };

    const handleBulkAssign = async () => {
        // Validation
        if (!leaveType?.id) {
            toast.error('Leave type is required');
            return;
        }

        if (!selectedPolicyId) {
            toast.error('No policy found for this leave type. Please create a policy first.');
            return;
        }

        if (formData.assignedEntitlement <= 0) {
            toast.error('Please enter a valid entitlement amount');
            return;
        }

        let employeeIdsToAssign: string[] = [];

        // Handle different assignment types
        switch (assignmentType) {
            case 'single':
                if (selectedEmployees.length === 0) {
                    toast.error('Please select an employee');
                    return;
                }
                employeeIdsToAssign = selectedEmployees;
                break;

            case 'bulk':
                if (selectedEmployees.length === 0) {
                    toast.error('Please select at least one employee');
                    return;
                }
                employeeIdsToAssign = selectedEmployees;
                break;

            // In AssignLeaveTypeModal.tsx - Update the handleBulkAssign function for department case

            case 'department':
                if (!selectedDepartment) {
                    toast.error('Please select a department');
                    return;
                }

                toast.loading(`Getting employees in department...`, { id: 'dept-fetch' });
                try {
                    // First, get ALL employees
                    let allEmployees: Employee[] = [];
                    let page = 1;
                    let hasMorePages = true;

                    while (hasMorePages) {
                        const result = await empApi.getPaginatedEmployees({
                            pageNumber: page,
                            pageSize: 100
                            // Don't pass department filter here since it's not working
                        });

                        const mappedEmployees = result.items.map((emp: any) => ({
                            id: emp.id,
                            name: emp.empFullName || emp.name || '',
                            code: emp.code || '',
                            department: emp.department,
                            departmentId: emp.departmentId,
                            position: emp.position,
                            email: emp.email
                        }));

                        allEmployees = [...allEmployees, ...mappedEmployees];
                        hasMorePages = page < result.totalPages;
                        page++;
                    }

                    // Filter employees by department client-side
                    const departmentName = departments.find(d => d.id === selectedDepartment)?.name;
                    const filteredEmployees = allEmployees.filter(emp =>
                        emp.department === departmentName ||
                        emp.departmentId === selectedDepartment
                    );

                    const exactCount = filteredEmployees.length;

                    console.log(`Department ${departmentName} has ${exactCount} employees (filtered client-side)`);

                    if (exactCount === 0) {
                        toast.error('No employees found in the selected department', { id: 'dept-fetch' });
                        return;
                    }

                    toast.dismiss('dept-fetch');

                    // Show confirmation with accurate count
                    const confirmed = await new Promise<boolean>((resolve) => {
                        toast.custom((t: any) => (
                            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                                <h3 className="text-lg font-semibold mb-2">Confirm Bulk Assignment</h3>
                                <p className="text-gray-600 mb-2">
                                    You are about to assign "{leaveType.name}" to:
                                </p>
                                <div className="text-center mb-4">
                                    <p className="text-4xl font-bold text-emerald-600">
                                        {exactCount.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">employees</p>
                                </div>
                                <div className="mb-4 p-3 bg-gray-50 rounded">
                                    <p className="text-sm font-medium text-gray-700">Department:</p>
                                    <p className="text-sm text-gray-600">
                                        {departmentName || selectedDepartment}
                                    </p>
                                </div>
                                <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        ⚠️ Note: Employees who already have this leave type will be skipped automatically.
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            resolve(false);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            resolve(true);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ), { duration: 10000 });
                    });

                    if (!confirmed) {
                        return;
                    }

                    employeeIdsToAssign = filteredEmployees.map(emp => emp.id);

                    toast.success(`Found ${employeeIdsToAssign.length} employees in ${departmentName}`, { id: 'dept-fetch' });
                } catch (error) {
                    console.error('Error fetching department employees:', error);
                    toast.error('Failed to fetch department employees', { id: 'dept-fetch' });
                    return;
                }
                break;

            case 'all':
                toast.loading('Fetching all employees...', { id: 'all-fetch' });
                try {
                    let allEmployees: Employee[] = [];
                    let page = 1;
                    let hasMorePages = true;

                    while (hasMorePages) {
                        const result = await empApi.getPaginatedEmployees({
                            pageNumber: page,
                            pageSize: 100
                        });

                        const mappedEmployees = result.items.map((emp: any) => ({
                            id: emp.id,
                            name: emp.empFullName || emp.name || '',
                            code: emp.code || '',
                            department: emp.department,
                            position: emp.position,
                            email: emp.email
                        }));

                        allEmployees = [...allEmployees, ...mappedEmployees];
                        hasMorePages = page < result.totalPages;
                        page++;
                    }

                    employeeIdsToAssign = allEmployees.map(emp => emp.id);
                    toast.success(`Found ${employeeIdsToAssign.length} total employees`, { id: 'all-fetch' });
                } catch (error) {
                    console.error('Error fetching all employees:', error);
                    toast.error('Failed to fetch employees', { id: 'all-fetch' });
                    return;
                }
                break;
        }

        if (employeeIdsToAssign.length === 0) {
            toast.error('No employees found to assign');
            return;
        }

        // Show confirmation for large assignments (bulk mode)
        if (assignmentType === 'bulk' && employeeIdsToAssign.length > 100) {
            const confirmed = await new Promise<boolean>((resolve) => {
                toast.custom((t: any) => (
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold mb-2">Confirm Bulk Assignment</h3>
                        <p className="text-gray-600 mb-2">
                            You are about to assign "{leaveType.name}" to:
                        </p>
                        <div className="text-center mb-4">
                            <p className="text-4xl font-bold text-emerald-600">
                                {employeeIdsToAssign.length.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">employees</p>
                        </div>
                        <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                            <p className="text-sm text-amber-800">
                                ⚠️ Note: Employees who already have this leave type will be skipped automatically.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                ), { duration: 10000 });
            });

            if (!confirmed) {
                return;
            }
        } else if (assignmentType === 'bulk' && employeeIdsToAssign.length > 0) {
            // Show a smaller confirmation for smaller batches
            const confirmed = await new Promise<boolean>((resolve) => {
                toast.custom((t: any) => (
                    <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm mx-auto">
                        <p className="text-sm mb-3">
                            Assign "{leaveType.name}" to <strong>{employeeIdsToAssign.length}</strong> employee(s)?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 });
            });

            if (!confirmed) {
                return;
            }
        }

        const payload = {
            employeeIds: employeeIdsToAssign,
            leaveTypeId: leaveType.id,
            leavePolicyId: selectedPolicyId,
            assignedEntitlement: formData.assignedEntitlement,
            effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
            effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
            assignmentReason: formData.assignmentReason
        };

        console.log('Sending payload:', {
            assignmentType,
            department: assignmentType === 'department' ? selectedDepartment : null,
            employeeCount: employeeIdsToAssign.length,
            leaveTypeId: leaveType.id,
            leavePolicyId: selectedPolicyId
        });

        setInternalLoading(true);
        try {
            await onAssign(payload);
            toast.success(`Leave type "${leaveType.name}" assigned successfully to ${employeeIdsToAssign.length} employee(s)!`);
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Assignment error:', error);

            const errorResponse = error?.response?.data;
            const errorMessage = errorResponse?.message || error?.message || 'Failed to assign leave type';

            if (errorMessage.includes('already being tracked') || errorMessage.includes('duplicate')) {
                toast.error(
                    `Some employees in this ${assignmentType === 'department' ? 'department' : 'selection'} already have "${leaveType.name}" assigned.\n\n` +
                    `Please remove existing assignments first or use the single/bulk selection mode to choose specific employees.`,
                    { duration: 8000 }
                );
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setInternalLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedEmployees([]);
        setSelectAll(false);
        setSearchTerm('');
        setCurrentPage(1);
        setAssignmentType('single');
        setSelectedDepartment('');
        setSelectedPolicyId('');
        setFormData({
            assignedEntitlement: 20,
            effectiveFrom: new Date().toISOString().split('T')[0],
            effectiveTo: '',
            assignmentReason: 'Manual'
        });
    };

    const handleClose = () => {
        if (!isLoading && !internalLoading) {
            resetForm();
            onClose();
        }
    };

    const isLoading = loading || internalLoading || loadingEmployees || loadingPolicy;

    const assignmentTypes = [
        { value: 'single', label: 'Single Employee', icon: Users, description: 'Assign to one employee' },
        { value: 'bulk', label: 'Bulk Selection', icon: Users, description: 'Select multiple employees from list' },
        { value: 'department', label: 'By Department', icon: Filter, description: 'Assign to entire department' },
        { value: 'all', label: 'All Employees', icon: UserPlus, description: 'Assign to all employees' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            {leaveType ? `Assign: ${leaveType.name}` : 'Assign Leave Type'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Assignment Type Selection */}
                    <div className="space-y-2">
                        <Label>Assignment Type</Label>
                        <div className="grid grid-cols-4 gap-3">
                            {assignmentTypes.map(type => {
                                const Icon = type.icon;
                                const isSelected = assignmentType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            setAssignmentType(type.value as any);
                                            setSelectedEmployees([]);
                                            setSelectAll(false);
                                            setCurrentPage(1);
                                            setSelectedDepartment('');
                                        }}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                                            isSelected
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        <p className="text-sm font-medium">{type.label}</p>
                                        <p className="text-xs text-gray-500">{type.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Department Filter */}
                    {assignmentType === 'department' && (
                        <div className="space-y-2">
                            <Label>Select Department</Label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => {
                                        const count = departmentCounts.get(dept.id) || 0;
                                        return (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                                {loadingDepartmentCounts ? (
                                                    <Loader2 className="w-3 h-3 animate-spin inline ml-2" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs ml-2">
                                                        ({count.toLocaleString()} employees)
                                                    </span>
                                                )}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Policy Info Display */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            {loadingPolicy ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-blue-800">Policy Information</p>
                                {selectedPolicyId ? (
                                    <p className="text-xs text-blue-600">
                                        Active policy found for {leaveType?.name}
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-600">
                                        No policy found for this leave type. Please create a policy first.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Employee Selection */}
                    {(assignmentType === 'single' || assignmentType === 'bulk') && (
                        <div className="space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search employees by name, code, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Employee Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {assignmentType === 'bulk' && (
                                                <th className="px-4 py-3 w-12">
                                                    <Checkbox
                                                        checked={selectAll}
                                                        onCheckedChange={(checked) => setSelectAll(checked === true)}
                                                    />
                                                </th>
                                            )}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {loadingEmployees ? (
                                            <tr>
                                                <td colSpan={assignmentType === 'bulk' ? 4 : 3} className="px-4 py-8 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                                                    <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                                                </td>
                                            </tr>
                                        ) : employees.length === 0 ? (
                                            <tr>
                                                <td colSpan={assignmentType === 'bulk' ? 4 : 3} className="px-4 py-8 text-center text-gray-500">
                                                    No employees found
                                                </td>
                                            </tr>
                                        ) : (
                                            employees.map((emp) => (
                                                <tr
                                                    key={emp.id}
                                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                                                        selectedEmployees.includes(emp.id) ? 'bg-emerald-50' : ''
                                                    }`}
                                                    onClick={() => {
                                                        if (assignmentType === 'single') {
                                                            setSelectedEmployees([emp.id]);
                                                        } else if (assignmentType === 'bulk') {
                                                            handleSelectEmployee(emp.id);
                                                        }
                                                    }}
                                                >
                                                    {assignmentType === 'bulk' && (
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={selectedEmployees.includes(emp.id)}
                                                                onCheckedChange={() => handleSelectEmployee(emp.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                                            {emp.email && (
                                                                <p className="text-xs text-gray-500">{emp.email}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{emp.code}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {!loadingEmployees && employees.length > 0 && (
                                    <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                                        <p className="text-sm text-gray-600">
                                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalEmployees)} of {totalEmployees} employees
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded border bg-white disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="px-3 py-2 text-sm">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded border bg-white disabled:opacity-50"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selection Summary */}
                            {assignmentType === 'bulk' && selectedEmployees.length > 0 && (
                                <div className="bg-emerald-50 p-3 rounded-lg">
                                    <p className="text-sm text-emerald-800">
                                        <strong>{selectedEmployees.length}</strong> employee(s) selected
                                        {selectedEmployees.length < totalEmployees && selectedEmployees.length > 0 && (
                                            <button
                                                onClick={handleSelectAllPages}
                                                className="ml-3 text-xs text-emerald-600 hover:text-emerald-800 underline"
                                            >
                                                Select all {totalEmployees} employees
                                            </button>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Single Selection Display */}
                            {assignmentType === 'single' && selectedEmployees.length === 1 && (
                                <div className="bg-emerald-50 p-3 rounded-lg">
                                    <p className="text-sm text-emerald-800">
                                        Selected: {employees.find(e => e.id === selectedEmployees[0])?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Employees Selection Info */}
                    {assignmentType === 'all' && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Assign to All Employees</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        This will assign "{leaveType?.name}" to all {totalEmployees.toLocaleString()} employees in the system.
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2">
                                        This action may take a few moments to process.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assignment Settings */}
                    <div className="border-t pt-4 space-y-4">
                        <h3 className="text-md font-medium text-gray-800">Assignment Settings</h3>

                        <div className="space-y-2">
                            <Label>Assigned Entitlement (Days) <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                step="0.5"
                                value={formData.assignedEntitlement}
                                onChange={(e) => setFormData({ ...formData, assignedEntitlement: parseFloat(e.target.value) })}
                                placeholder="e.g., 20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Effective From</Label>
                                <Input
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Effective To (Optional)</Label>
                                <Input
                                    type="date"
                                    value={formData.effectiveTo}
                                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Leave empty for no expiry</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assignment Reason</Label>
                            <Select
                                value={formData.assignmentReason}
                                onValueChange={(value) => setFormData({ ...formData, assignmentReason: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                                    <SelectItem value="Promotion">Promotion</SelectItem>
                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                    <SelectItem value="PolicyChange">Policy Change</SelectItem>
                                    <SelectItem value="BulkAssignment">Bulk Assignment</SelectItem>
                                    <SelectItem value="Manual">Manual Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBulkAssign}
                        disabled={isLoading || !leaveType?.id || !selectedPolicyId || formData.assignedEntitlement <= 0 ||
                            (assignmentType !== 'all' && assignmentType !== 'department' && selectedEmployees.length === 0)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Assigning...
                            </>
                        ) : (
                            `Assign to ${assignmentType === 'single' ? 'Employee' :
                                assignmentType === 'bulk' ? `${selectedEmployees.length || 0} Employee(s)` :
                                    assignmentType === 'department' ? 'Department' : 'All Employees'}`
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default AssignLeaveTypeModal;