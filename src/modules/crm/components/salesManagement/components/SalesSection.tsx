import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Opportunity } from "@/modules/crm/types/crm";
import SalesHeader from "@/modules/crm/components/salesManagement/components/SalesHeader";
import SalesFilters from "@/modules/crm/components/salesManagement/components/SalesFilters";
import SalesTable from "@/modules/crm/components/salesManagement/components/SalesTable";
import OpportunityForm from "@/modules/crm/components/salesManagement/components/opportunities/OpportunityForm";
import DeleteOpportunityModal from "@/modules/crm/components/salesManagement/DeleteOpportunityModal";

interface SalesSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  opportunities: Opportunity[];
  onEdit: (opportunityData: Partial<Opportunity>) => void;
  onDelete: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onAddClick: () => void;
  onAddOpportunity: (opportunityData: Partial<Opportunity>) => void;
  isAddOpportunityModalOpen: boolean;
  onCloseAddOpportunityModal: () => void;
  onOpenAddOpportunityModal: () => void;
  selectedOpportunity: Opportunity | null;
  formMode: 'add' | 'edit';
  onEditOpportunity: (opportunity: Opportunity) => void;
}

const SalesSection: React.FC<SalesSectionProps> = ({
  searchTerm,
  setSearchTerm,
  opportunities,
  onEdit,
  onDelete,
  onView,
  onAddClick,
  onAddOpportunity,
  isAddOpportunityModalOpen,
  onCloseAddOpportunityModal,
  selectedOpportunity,
  formMode,
  onEditOpportunity,
}) => {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingOpportunity, setDeletingOpportunity] = useState<Opportunity | null>(null);

  const itemsPerPage = 10;

  // Pagination calculations
  const totalItems = opportunities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedOpportunities = opportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle edit opportunity
  const handleEditOpportunity = (opportunity: Opportunity) => {
    onEditOpportunity(opportunity);
  };

  // Handle delete opportunity
  const handleDeleteOpportunity = (opportunity: Opportunity) => {
    setDeletingOpportunity(opportunity);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingOpportunity) {
      onDelete(deletingOpportunity);
      setDeletingOpportunity(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SalesHeader />
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Search Filters */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-2"
        >
          <SalesFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onAddClick={onAddClick}
          />
        </motion.div>
      )}

      {/* Sales Table always visible */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-0 pb-0"
        >
          <SalesTable
            opportunities={paginatedOpportunities}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={loading}
            onPageChange={setCurrentPage}
            onEdit={handleEditOpportunity}
            onDelete={handleDeleteOpportunity}
            onView={onView}
          />
        </motion.div>
      )}

      {/* Modals */}
      <OpportunityForm
        opportunity={selectedOpportunity}
        isOpen={isAddOpportunityModalOpen}
        onClose={onCloseAddOpportunityModal}
        onSubmit={formMode === 'add' ? onAddOpportunity : onEdit}
        mode={formMode}
      />
      
      <DeleteOpportunityModal
        opportunity={deletingOpportunity}
        isOpen={!!deletingOpportunity}
        onClose={() => setDeletingOpportunity(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SalesSection;