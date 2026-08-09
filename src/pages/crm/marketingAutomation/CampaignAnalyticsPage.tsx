// src/pages/crm/marketingAutomation/CampaignAnalyticsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, Users, Target, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { showToast } from '../../../layout/layout';
import { getCampaignAnalytics, getCampaignById } from '../../../services/crm/crm.api';
import type { Campaign } from '../../../types/crm/marketing.types';

interface AnalyticsData {
    totalReach: number;
    totalEngagement: number;
    totalConversions: number;
    conversionRate: number;
    engagementRate: number;
    roi: number;
    costPerLead: number;
    costPerConversion: number;
    dailyStats: Array<{
        date: string;
        reach: number;
        engagement: number;
        conversions: number;
    }>;
}

const CampaignAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [campaignRes, analyticsRes] = await Promise.all([
                    getCampaignById(id),
                    getCampaignAnalytics(id),
                ]);

                const campaignData = campaignRes.data?.data || campaignRes.data;
                setCampaign(campaignData);

                const analyticsData = analyticsRes.data?.data || analyticsRes.data;
                setAnalytics(analyticsData);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                showToast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!campaign || !analytics) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl mx-auto"
        >
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(`/crm/campaigns/${id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
                    <p className="text-sm text-gray-500">{campaign.name}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Reach</p>
                                <p className="text-2xl font-bold">{analytics.totalReach.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Engagement Rate</p>
                                <p className="text-2xl font-bold text-green-600">{analytics.engagementRate}%</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Conversion Rate</p>
                                <p className="text-2xl font-bold text-purple-600">{analytics.conversionRate}%</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">ROI</p>
                                <p className="text-2xl font-bold text-orange-600">{analytics.roi}%</p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Performance Chart */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Daily Performance</h3>
                    <div className="space-y-4">
                        {analytics.dailyStats.map((stat, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{formatDate(stat.date)}</span>
                                    <div className="flex gap-4">
                                        <span className="text-blue-600">Reach: {stat.reach}</span>
                                        <span className="text-green-600">Engagement: {stat.engagement}</span>
                                        <span className="text-purple-600">Conversions: {stat.conversions}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 h-6">
                                    <div
                                        className="bg-blue-500 rounded"
                                        style={{ width: `${(stat.reach / analytics.totalReach) * 100}%` }}
                                    />
                                    <div
                                        className="bg-green-500 rounded"
                                        style={{ width: `${(stat.engagement / analytics.totalEngagement) * 100}%` }}
                                    />
                                    <div
                                        className="bg-purple-500 rounded"
                                        style={{ width: `${(stat.conversions / analytics.totalConversions) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            <span>Reach</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded" />
                            <span>Engagement</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded" />
                            <span>Conversions</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Cost Per Lead</p>
                        <p className="text-2xl font-bold">${analytics.costPerLead.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Cost Per Conversion</p>
                        <p className="text-2xl font-bold">${analytics.costPerConversion.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Conversions</p>
                        <p className="text-2xl font-bold">{analytics.totalConversions.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default CampaignAnalyticsPage;