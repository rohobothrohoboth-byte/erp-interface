// src/pages/finance/payroll/TaxConfigurations.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    DollarSign,
    Percent,
    Calendar,
    Users,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle
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

interface TaxBracket {
    id: string;
    name: string;
    type: 'federal' | 'state' | 'local';
    rate: number;
    minIncome: number;
    maxIncome: number;
    isActive: boolean;
    year: number;
}

interface TaxConfig {
    id: string;
    name: string;
    description: string;
    brackets: TaxBracket[];
    isActive: boolean;
    year: number;
}

const TaxConfigurations: React.FC = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState<TaxConfig[]>([]);
    const [activeTab, setActiveTab] = useState('federal');

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.getTaxConfigs();
            setConfigs(data || []);
        } catch (error) {
            console.error('Error loading tax configurations:', error);
            toast.error('Failed to load tax configurations');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'federal':
                return 'bg-blue-100 text-blue-700';
            case 'state':
                return 'bg-purple-100 text-purple-700';
            case 'local':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading tax configurations...</span>
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
                        <Shield className="h-8 w-8 text-indigo-600" />
                        Tax <span className="text-indigo-600">Configurations</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage tax brackets and rates</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Tax Bracket
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadConfigs}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="federal">Federal Tax</TabsTrigger>
                    <TabsTrigger value="state">State Tax</TabsTrigger>
                    <TabsTrigger value="local">Local Tax</TabsTrigger>
                </TabsList>

                <TabsContent value="federal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Federal Tax Brackets</CardTitle>
                            <CardDescription>Current federal tax rates for {new Date().getFullYear()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Bracket</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Min Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Max Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rate</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {configs
                                        .filter(c => c.brackets.some(b => b.type === 'federal'))
                                        .flatMap(c => c.brackets.filter(b => b.type === 'federal'))
                                        .map((bracket, index) => (
                                            <tr key={bracket.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{bracket.name}</td>
                                                <td className="px-4 py-3">{formatCurrency(bracket.minIncome)}</td>
                                                <td className="px-4 py-3">{bracket.maxIncome ? formatCurrency(bracket.maxIncome) : '∞'}</td>
                                                <td className="px-4 py-3 font-medium text-indigo-600">{bracket.rate}%</td>
                                                <td className="px-4 py-3">
                                                    {bracket.isActive ? (
                                                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="text-indigo-600">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="state">
                    <Card>
                        <CardHeader>
                            <CardTitle>State Tax Brackets</CardTitle>
                            <CardDescription>Current state tax rates for {new Date().getFullYear()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Bracket</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Min Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Max Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rate</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {configs
                                        .filter(c => c.brackets.some(b => b.type === 'state'))
                                        .flatMap(c => c.brackets.filter(b => b.type === 'state'))
                                        .map((bracket) => (
                                            <tr key={bracket.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{bracket.name}</td>
                                                <td className="px-4 py-3">{formatCurrency(bracket.minIncome)}</td>
                                                <td className="px-4 py-3">{bracket.maxIncome ? formatCurrency(bracket.maxIncome) : '∞'}</td>
                                                <td className="px-4 py-3 font-medium text-purple-600">{bracket.rate}%</td>
                                                <td className="px-4 py-3">
                                                    {bracket.isActive ? (
                                                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="text-purple-600">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="local">
                    <Card>
                        <CardHeader>
                            <CardTitle>Local Tax Brackets</CardTitle>
                            <CardDescription>Current local tax rates for {new Date().getFullYear()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Bracket</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Min Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Max Income</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rate</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {configs
                                        .filter(c => c.brackets.some(b => b.type === 'local'))
                                        .flatMap(c => c.brackets.filter(b => b.type === 'local'))
                                        .map((bracket) => (
                                            <tr key={bracket.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{bracket.name}</td>
                                                <td className="px-4 py-3">{formatCurrency(bracket.minIncome)}</td>
                                                <td className="px-4 py-3">{bracket.maxIncome ? formatCurrency(bracket.maxIncome) : '∞'}</td>
                                                <td className="px-4 py-3 font-medium text-green-600">{bracket.rate}%</td>
                                                <td className="px-4 py-3">
                                                    {bracket.isActive ? (
                                                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="text-green-600">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default TaxConfigurations;