import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import BenefitSetHeader from "../../../components/settings/hrSettings/benefit/BenefitSetHeader";
import BenefitSetCard from "../../../components/settings/hrSettings/benefit/BenefitSetCard";
import BenefitSearchFilters from "../../../components/settings/hrSettings/benefit/BenefitSearchFilter";
import AddBenefitModal from "../../../components/settings/hrSettings/benefit/AddBenfitModal";
import EditBenefitSetModal from "../../../components/settings/hrSettings/benefit/EditBenefitSetModal";
import DeleteBenefitModal from "../../../components/settings/hrSettings/benefit/DeleteBenefitModal";
import { benefitSetService } from "../../../services/core/settings/ModHrm/BenefitSetService";
import type { BenefitSetListDto, BenefitSetAddDto, BenefitSetModDto } from "../../../types/hr/benefit";

const PageBenefitSet: React.FC = () => {
  const [benefitSets, setBenefitSets] = useState<BenefitSetListDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBenefitSet, setEditingBenefitSet] = useState<BenefitSetListDto | null>(null);
  const [deletingBenefitSet, setDeletingBenefitSet] = useState<BenefitSetListDto | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load benefit sets on component mount
  useEffect(() => {
    loadBenefitSets();
  }, []);

  const loadBenefitSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await benefitSetService.getAllBenefitSets();
      setBenefitSets(data);
    } catch (error) {
      setError('Failed to load benefit sets');
      console.error("Error loading benefit sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (data: BenefitSetAddDto) => {
    try {
      setError(null);
      const newBenefitSet = await benefitSetService.createBenefitSet(data);
      setBenefitSets((prev) => [...prev, newBenefitSet]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError('Failed to create benefit set');
      console.error("Error adding benefit set:", error);
    }
  };

  const handleEditSubmit = async (data: BenefitSetModDto) => {
    try {
      setError(null);
      const updatedBenefitSet = await benefitSetService.updateBenefitSet(data);
      setBenefitSets((prev) =>
          prev.map((set) =>
              set.id === updatedBenefitSet.id ? updatedBenefitSet : set
          )
      );
      setEditingBenefitSet(null);
    } catch (error) {
      setError('Failed to update benefit set');
      console.error("Error updating benefit set:", error);
    }
  };

  const handleDeleteConfirm = async (benefitSet: BenefitSetListDto) => {
    try {
      setError(null);
      setDeletingId(benefitSet.id);
      await benefitSetService.deleteBenefitSet(benefitSet.id);
      setBenefitSets((prev) => prev.filter((set) => set.id !== benefitSet.id));
      setDeletingBenefitSet(null);
    } catch (err) {
      setError('Failed to delete benefit set');
      console.error("Error deleting benefit set:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (benefitSet: BenefitSetListDto) => {
    setDeletingBenefitSet(benefitSet);
  };

  // ✅ FIX: Handle null values in filter
  const filteredBenefitSets = benefitSets.filter(
      (benefitSet) => {
        const searchLower = searchTerm.toLowerCase();
        const name = benefitSet.name?.toLowerCase() || '';
        const benefitStr = benefitSet.benefitStr?.toLowerCase() || '';

        return name.includes(searchLower) || benefitStr.includes(searchLower);
      }
  );

  return (
      <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 space-y-6 min-h-screen"
      >
        {/* Header Component - Always visible */}
        <BenefitSetHeader />

        {/* Search Filters Component - Always visible */}
        <BenefitSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            benefitSets={benefitSets}
            onAddClick={() => setIsAddModalOpen(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
        />

        {/* Error Display - Now positioned under the search filter */}
        {error && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-2"
            >
              <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                  <>
                    Failed to load benefit sets.{" "}
                    <button
                        onClick={loadBenefitSets}
                        className="underline hover:text-red-800 font-semibold focus:outline-none"
                    >
                      Try again
                    </button>{" "}
                    later.
                  </>
              ) : error.includes("create") ? (
                  "Failed to create benefit set. Please try again."
              ) : error.includes("update") ? (
                  "Failed to update benefit set. Please try again."
              ) : error.includes("delete") ? (
                  "Failed to delete benefit set. Please try again."
              ) : (
                  error
              )}
            </span>
                <button
                    onClick={() => setError(null)}
                    className="text-red-700 hover:text-red-900 font-bold text-lg ml-4"
                >
                  ×
                </button>
              </div>
            </motion.div>
        )}

        {/* Loading State */}
        {loading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-12"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading benefit sets...</p>
              </div>
            </motion.div>
        )}

        {/* Content Area - Only show when not loading */}
        {!loading && (
            <>
              {/* Benefit Sets Grid/List */}
              <div
                  className={
                    viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                  }
              >
                {filteredBenefitSets.map((benefitSet) => (
                    <BenefitSetCard
                        key={benefitSet.id}
                        benefitSet={benefitSet}
                        onEdit={() => setEditingBenefitSet(benefitSet)}
                        onDelete={() => handleDeleteClick(benefitSet)}
                        isDeleting={deletingId === benefitSet.id}
                        viewMode={viewMode}
                    />
                ))}
              </div>

              {filteredBenefitSets.length === 0 && !loading && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-12 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="p-3 rounded-full bg-gray-100 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Benefit Setting Found !
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                          ? "No benefit setting matches your search."
                          : "Get started by creating the first benefit settting."}
                    </p>
                  </motion.div>
              )}
            </>
        )}

        {/* Add Benefit Modal */}
        <AddBenefitModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddBenefit={handleAddSubmit}
        />

        {/* Edit Benefit Set Modal */}
        <EditBenefitSetModal
            isOpen={!!editingBenefitSet}
            onClose={() => setEditingBenefitSet(null)}
            onSave={handleEditSubmit}
            benefitSet={editingBenefitSet}
        />

        {/* Delete Benefit Set Modal */}
        <DeleteBenefitModal
            isOpen={!!deletingBenefitSet}
            onClose={() => setDeletingBenefitSet(null)}
            onConfirm={handleDeleteConfirm}
            benefitSet={deletingBenefitSet}
        />
      </motion.section>
  );
};

export default PageBenefitSet;