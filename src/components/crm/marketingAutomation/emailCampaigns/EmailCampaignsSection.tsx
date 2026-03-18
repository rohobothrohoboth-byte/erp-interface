import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Mail, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { showToast } from '../../../../layout/layout';
import AddEmailCampaignModal from '../../../crm/campaigns/AddEmailCampaignModal';
import DeleteEmailCampaignModal from './DeleteEmailCampaignModal';
import EmailCampaignsHeader from './EmailCampaignsHeader';
import EmailCampaignsSearchFilter from './EmailCampaignsSearchFilter';
import { Pagination } from '../../../ui/pagination';
import type { EmailCampaign } from '../../../../types/campaign';

export default function EmailCampaignsSection() {
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<EmailCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEmailCampaigns();
  }, []);

  const loadEmailCampaigns = () => {
    const stored = localStorage.getItem('emailCampaigns');
    if (stored) {
      setEmailCampaigns(JSON.parse(stored));
    }
  };

  const saveEmailCampaigns = (updated: EmailCampaign[]) => {
    localStorage.setItem('emailCampaigns', JSON.stringify(updated));
    setEmailCampaigns(updated);
  };

  const handleSubmit = (campaignData: Partial<EmailCampaign>) => {
    if (editingCampaign) {
      const updated = emailCampaigns.map(c => 
        c.id === editingCampaign.id 
          ? { ...c, ...campaignData, updatedAt: new Date().toISOString() }
          : c
      );
      saveEmailCampaigns(updated);
      showToast.success('Email campaign updated successfully');
    } else {
      const newCampaign: EmailCampaign = {
        ...campaignData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as EmailCampaign;
      saveEmailCampaigns([newCampaign, ...emailCampaigns]);
      showToast.success('Email campaign created successfully');
    }
    handleCloseModal();
  };

  const handleEdit = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const campaign = emailCampaigns.find(c => c.id === id);
    if (campaign) {
      setDeletingCampaign(campaign);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingCampaign) {
      const updated = emailCampaigns.filter(c => c.id !== deletingCampaign.id);
      saveEmailCampaigns(updated);
      showToast.success('Email campaign deleted successfully');
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

  const getRecipientDisplay = (campaign: EmailCampaign) => {
    if (campaign.recipientType === 'Single') {
      return campaign.recipientName || 'Single Recipient';
    }
    return campaign.isAllRecipients ? `All ${campaign.targetFor}s` : 'Multiple Recipients';
  };

  const filteredCampaigns = emailCampaigns.filter(c =>
    !searchTerm || c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) || c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage]);

  return (
    <div className="space-y-6">
      <EmailCampaignsHeader />
      <EmailCampaignsSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsModalOpen(true)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border"
      >
        {emailCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No email campaigns yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first email campaign.</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Email Campaign
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Subject</TableHead>
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
                  <TableCell>{campaign.subject}</TableCell>
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
                        onClick={() => handleDelete(campaign.id)}
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

          {emailCampaigns.length > 0 && (
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

      <AddEmailCampaignModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCampaign={editingCampaign}
      />

      <DeleteEmailCampaignModal
        campaignName={deletingCampaign?.campaignName || null}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCampaign(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
