// src/components/hr/Leave/EncashmentHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, Filter, Users } from 'lucide-react';
import { empApi } from '../../../services/hr/employee/emp.api';
import type { EncashmentRecord } from '../../../types/hr/leave/leaveye';

interface EncashmentHistoryProps {
    data: EncashmentRecord[];
    loading: boolean;
    isAdminOrManager?: boolean;
}

// Cache for employee names
const employeeNameCache: Map<string, string> = new Map();

const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
        case 'approved':
        case 'approve':
        case 'completed':
            return {
                icon: <CheckCircle className="w-4 h-4" />,
                className: 'bg-green-100 text-green-800',
                text: 'Approved'
            };
        case 'pending':
        case 'submitted':
            return {
                icon: <Clock className="w-4 h-4" />,
                className: 'bg-yellow-100 text-yellow-800',
                text: 'Pending'
            };
        case 'rejected':
        case 'declined':
            return {
                icon: <XCircle className="w-4 h-4" />,
                className: 'bg-red-100 text-red-800',
                text: 'Rejected'
            };
        case 'cancelled':
            return {
                icon: <AlertCircle className="w-4 h-4" />,
                className: 'bg-gray-100 text-gray-800',
                text: 'Cancelled'
            };
        default:
            return {
                icon: <AlertCircle className="w-4 h-4" />,
                className: 'bg-gray-100 text-gray-800',
                text: status || 'Pending'
            };
    }
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

// Function to fetch employee name
const fetchEmployeeName = async (employeeId: string): Promise<string> => {
    if (!employeeId) return 'Unknown';

    // Check cache first
    if (employeeNameCache.has(employeeId)) {
        return employeeNameCache.get(employeeId)!;
    }

    try {
        const employee = await empApi.getEmployeeById(employeeId);
        const name = employee?.empFullName || employee?.empFullNameAm || employeeId.slice(0, 8);
        employeeNameCache.set(employeeId, name);
        return name;
    } catch (error) {
        console.error(`Failed to fetch employee name for ${employeeId}:`, error);
        return employeeId.slice(0, 8);
    }
};

export const EncashmentHistory: React.FC<EncashmentHistoryProps> = ({ data, loading, isAdminOrManager = false }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [employeeFilter, setEmployeeFilter] = useState<string>('all');
    const [enrichedData, setEnrichedData] = useState<EncashmentRecord[]>([]);
    const [fetchingNames, setFetchingNames] = useState(false);

    // Fetch employee names for all records when data changes
    useEffect(() => {
        const enrichDataWithNames = async () => {
            if (!data || data.length === 0) {
                setEnrichedData([]);
                return;
            }

            setFetchingNames(true);
            try {
                const enriched = await Promise.all(
                    data.map(async (record) => {
                        if (!record.employeeName || record.employeeName === record.employeeId) {
                            const name = await fetchEmployeeName(record.employeeId);
                            return { ...record, employeeName: name };
                        }
                        return record;
                    })
                );
                setEnrichedData(enriched);
            } catch (error) {
                console.error('Error enriching data with names:', error);
                setEnrichedData(data);
            } finally {
                setFetchingNames(false);
            }
        };

        enrichDataWithNames();
    }, [data]);

    if (loading || fetchingNames) {
        return (
            <Card>
                <CardContent className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </CardContent>
            </Card>
        );
    }

    // Get unique employees for filter (only for admin/manager)
    const uniqueEmployees = isAdminOrManager && enrichedData.length > 0
        ? [...new Map(enrichedData.map(item => [item.employeeId, item.employeeName])).entries()]
            .map(([id, name]) => ({ id, name: name || id }))
        : [];

    // Apply filters
    let filteredData = [...enrichedData];

    if (statusFilter !== 'all') {
        filteredData = filteredData.filter(record =>
            record.status?.toLowerCase() === statusFilter.toLowerCase()
        );
    }

    if (isAdminOrManager && employeeFilter !== 'all') {
        filteredData = filteredData.filter(record => record.employeeId === employeeFilter);
    }

    // Calculate totals
    const totals = filteredData.reduce((acc, record) => {
        const days = record.encashmentDays || 0;
        const total = record.totalAmount || (days * (record.ratePerDay || 0));
        const tax = record.taxAmount || (total * 0.05);
        const net = record.netAmount || (total - tax);
        return {
            totalAmount: acc.totalAmount + total,
            taxAmount: acc.taxAmount + tax,
            netAmount: acc.netAmount + net,
            days: acc.days + days
        };
    }, { totalAmount: 0, taxAmount: 0, netAmount: 0, days: 0 });

    const statuses = ['all', ...new Set(enrichedData.map(r => r.status?.toLowerCase()).filter(Boolean))];

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <span>💰 Encashment History</span>
                        <span className="text-sm font-normal text-gray-500">
                            ({filteredData.length} records)
                        </span>
                        {isAdminOrManager && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                All Employees
                            </span>
                        )}
                    </CardTitle>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm border rounded-md px-2 py-1"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Employee Filter (Admin/Manager only) */}
                        {isAdminOrManager && uniqueEmployees.length > 0 && (
                            <select
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                                className="text-sm border rounded-md px-2 py-1"
                            >
                                <option value="all">All Employees</option>
                                {uniqueEmployees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name.length > 30 ? emp.name.substring(0, 30) + '...' : emp.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No encashment records found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {isAdminOrManager && <TableHead>Employee</TableHead>}
                                        <TableHead>Date</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Rate/Day</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Tax (5%)</TableHead>
                                        <TableHead>Net</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((record, index) => {
                                        const statusInfo = getStatusBadge(record.status);
                                        const requestDate = formatDate(record.requestDate || record.dateAdd || record.createdAt);
                                        const days = record.encashmentDays || 0;
                                        const rate = record.ratePerDay || 100;
                                        const total = record.totalAmount || (days * rate);
                                        const tax = record.taxAmount || (total * 0.05);
                                        const net = record.netAmount || (total - tax);

                                        return (
                                            <TableRow key={record.id || index}>
                                                {isAdminOrManager && (
                                                    <TableCell className="font-medium">
                                                        {record.employeeName || record.employeeId?.slice(0, 8)}
                                                    </TableCell>
                                                )}
                                                <TableCell>{requestDate}</TableCell>
                                                <TableCell>{record.leaveTypeName || 'Annual Leave'}</TableCell>
                                                <TableCell>{days} days</TableCell>
                                                <TableCell>${rate.toFixed(2)}</TableCell>
                                                <TableCell>${total.toFixed(2)}</TableCell>
                                                <TableCell>${tax.toFixed(2)}</TableCell>
                                                <TableCell>${net.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.text}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Summary Section */}
                        {filteredData.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Summary</p>
                                        <p className="text-sm text-gray-500">
                                            Showing {filteredData.length} records | Total Days: {totals.days}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Total: <span className="font-bold">${totals.totalAmount.toFixed(2)}</span></p>
                                        <p className="text-sm text-gray-600">Tax (5%): <span className="font-bold">${totals.taxAmount.toFixed(2)}</span></p>
                                        <p className="text-lg font-bold text-purple-600">Net: ${totals.netAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};