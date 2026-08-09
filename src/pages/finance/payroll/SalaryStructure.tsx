// src/pages/finance/payroll/SalaryStructure.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Database,
    Plus,
    Edit,
    Trash2,
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import useToast from '../../../hooks/useToast';
import { payrollApi } from '../../../services/finance/payroll/payrollApi';

interface SalaryStructure {
    id: string;
    name: string;
    grade: string;
    minSalary: number;
    maxSalary: number;
    midSalary: number;
    description: string;
    isActive: boolean;
    allowances: {
        housing: number;
        transport: number;
        meal: number;
        medical: number;
    };
    deductions: {
        tax: number;
        pension: number;
        insurance: number;
    };
    createdAt: string;
    updatedAt: string;
}

const SalaryStructure: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [structures, setStructures] = useState<SalaryStructure[]>([]);
    const [filteredStructures, setFilteredStructures] = useState<SalaryStructure[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

    useEffect(() => {
        loadStructures();
    }, []);

    const loadStructures = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getSalaryStructures();
            setStructures(data || []);
            setFilteredStructures(data || []);
        } catch (error) {
            console.error('Error loading salary structures:', error);
            toast.error('Failed to load salary structures');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, structures]);

    const applyFilters = () => {
        let filtered = structures;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(search) ||
                s.grade.toLowerCase().includes(search) ||
                s.description.toLowerCase().includes(search)
            );
        }

        setFilteredStructures(filtered);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this salary structure?')) return;

        try {
            await payrollApi.deleteSalaryStructure(id);
            toast.success('Salary structure deleted successfully');
            loadStructures();
        } catch (error) {
            console.error('Error deleting salary structure:', error);
            toast.error('Failed to delete salary structure');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading salary structures...</span>
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
                        <Database className="h-8 w-8 text-indigo-600" />
                        Salary <span className="text-indigo-600">Structure</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage salary grades and compensation structures</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Structure
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadStructures}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by name, grade, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Structures List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStructures.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No salary structures found</p>
                    </div>
                ) : (
                    filteredStructures.map((structure) => (
                        <Card key={structure.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {structure.name}
                                            {structure.isActive ? (
                                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{structure.grade}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingStructure(structure)}
                                            className="text-indigo-600 hover:text-indigo-700"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(structure.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Min</p>
                                        <p className="font-medium text-gray-900">{formatCurrency(structure.minSalary)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Mid</p>
                                        <p className="font-medium text-blue-600">{formatCurrency(structure.midSalary)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Max</p>
                                        <p className="font-medium text-indigo-600">{formatCurrency(structure.maxSalary)}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <p className="text-xs text-gray-500 mb-2">Allowances</p>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        <span>Housing: <span className="font-medium">{formatCurrency(structure.allowances.housing)}</span></span>
                                        <span>Transport: <span className="font-medium">{formatCurrency(structure.allowances.transport)}</span></span>
                                        <span>Meal: <span className="font-medium">{formatCurrency(structure.allowances.meal)}</span></span>
                                        <span>Medical: <span className="font-medium">{formatCurrency(structure.allowances.medical)}</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default SalaryStructure;