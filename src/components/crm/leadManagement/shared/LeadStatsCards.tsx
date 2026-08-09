// src/components/crm/leadManagement/shared/LeadStatsCards.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Phone,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    Star,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import type { LeadDto } from '../../../../types/crm/crm.types';

interface LeadStatsCardsProps {
    leads: LeadDto[];
    loading?: boolean;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </CardContent>
    </Card>
);

// ✅ Correct status mapping based on backend enum
const STATUS_MAP: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Proposal',
    5: 'Negotiation',
    6: 'Converted',
    7: 'Lost',
    8: 'Archived',
};

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status) return 'New';
    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && num in STATUS_MAP) return STATUS_MAP[num];
        return status;
    }
    if (typeof status === 'number') {
        return STATUS_MAP[status] || 'New';
    }
    return String(status);
};

// ✅ Helper: Check if lead is truly converted
const isTrulyConverted = (lead: LeadDto): boolean => {
    const status = getStatusString(lead.status);
    return status === 'Converted' && lead.isConverted === true;
};

const LeadStatsCards: React.FC<LeadStatsCardsProps> = ({ leads, loading = false }) => {
    // ✅ Calculate stats using the correct status mapping
    const total = leads.length;

    const newLeads = leads.filter(l => {
        const status = getStatusString(l.status);
        return status === 'New' && !isTrulyConverted(l);
    }).length;

    const contacted = leads.filter(l => {
        const status = getStatusString(l.status);
        return status === 'Contacted' && !isTrulyConverted(l);
    }).length;

    const qualified = leads.filter(l => {
        const status = getStatusString(l.status);
        return status === 'Qualified' && !isTrulyConverted(l);
    }).length;

    const converted = leads.filter(l => isTrulyConverted(l)).length;

    const unqualified = leads.filter(l => {
        const status = getStatusString(l.status);
        return status === 'Lost';
    }).length;

    // ✅ Calculate average score
    const avgScore = leads.length > 0
        ? Math.round(leads.reduce((acc, l) => acc + (l.score || 0), 0) / leads.length)
        : 0;

    // ✅ Calculate conversion rate
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Leads',
            value: total,
            icon: <Users className="h-4 w-4 text-white" />,
            color: 'bg-blue-500',
            subtitle: `${newLeads} new`
        },
        {
            title: 'New',
            value: newLeads,
            icon: <UserPlus className="h-4 w-4 text-white" />,
            color: 'bg-indigo-500',
            subtitle: 'Awaiting contact'
        },
        {
            title: 'Contacted',
            value: contacted,
            icon: <Phone className="h-4 w-4 text-white" />,
            color: 'bg-yellow-500',
            subtitle: 'In progress'
        },
        {
            title: 'Qualified',
            value: qualified,
            icon: <CheckCircle className="h-4 w-4 text-white" />,
            color: 'bg-green-500',
            subtitle: 'Ready for sales'
        },
        {
            title: 'Converted',
            value: converted,
            icon: <TrendingUp className="h-4 w-4 text-white" />,
            color: 'bg-purple-500',
            subtitle: `${conversionRate}% conversion`
        },
        {
            title: 'Avg Score',
            value: avgScore,
            icon: <Star className="h-4 w-4 text-white" />,
            color: 'bg-orange-500',
            subtitle: `${qualified} qualified`
        }
    ];

    return (
        <motion.div
            className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <StatCard {...stat} />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default LeadStatsCards;