// src/pages/crm/leadManagement/LeadManagementPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLeads, deleteLead } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import LeadGenerationHeader from '../../../components/crm/leadManagement/leadGeneration/LeadGenerationHeader';
import LeadGenerationSearchFilter from '../../../components/crm/leadManagement/leadGeneration/LeadGenerationSearchFilter';
import LeadGenerationTable from '../../../components/crm/leadManagement/leadGeneration/LeadGenerationTable';
import DeleteLeadModal from '../../../components/crm/leadManagement/leadGeneration/DeleteLeadModal';
import LeadStatsCards from '../../../components/crm/leadManagement/shared/LeadStatsCards';
import AddLeadSection from '../../../components/crm/leadManagement/leadGeneration/addLead/AddLeadSection';
import type { LeadDto } from '../../../types/crm/crm.types';

const LeadManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterSource, setFilterSource] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, [filterStatus, filterPriority, filterSource]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterPriority !== 'All') params.priority = filterPriority;
            if (filterSource !== 'All') params.source = filterSource;
            if (searchTerm) params.searchTerm = searchTerm;

            const response = await getLeads(params);
            let data = response.data?.data || response.data || [];
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLead) return;
        try {
            setIsDeleting(true);
            await deleteLead(selectedLead.id);
            showToast.success('Lead deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLeads();
        } catch (error) {
            showToast.error('Failed to delete lead');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSearch = () => {
        fetchLeads();
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('All');
        setFilterPriority('All');
        setFilterSource('All');
        fetchLeads();
    };

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            lead.firstName?.toLowerCase().includes(search) ||
            lead.lastName?.toLowerCase().includes(search) ||
            lead.email?.toLowerCase().includes(search) ||
            lead.companyName?.toLowerCase().includes(search)
        );
    });

    const totalPages = Math.ceil(filteredLeads.length / 10);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            <LeadGenerationHeader
                onRefresh={fetchLeads}
                onAddLead={() => setIsAddModalOpen(true)}
                loading={loading}
            />

            <LeadStatsCards leads={leads} loading={loading} />

            <LeadGenerationSearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterPriority={filterPriority}
                onPriorityChange={setFilterPriority}
                filterSource={filterSource}
                onSourceChange={setFilterSource}
                onClearFilters={handleClearFilters}
                onSearch={handleSearch}
            />

            <LeadGenerationTable
                leads={filteredLeads.slice((currentPage - 1) * 10, currentPage * 10)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onViewLead={(id) => navigate(`/crm/leads/${id}`)}
                onEditLead={(id) => navigate(`/crm/leads/edit/${id}`)}
                onDeleteLead={(lead) => {
                    setSelectedLead(lead);
                    setIsDeleteModalOpen(true);
                }}
                loading={loading}
            />

            <DeleteLeadModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                lead={selectedLead}
                onDelete={handleDelete}
                loading={isDeleting}
            />

            {/* ✅ Add Lead Modal with isOpen prop */}
            <AddLeadSection
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchLeads();
                    setIsAddModalOpen(false);
                }}
            />
        </motion.div>
    );
};

export default LeadManagementPage;