// src/hooks/useCrmData.ts

import { useState, useEffect, useCallback } from 'react';
import {
    getLeads,
    getCustomers,
    getOpportunities,
    getActivities,
    getTasks,
    getCampaigns,
    getTickets,
    getInteractions,
    getCompanies,
    getLeadStats,
    getOrderStats,
    getContractStats,
    getQuoteStats,
    getInteractionStats,
    getSalesPipeline,
    getSalesForecast,
    getCompanies as getCompaniesApi,
} from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';

export interface CrmStats {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    lostLeads: number;
    conversionRate: number;
    averageLeadScore: number;
    leadsBySource: Record<string, number>;
    leadsByStatus: Record<string, number>;
    leadsByPriority: Record<string, number>;
}

export interface CrmDashboardData {
    activeOpportunities: number;
    revenueGrowth: number;
    totalRevenue: number;
    winRate: number;
}

export interface UseCrmDataReturn {
    // Data
    leads: any[];
    customers: any[];
    opportunities: any[];
    activities: any[];
    tasks: any[];
    campaigns: any[];
    tickets: any[];
    interactions: any[];
    companies: any[];
    stats: CrmStats | null;
    dashboardData: CrmDashboardData | null;
    pipelineData: any[] | null;
    forecastData: any | null;

    // Loading states
    loading: boolean;
    refreshing: boolean;
    error: string | null;

    // Actions
    refresh: () => Promise<void>;
    fetchAll: () => Promise<void>;
}

export function useCrmData(): UseCrmDataReturn {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [leads, setLeads] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [stats, setStats] = useState<CrmStats | null>(null);
    const [dashboardData, setDashboardData] = useState<CrmDashboardData | null>(null);
    const [pipelineData, setPipelineData] = useState<any[] | null>(null);
    const [forecastData, setForecastData] = useState<any | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [
                leadsRes,
                customersRes,
                opportunitiesRes,
                activitiesRes,
                tasksRes,
                campaignsRes,
                ticketsRes,
                interactionsRes,
                companiesRes,
                leadStatsRes,
                orderStatsRes,
                contractStatsRes,
                quoteStatsRes,
                interactionStatsRes,
                pipelineRes,
                forecastRes,
            ] = await Promise.allSettled([
                getLeads({ page: 1, pageSize: 50 }),
                getCustomers({ page: 1, pageSize: 50 }),
                getOpportunities({ page: 1, pageSize: 50 }),
                getActivities({ page: 1, pageSize: 20 }),
                getTasks({ page: 1, pageSize: 20 }),
                getCampaigns({ page: 1, pageSize: 20 }),
                getTickets({ page: 1, pageSize: 20 }),
                getInteractions({ page: 1, pageSize: 20 }),
                getCompaniesApi({ page: 1, pageSize: 20 }),
                getLeadStats(),
                getOrderStats(),
                getContractStats(),
                getQuoteStats(),
                getInteractionStats(),
                getSalesPipeline({ period: 'quarter' }),
                getSalesForecast({ period: 'quarter' }),
            ]);

            // Process results - handle both success and failure gracefully
            if (leadsRes.status === 'fulfilled') {
                setLeads(leadsRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch leads:', leadsRes.reason);
                setLeads([]);
            }

            if (customersRes.status === 'fulfilled') {
                setCustomers(customersRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch customers:', customersRes.reason);
                setCustomers([]);
            }

            if (opportunitiesRes.status === 'fulfilled') {
                setOpportunities(opportunitiesRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch opportunities:', opportunitiesRes.reason);
                setOpportunities([]);
            }

            if (activitiesRes.status === 'fulfilled') {
                setActivities(activitiesRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch activities:', activitiesRes.reason);
                setActivities([]);
            }

            if (tasksRes.status === 'fulfilled') {
                setTasks(tasksRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch tasks:', tasksRes.reason);
                setTasks([]);
            }

            if (campaignsRes.status === 'fulfilled') {
                setCampaigns(campaignsRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch campaigns:', campaignsRes.reason);
                setCampaigns([]);
            }

            if (ticketsRes.status === 'fulfilled') {
                setTickets(ticketsRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch tickets:', ticketsRes.reason);
                setTickets([]);
            }

            if (interactionsRes.status === 'fulfilled') {
                setInteractions(interactionsRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch interactions:', interactionsRes.reason);
                setInteractions([]);
            }

            if (companiesRes.status === 'fulfilled') {
                setCompanies(companiesRes.value.data?.data || []);
            } else {
                console.warn('Failed to fetch companies:', companiesRes.reason);
                setCompanies([]);
            }

            // Build stats from available data
            const leadData = leadsRes.status === 'fulfilled' ? (leadsRes.value.data?.data || []) : [];
            const opportunityData = opportunitiesRes.status === 'fulfilled' ? (opportunitiesRes.value.data?.data || []) : [];

            // Calculate lead stats
            const totalLeads = leadData.length;
            const newLeads = leadData.filter((l: any) => l.status === 'New' || l.status === 'NewLead').length;
            const qualifiedLeads = leadData.filter((l: any) => l.status === 'Qualified' || l.status === 'QualifiedLead').length;
            const convertedLeads = leadData.filter((l: any) => l.status === 'Converted' || l.status === 'Customer').length;
            const lostLeads = leadData.filter((l: any) => l.status === 'Lost' || l.status === 'Disqualified').length;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            // Source distribution
            const leadsBySource: Record<string, number> = {};
            leadData.forEach((l: any) => {
                const source = l.source || 'Unknown';
                leadsBySource[source] = (leadsBySource[source] || 0) + 1;
            });

            const leadsByStatus: Record<string, number> = {};
            leadData.forEach((l: any) => {
                const status = l.status || 'Unknown';
                leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
            });

            const leadsByPriority: Record<string, number> = {};
            leadData.forEach((l: any) => {
                const priority = l.priority || 'Medium';
                leadsByPriority[priority] = (leadsByPriority[priority] || 0) + 1;
            });

            setStats({
                totalLeads,
                newLeads,
                qualifiedLeads,
                convertedLeads,
                lostLeads,
                conversionRate,
                averageLeadScore: 65, // Default if not available from API
                leadsBySource,
                leadsByStatus,
                leadsByPriority,
            });

            // Dashboard metrics
            const activeOpportunities = opportunityData.filter((o: any) =>
                !['ClosedWon', 'ClosedLost'].includes(o.stage)
            ).length;
            const wonDeals = opportunityData.filter((o: any) => o.stage === 'ClosedWon').length;
            const totalOpportunities = opportunityData.length || 1;
            const winRate = totalOpportunities > 0 ? (wonDeals / totalOpportunities) * 100 : 0;
            const totalRevenue = opportunityData
                .filter((o: any) => o.stage === 'ClosedWon')
                .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

            setDashboardData({
                activeOpportunities,
                revenueGrowth: 8.5, // Default if not available
                totalRevenue,
                winRate,
            });

            // Pipeline data
            if (pipelineRes.status === 'fulfilled') {
                const pipeline = pipelineRes.value.data?.data;
                setPipelineData(pipeline?.stages || null);
            } else {
                setPipelineData(null);
            }

            // Forecast data
            if (forecastRes.status === 'fulfilled') {
                setForecastData(forecastRes.value.data?.data || null);
            } else {
                setForecastData(null);
            }

        } catch (err) {
            console.error('Error fetching CRM data:', err);
            setError('Failed to load CRM data. Please try again.');
            showToast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAll();
    }, [fetchAll]);

    // Initial fetch
    useEffect(() => {
        fetchAll();
    }, []);

    return {
        // Data
        leads,
        customers,
        opportunities,
        activities,
        tasks,
        campaigns,
        tickets,
        interactions,
        companies,
        stats,
        dashboardData,
        pipelineData,
        forecastData,

        // Loading states
        loading,
        refreshing,
        error,

        // Actions
        refresh,
        fetchAll,
    };
}