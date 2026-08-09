// src/pages/crm/salesManagement/SalesForecastPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    Calendar,
    RefreshCw,
    Download,
    PieChart,
    BarChart3,
    Target,
    Users,
    Clock,
} from 'lucide-react';
import { getSalesForecast } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { SalesHeader } from '../../../components/crm/salesManagement/components/SalesHeader';
import { SalesStats, type SalesStatItem } from '../../../components/crm/salesManagement/components/SalesStats';
import SalesForecasting, { type ForecastData } from '../../../components/crm/salesManagement/components/SalesForecasting';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import type { SalesForecastData } from '../../../types/crm/crm.types';

const SalesForecastPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [period, setPeriod] = useState('quarter');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchForecast();
    }, [period]);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            const response = await getSalesForecast({ period });

            // Extract data from API response
            const data = response.data || response;

            // Transform data to match ForecastData interface if needed
            const forecastData: ForecastData = {
                totalForecast: data.totalForecast || 0,
                conversionRate: data.conversionRate || 0,
                averageDealSize: data.averageDealSize || 0,
                pipelineVelocity: data.pipelineVelocity || 0,
                byStage: data.byStage || [],
                monthlyTrend: data.monthlyTrend || [],
                byRep: data.byRep || [],
            };

            setForecast(forecastData);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            showToast.error('Failed to load forecast data');
            setForecast(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            // In a real app, this would generate and download a report
            showToast.success('Forecast exported successfully');
        } catch (error) {
            showToast.error('Failed to export forecast');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 rounded-xl lg:col-span-2" />
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!forecast || forecast.byStage.length === 0) {
        return (
            <div className="p-6 text-center">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">No forecast data available</h2>
                <p className="text-gray-500 mt-1">Create opportunities to start forecasting.</p>
                <Button
                    className="mt-4"
                    onClick={fetchForecast}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>
        );
    }

    // Stats for the header
    const stats: SalesStatItem[] = [
        {
            label: 'Total Forecast',
            value: formatCurrency(forecast.totalForecast),
            icon: <DollarSign className="h-5 w-5 text-blue-600" />,
            color: 'blue',
            gradient: 'from-blue-50 to-blue-100',
        },
        {
            label: 'Conversion Rate',
            value: `${forecast.conversionRate}%`,
            icon: <Target className="h-5 w-5 text-green-600" />,
            color: 'green',
            gradient: 'from-green-50 to-green-100',
        },
        {
            label: 'Avg. Deal Size',
            value: formatCurrency(forecast.averageDealSize),
            icon: <PieChart className="h-5 w-5 text-purple-600" />,
            color: 'purple',
            gradient: 'from-purple-50 to-purple-100',
        },
        {
            label: 'Pipeline Velocity',
            value: `${forecast.pipelineVelocity} days`,
            icon: <Clock className="h-5 w-5 text-orange-600" />,
            color: 'orange',
            gradient: 'from-orange-50 to-orange-100',
        },
    ];

    // Actions for the header
    const actions = (
        <>
            <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-36">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
            </Select>
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={fetchForecast}
            >
                <RefreshCw className="h-4 w-4" />
                Refresh
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleExport}
                disabled={exporting}
            >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export'}
            </Button>
        </>
    );

    // Rep performance data
    const repStats = forecast.byRep || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            <SalesHeader
                title="Sales Forecast"
                subtitle="Predict future sales and track pipeline performance"
                icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
                actions={actions}
            />

            <SalesStats stats={stats} />

            <SalesForecasting data={forecast} />

            {/* Rep Performance */}
            {repStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Sales Rep Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rep</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Deals</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Target</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Achievement</th>
                                </tr>
                                </thead>
                                <tbody>
                                {repStats.map((rep, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{rep.repName}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(rep.revenue)}</td>
                                        <td className="text-right py-3 px-4">{rep.deals}</td>
                                        <td className="text-right py-3 px-4">{formatCurrency(rep.target)}</td>
                                        <td className="text-right py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            rep.achievement >= 90 ? 'bg-green-500' :
                                                                rep.achievement >= 70 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                        style={{ width: `${Math.min(rep.achievement, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-medium ${
                                                    rep.achievement >= 90 ? 'text-green-600' :
                                                        rep.achievement >= 70 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                }`}>
                                                        {rep.achievement}%
                                                    </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default SalesForecastPage;