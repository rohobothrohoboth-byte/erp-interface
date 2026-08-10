// src/pages/finance/payroll/PayrollHistory.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    History,
    FileText,
    Download,
    Search,
    Filter,
    Eye,
    Calendar,
    DollarSign,
    Users,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import useToast from '@/shared/hooks/useToast';
import { payrollApi } from '@/modules/finance/services/payroll/payrollApi';

interface PayrollHistoryItem {
    id: string;
    name: string;
    period: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: 'completed' | 'approved' | 'cancelled';
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    processedBy: string;
    processedAt: string;
    approvedBy?: string;
    approvedAt?: string;
}

const PayrollHistory: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<PayrollHistoryItem[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<PayrollHistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<PayrollHistoryItem | null>(null);

    const itemsPerPage = 10;

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getPayrollHistory();
            setHistory(data || []);
            setFilteredHistory(data || []);
        } catch (error) {
            console.error('Error loading payroll history:', error);
            toast.error('Failed to load payroll history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, history]);

    const applyFilters = () => {
        let filtered = history;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(search) ||
                item.period.toLowerCase().includes(search) ||
                item.processedBy.toLowerCase().includes(search)
            );
        }

        if (filterStatus !== 'All') {
            filtered = filtered.filter(item => item.status === filterStatus);
        }

        setFilteredHistory(filtered);
        setCurrentPage(1);
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
            case 'approved':
                return <Badge className="bg-purple-100 text-purple-700">Approved</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredHistory.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading payroll history...</span>
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
                        <History className="h-8 w-8 text-indigo-600" />
                        Payroll <span className="text-indigo-600">History</span>
                    </h1>
                    <p className="text-gray-500 mt-1">View all payroll runs and their details</p>
                </div>
                <Button
                    onClick={loadHistory}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name or period..."
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
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={applyFilters}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Payroll Runs</CardTitle>
                        <span className="text-sm text-gray-500">{filteredHistory.length} records</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentItems.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No payroll history found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {item.period} • {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Total Net Pay</p>
                                                <p className="font-bold text-indigo-600">{formatCurrency(item.totalNet)}</p>
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">{item.totalEmployees} employees</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">Paid: {formatDate(item.payDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">Gross: {formatCurrency(item.totalGross)}</span>
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
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length}
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

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Payroll Run Details</h2>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <XCircle className="h-6 w-6 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    {getStatusBadge(selectedItem.status)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedItem.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pay Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.payDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Employees</p>
                                    <p className="font-medium">{selectedItem.totalEmployees}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Gross Pay</p>
                                    <p className="font-medium text-indigo-600">{formatCurrency(selectedItem.totalGross)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Net Pay</p>
                                    <p className="font-bold text-green-600">{formatCurrency(selectedItem.totalNet)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Processed By</p>
                                    <p className="font-medium">{selectedItem.processedBy}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Report
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

export default PayrollHistory;