// src/pages/crm/leadManagement/LeadGroupingPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import LeadGroupingHeader from '../../../components/crm/leadManagement/leadGrouping/LeadGroupingHeader';
import LeadGroupingSearchFilter from '../../../components/crm/leadManagement/leadGrouping/LeadGroupingSearchFilter';
import LeadGroupingSection from '../../../components/crm/leadManagement/leadGrouping/LeadGroupingSection';
import LeadStatsCards from '../../../components/crm/leadManagement/shared/LeadStatsCards';
import type { LeadDto } from '../../../types/crm/crm.types';

const LeadGroupingPage: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('status');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await getLeads({ page: 1, pageSize: 200 });
            let data = response.data?.data || response.data || [];
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const groupLeads = (): Array<{ key: string; count: number; leads: LeadDto[] }> => {
        const groups: Record<string, LeadDto[]> = {};

        leads.forEach(lead => {
            let key = '';
            switch (groupBy) {
                case 'status':
                    key = lead.status || 'Unknown';
                    break;
                case 'priority':
                    key = lead.priority || 'Unknown';
                    break;
                case 'source':
                    key = lead.source || 'Unknown';
                    break;
                case 'industry':
                    key = lead.industry || 'Unknown';
                    break;
                case 'assigned':
                    key = lead.assignedToUserName || 'Unassigned';
                    break;
                default:
                    key = 'All';
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(lead);
        });

        return Object.entries(groups)
            .map(([key, leads]) => ({ key, count: leads.length, leads }))
            .sort((a, b) => b.count - a.count);
    };

    const getGroupColor = (key: string): string => {
        const colors: Record<string, Record<string, string>> = {
            status: {
                New: 'bg-blue-100 text-blue-700 border-blue-200',
                Contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                Qualified: 'bg-green-100 text-green-700 border-green-200',
                Proposal: 'bg-purple-100 text-purple-700 border-purple-200',
                Negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
                Converted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                Lost: 'bg-red-100 text-red-700 border-red-200',
            },
            priority: {
                Low: 'bg-gray-100 text-gray-700 border-gray-200',
                Medium: 'bg-blue-100 text-blue-700 border-blue-200',
                High: 'bg-orange-100 text-orange-700 border-orange-200',
                Urgent: 'bg-red-100 text-red-700 border-red-200',
            }
        };
        return colors[groupBy]?.[key] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const groupedLeads = groupLeads();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <LeadGroupingHeader onRefresh={fetchLeads} loading={loading} />

            <LeadStatsCards leads={leads} loading={loading} />

            <LeadGroupingSearchFilter
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                onExpandAll={() => setExpandedGroups(new Set(groupedLeads.map(g => g.key)))}
                onCollapseAll={() => setExpandedGroups(new Set())}
            />

            <LeadGroupingSection
                groupedLeads={groupedLeads}
                expandedGroups={expandedGroups}
                onToggleGroup={(key) => {
                    const newSet = new Set(expandedGroups);
                    if (newSet.has(key)) newSet.delete(key);
                    else newSet.add(key);
                    setExpandedGroups(newSet);
                }}
                onLeadClick={(id) => navigate(`/crm/leads/${id}`)}
                groupBy={groupBy}
                getGroupColor={getGroupColor}
            />
        </motion.div>
    );
};

export default LeadGroupingPage;