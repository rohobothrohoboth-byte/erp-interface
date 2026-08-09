// src/pages/finance/payroll/PayslipHistory.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Search,
    Filter,
    Eye,
    Printer,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Calendar,
    User,
    Building2,
    Loader2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { payrollApi } from '../../../services/finance/payroll/payrollApi';

interface Payslip {
    id: string;
    payslipNumber: string;
    employeeName: string;
    employeeCode: string;
    department: string;
    periodStart: string;
    periodEnd: string;
    paymentDate: string;
    grossPay: number;
    netPay: number;
    status: 'generated' | 'sent' | 'paid';
}

const PayslipHistory: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        loadPayslips();
    }, []);

    const loadPayslips = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getPayslips();
            // Ensure data is an array
            const payslipData = Array.isArray(data) ? data : [];
            setPayslips(payslipData);
            setFilteredPayslips(payslipData);
        } catch (error) {
            console.error('Error loading payslips:', error);
            toast.error('Failed to load payslip history');
            setPayslips([]);
            setFilteredPayslips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, filterDepartment, payslips]);

    const applyFilters = () => {
        // Ensure payslips is an array before filtering
        let filtered = Array.isArray(payslips) ? payslips : [];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.employeeName.toLowerCase().includes(search) ||
                p.payslipNumber.toLowerCase().includes(search) ||
                p.employeeCode.toLowerCase().includes(search)
            );
        }

        if (filterStatus !== 'All') {
            filtered = filtered.filter(p => p.status === filterStatus);
        }

        if (filterDepartment !== 'All') {
            filtered = filtered.filter(p => p.department === filterDepartment);
        }

        setFilteredPayslips(filtered);
        setCurrentPage(1);
    };

    const handleDownload = async (id: string) => {
        try {
            const blob = await payrollApi.downloadPayslip(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Payslip downloaded successfully');
        } catch (error) {
            console.error('Error downloading payslip:', error);
            toast.error('Failed to download payslip');
        }
    };

    const handleView = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'generated':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700">Generated</Badge>;
            case 'sent':
                return <Badge variant="outline" className="bg-green-50 text-green-700">Sent</Badge>;
            case 'paid':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700">Paid</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Ensure filteredPayslips is an array before calculating pagination
    const payslipArray = Array.isArray(filteredPayslips) ? filteredPayslips : [];

    // Pagination
    const totalPages = Math.ceil(payslipArray.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = payslipArray.slice(startIndex, endIndex);

    // Get unique departments
    const departments = ['All', ...new Set(payslipArray.map(p => p.department).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading payslip history...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        Payslip <span className="text-indigo-600">History</span>
                    </h1>
                    <p className="text-gray-500 mt-1">View and download employee payslips</p>
                </div>
                <Button
                    onClick={loadPayslips}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="generated">Generated</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={applyFilters}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payslip List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Payslips</CardTitle>
                        <span className="text-sm text-gray-500">{payslipArray.length} records</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {payslipArray.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No payslips found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((payslip) => (
                                <div
                                    key={payslip.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleView(payslip)}
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{payslip.employeeName}</h3>
                                                    <p className="text-sm text-gray-500">{payslip.employeeCode} • {payslip.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Net Pay</p>
                                                <p className="font-bold text-indigo-600">{formatCurrency(payslip.netPay)}</p>
                                            </div>
                                            {getStatusBadge(payslip.status)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">{formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">Gross: {formatCurrency(payslip.grossPay)}</span>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); handleView(payslip); }}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); handleDownload(payslip.id); }}
                                                className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                            >
                                                <Download className="h-3 w-3" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, payslipArray.length)} of {payslipArray.length}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="px-3 py-1 text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payslip Detail Modal */}
            {selectedPayslip && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Payslip Details</h2>
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <XCircle className="h-6 w-6 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Payslip content */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Employee</p>
                                    <p className="font-medium">{selectedPayslip.employeeName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Employee Code</p>
                                    <p className="font-medium">{selectedPayslip.employeeCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{selectedPayslip.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payslip Number</p>
                                    <p className="font-medium">{selectedPayslip.payslipNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{formatDate(selectedPayslip.periodStart)} - {formatDate(selectedPayslip.periodEnd)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="font-medium">{formatDate(selectedPayslip.paymentDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gross Pay</p>
                                    <p className="font-bold text-gray-900">{formatCurrency(selectedPayslip.grossPay)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Pay</p>
                                    <p className="font-bold text-indigo-600">{formatCurrency(selectedPayslip.netPay)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Status</p>
                                    {getStatusBadge(selectedPayslip.status)}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    onClick={() => handleDownload(selectedPayslip.id)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default PayslipHistory;