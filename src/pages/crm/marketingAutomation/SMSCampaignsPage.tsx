import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { showToast } from '../../../layout/layout';
import AddSMSCampaignModal from '../../../components/crm/campaigns/AddSMSCampaignModal';
import DeleteSmsCampaignModal from '../../../components/crm/marketingAutomation/DeleteSmsCampaignModal';
import SMSCampaignsHeader from '../../../components/crm/marketingAutomation/smsCampaigns/SMSCampaignsHeader';
import SMSCampaignsSearchFilter from '../../../components/crm/marketingAutomation/smsCampaigns/SMSCampaignsSearchFilter';
import { Pagination } from '../../../components/ui/pagination';
import type { SMSCampaign } from '../../../types/campaign';

export default function SMSCampaignsPage() {
  const [smsCampaigns, setSMSCampaigns] = useState<SMSCampaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SMSCampaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<SMSCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSMSCampaigns();
  }, []);

  const loadSMSCampaigns = () => {
    const stored = localStorage.getItem('smsCampaigns');
    if (stored) {
      setSMSCampaigns(JSON.parse(stored));
    }
  };

  const saveSMSCampaigns = (updated: SMSCampaign[]) => {
    localStorage.setItem('smsCampaigns', JSON.stringify(updated));
    setSMSCampaigns(updated);
  };

  const handleSubmit = (campaignData: Partial<SMSCampaign>) => {
    if (editingCampaign) {
      // Update existing
      const updated = smsCampaigns.map(c => 
        c.id === editingCampaign.id 
          ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
          : c
      );
      saveSMSCampaigns(updated);
      showToast.success('SMS campaign updated successfully');
    } else {
      // Create new
      const newCampaign: SMSCampaign = {
        ...campaignData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as SMSCampaign;
      saveSMSCampaigns([newCampaign, ...smsCampaigns]);
      showToast.success('SMS campaign created successfully');
    }
    handleCloseModal();
  };

  const handleEdit = (campaign: SMSCampaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = (campaign: SMSCampaign) => {
    setDeletingCampaign(campaign);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCampaign) {
      const updated = smsCampaigns.filter(c => c.id !== deletingCampaign.id);
      saveSMSCampaigns(updated);
      showToast.success('SMS campaign deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingCampaign(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Scheduled': 'bg-orange-100 text-orange-800',
      'Sent': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRecipientDisplay = (campaign: SMSCampaign) => {
    if (campaign.recipientType === 'Single') {
      return campaign.recipientName || 'Single Recipient';
    }
    return campaign.isAllRecipients ? `All ${campaign.targetFor}s` : 'Multiple Recipients';
  };

  // Pagination calculations
  const filteredCampaigns = smsCampaigns.filter(c =>
    !searchTerm || c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) || c.message.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCampaigns.slice(startIndex, endIndex);
  }, [filteredCampaigns, currentPage]);

  return (
    <div className="space-y-6">
      <SMSCampaignsHeader />
      <SMSCampaignsSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* SMS Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border"
      >
        {smsCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SMS campaigns yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first SMS campaign.</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Create SMS Campaign
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                  <TableCell className="max-w-xs truncate">{campaign.message}</TableCell>
                  <TableCell>{campaign.targetFor}</TableCell>
                  <TableCell>{getRecipientDisplay(campaign)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.owner}</TableCell>
                  <TableCell>
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(campaign)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(campaign)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {smsCampaigns.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="campaigns"
            />
          )}
          </>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AddSMSCampaignModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCampaign={editingCampaign}
      />

      {/* Delete Modal */}
      <DeleteSmsCampaignModal
        campaignName={deletingCampaign?.campaignName || null}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCampaign(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

