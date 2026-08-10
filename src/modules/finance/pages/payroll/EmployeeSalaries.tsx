// src/pages/finance/payroll/EmployeeSalaries.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    DollarSign,
    Search,
    Filter,
    Edit,
    Eye,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Loader2,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import useToast from '@/shared/hooks/useToast';
import { payrollApi } from '@/modules/finance/services/payroll/payrollApi';

interface EmployeeSalary {
    id: string;
    employeeId: string;
    name: string;
    department: string;
    position: string;
    baseSalary: number;
    bonus: number;
    commission: number;
    totalCompensation: number;
    lastModified: string;
    status: 'active' | 'inactive';
}

const EmployeeSalaries: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
    const [filteredSalaries, setFilteredSalaries] = useState<EmployeeSalary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    useEffect(() => {
        loadSalaries();
    }, []);

    const loadSalaries = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getEmployeeSalaries();
            setSalaries(data || []);
            setFilteredSalaries(data || []);
        } catch (error) {
            console.error('Error loading employee salaries:', error);
            toast.error('Failed to load employee salaries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterDepartment, salaries]);

    const applyFilters = () => {
        let filtered = salaries;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(search) ||
                s.employeeId.toLowerCase().includes(search) ||
                s.department.toLowerCase().includes(search)
            );
        }

        if (filterDepartment !== 'All') {
            filtered = filtered.filter(s => s.department === filterDepartment);
        }

        setFilteredSalaries(filtered);
        setCurrentPage(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getSalaryTrend = (salary: EmployeeSalary) => {
        // Compare with average
        const average = salaries.reduce((sum, s) => sum + s.totalCompensation, 0) / salaries.length;
        const diff = salary.totalCompensation - average;
        const percentage = (diff / average) * 100;

        if (percentage > 10) return { icon: TrendingUp, color: 'text-green-600', label: 'Above Average' };
        if (percentage < -10) return { icon: TrendingDown, color: 'text-red-600', label: 'Below Average' };
        return { icon: TrendingUp, color: 'text-blue-600', label: 'Average' };
    };

    // Pagination
    const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredSalaries.slice(startIndex, endIndex);

    // Get unique departments
    const departments = ['All', ...new Set(salaries.map(s => s.department).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading employee salaries...</span>
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
                        <Users className="h-8 w-8 text-indigo-600" />
                        Employee <span className="text-indigo-600">Salaries</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage employee compensation and salaries</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Salary
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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

            {/* Salary List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Salary Records</CardTitle>
                        <span className="text-sm text-gray-500">{filteredSalaries.length} employees</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No salary records found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((salary) => {
                                const Trend = getSalaryTrend(salary).icon;
                                return (
                                    <div
                                        key={salary.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                                        <Users className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{salary.name}</h3>
                                                        <p className="text-sm text-gray-500">{salary.employeeId} • {salary.department}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total Compensation</p>
                                                    <p className="font-bold text-indigo-600">{formatCurrency(salary.totalCompensation)}</p>
                                                </div>
                                                <div className={`flex items-center gap-1 ${getSalaryTrend(salary).color}`}>
                                                    <Trend className="h-4 w-4" />
                                                    <span className="text-xs">{getSalaryTrend(salary).label}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                            <div>
                                                <p className="text-xs text-gray-500">Base Salary</p>
                                                <p className="font-medium">{formatCurrency(salary.baseSalary)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Bonus</p>
                                                <p className="font-medium text-green-600">{formatCurrency(salary.bonus)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Commission</p>
                                                <p className="font-medium text-blue-600">{formatCurrency(salary.commission)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Status</p>
                                                <Badge variant={salary.status === 'active' ? 'default' : 'outline'}>
                                                    {salary.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                            >
                                                <Edit className="h-3 w-3" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredSalaries.length)} of {filteredSalaries.length}
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
        </motion.div>
    );
};

export default EmployeeSalaries;