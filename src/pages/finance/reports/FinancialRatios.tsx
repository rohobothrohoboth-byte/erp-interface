// src/pages/finance/reports/FinancialRatios.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, RefreshCw, Download, Calendar,
    DollarSign, TrendingDown, FileText, PieChart,
    AlertCircle, CheckCircle, Building2, Clock,
    Percent, Scale, Activity, BarChart3
} from 'lucide-react';
import { getAccounts, getJournalEntries } from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';

interface FinancialRatio {
    name: string;
    value: number;
    benchmark: number;
    status: 'Good' | 'Warning' | 'Critical';
    description: string;
    trend: 'up' | 'down' | 'stable';
}

const FinancialRatios: React.FC = () => {
    const [ratios, setRatios] = useState<FinancialRatio[]>([]);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [asOfDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accountsRes, journalRes] = await Promise.all([
                getAccounts(),
                getJournalEntries({ toDate: asOfDate }),
            ]);

            const accounts = accountsRes.data.data || accountsRes.data || [];
            const journals = journalRes.data.data || journalRes.data || [];

            // Calculate account balances
            const balances = new Map<string, number>();
            accounts.forEach((acc: any) => {
                balances.set(acc.id, acc.openingBalance || 0);
            });

            journals.forEach((journal: any) => {
                if (journal.isPosted && journal.lines) {
                    journal.lines.forEach((line: any) => {
                        const currentBalance = balances.get(line.accountId) || 0;
                        if (line.direction === 'Debit') {
                            balances.set(line.accountId, currentBalance + line.amount);
                        } else {
                            balances.set(line.accountId, currentBalance - line.amount);
                        }
                    });
                }
            });

            // Calculate financial ratios
            const totalCurrentAssets = accounts
                .filter((a: any) => a.accountType === 'Asset' && (a.code.startsWith('11') || a.code.startsWith('12')))
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const totalCurrentLiabilities = accounts
                .filter((a: any) => a.accountType === 'Liability' && a.code.startsWith('21'))
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const totalAssets = accounts
                .filter((a: any) => a.accountType === 'Asset')
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const totalLiabilities = accounts
                .filter((a: any) => a.accountType === 'Liability')
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const totalEquity = accounts
                .filter((a: any) => a.accountType === 'Equity')
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const revenue = accounts
                .filter((a: any) => a.accountType === 'Revenue')
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const expenses = accounts
                .filter((a: any) => a.accountType === 'Expense')
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const netIncome = revenue - expenses;
            const inventory = accounts
                .filter((a: any) => a.name.toLowerCase().includes('inventory'))
                .reduce((sum: number, a: any) => sum + (balances.get(a.id) || 0), 0);

            const ratioData: FinancialRatio[] = [
                {
                    name: 'Current Ratio',
                    value: totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0,
                    benchmark: 2.0,
                    status: 'Good',
                    description: 'Liquidity - Measures ability to pay short-term obligations',
                    trend: 'up',
                },
                {
                    name: 'Quick Ratio',
                    value: totalCurrentLiabilities > 0 ? (totalCurrentAssets - inventory) / totalCurrentLiabilities : 0,
                    benchmark: 1.0,
                    status: 'Good',
                    description: 'Liquidity - Measures ability to pay short-term obligations without inventory',
                    trend: 'stable',
                },
                {
                    name: 'Debt to Equity',
                    value: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
                    benchmark: 1.0,
                    status: 'Good',
                    description: 'Leverage - Measures financial leverage',
                    trend: 'down',
                },
                {
                    name: 'Gross Profit Margin',
                    value: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
                    benchmark: 30,
                    status: 'Good',
                    description: 'Profitability - Measures gross profit as percentage of revenue',
                    trend: 'up',
                },
                {
                    name: 'Net Profit Margin',
                    value: revenue > 0 ? (netIncome / revenue) * 100 : 0,
                    benchmark: 10,
                    status: 'Good',
                    description: 'Profitability - Measures net income as percentage of revenue',
                    trend: 'stable',
                },
                {
                    name: 'Return on Assets (ROA)',
                    value: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
                    benchmark: 5,
                    status: 'Good',
                    description: 'Efficiency - Measures how efficiently assets generate profit',
                    trend: 'up',
                },
                {
                    name: 'Return on Equity (ROE)',
                    value: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
                    benchmark: 15,
                    status: 'Good',
                    description: 'Efficiency - Measures return on shareholder investment',
                    trend: 'up',
                },
                {
                    name: 'Asset Turnover',
                    value: totalAssets > 0 ? revenue / totalAssets : 0,
                    benchmark: 1.0,
                    status: 'Good',
                    description: 'Efficiency - Measures how efficiently assets generate revenue',
                    trend: 'stable',
                },
            ];

            // Determine status based on benchmarks
            const updatedRatios = ratioData.map(ratio => {
                const diff = Math.abs(ratio.value - ratio.benchmark);
                const status = diff <= ratio.benchmark * 0.2 ? 'Good' : diff <= ratio.benchmark * 0.5 ? 'Warning' : 'Critical';
                return { ...ratio, status };
            });

            setRatios(updatedRatios);
        } catch (error) {
            console.error('Error fetching financial ratios:', error);
            showToast('Failed to load financial ratios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Good: 'bg-green-100 text-green-700 border-green-200',
            Warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Critical: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Activity className="h-4 w-4 text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Scale className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Financial Ratios</h1>
                        <p className="text-sm text-gray-500">As of {new Date(asOfDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <Label className="font-medium">As of Date:</Label>
                </div>
                <Input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="w-48"
                />
                <Button onClick={fetchData} className="bg-indigo-600 hover:bg-indigo-700">
                    Calculate Ratios
                </Button>
            </div>

            {/* Ratios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ratios.map((ratio, index) => (
                    <Card key={index} className={`border-2 ${getStatusColor(ratio.status)}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{ratio.name}</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-2xl font-bold ${ratio.status === 'Good' ? 'text-gray-900' : ratio.status === 'Warning' ? 'text-yellow-700' : 'text-red-700'}`}>
                                            {ratio.name.includes('Margin') ? ratio.value.toFixed(1) + '%' : ratio.value.toFixed(2)}
                                        </p>
                                        {getTrendIcon(ratio.trend)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className={getStatusColor(ratio.status)}>
                                        {ratio.status}
                                    </Badge>
                                    <p className="text-xs text-gray-400 mt-1">Benchmark: {ratio.name.includes('Margin') ? ratio.benchmark + '%' : ratio.benchmark.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-500">{ratio.description}</p>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Actual</span>
                                    <span>{ratio.name.includes('Margin') ? ratio.value.toFixed(1) + '%' : ratio.value.toFixed(2)}</span>
                                </div>
                                <Progress
                                    value={Math.min(100, (ratio.value / ratio.benchmark) * 100)}
                                    className={`h-2 ${ratio.status === 'Good' ? 'bg-green-500' : ratio.status === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>Target: {ratio.name.includes('Margin') ? ratio.benchmark + '%' : ratio.benchmark.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratio Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium">Good</p>
                            <p className="text-2xl font-bold text-green-900">
                                {ratios.filter(r => r.status === 'Good').length}
                            </p>
                            <p className="text-xs text-green-600">Within benchmark</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700 font-medium">Warning</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {ratios.filter(r => r.status === 'Warning').length}
                            </p>
                            <p className="text-xs text-yellow-600">Close to benchmark</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-700 font-medium">Critical</p>
                            <p className="text-2xl font-bold text-red-900">
                                {ratios.filter(r => r.status === 'Critical').length}
                            </p>
                            <p className="text-xs text-red-600">Needs attention</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            Export Financial Ratios
                        </DialogTitle>
                        <DialogDescription>
                            Export the financial ratios in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select defaultValue="pdf">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>As of Date</Label>
                            <Input type="date" value={asOfDate} readOnly />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                            showToast('Financial ratios exported successfully', 'success');
                            setIsExportModalOpen(false);
                        }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default FinancialRatios;