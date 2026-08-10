import { motion } from "framer-motion";
import EducationalQualHeader from "@/modules/settings/components/hrSettings/educationalqual/EducationalQualHeader";
import EducationalQualSearchFilters from "@/modules/settings/components/hrSettings/educationalqual/EducationalQualSearchFilters";
import EditEducationalQualModal from "@/modules/settings/components/hrSettings/educationalqual/EditEducationalQualModal";
import DeleteEducationalQualModal from "@/modules/settings/components/hrSettings/educationalqual/DeleteEducationalQualModal";
import EducationalQualList from "@/modules/settings/components/hrSettings/educationalqual/EducationalQualList";
import { useState, useMemo, useEffect } from "react";
import { educationQualService } from "@/modules/core/services/settings/ModHrm/EducationQualService";
import type {
  EducationQualAddDto,
  EducationQualListDto,
  EducationQualModDto,
} from "@/modules/hr/types/educationalqual";

function PageEducationalQual() {
  const [educationalQuals, setEducationalQuals] = useState<EducationQualListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQual, setEditingQual] = useState<EducationQualModDto | null>(null);
  const [deletingQual, setDeletingQual] = useState<EducationQualListDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load educational qualifications on component mount
  useEffect(() => {
    loadEducationQuals();
  }, []);

  // Filter educational qualifications based on search term
  const filteredEducationalQuals = useMemo(() => {
    if (!searchTerm.trim()) return educationalQuals;

    return educationalQuals.filter((qual) =>
      qual.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [educationalQuals, searchTerm]);

  const loadEducationQuals = async () => {
    try {
      setLoading(true);
      setError(null);
      const quals = await educationQualService.getAllEducationQuals();
      setEducationalQuals(quals);
    } catch (err) {
      setError('Failed to load educational qualifications');
      console.error('Error loading educational qualifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducationalQual = async (educationalQual: EducationQualAddDto) => {
    try {
      setError(null);
      const newQual = await educationQualService.createEducationQual(educationalQual);
      setEducationalQuals((prev) => [...prev, newQual]);
    } catch (err) {
      setError('Failed to create educational qualification');
      console.error('Error creating educational qualification:', err);
    }
  };

  const handleEditQual = (qual: EducationQualListDto) => {
    setEditingQual({
      id: qual.id,
      name: qual.name,
      rowVersion: qual.rowVersion || "1",
    });
  };

  const handleUpdateEducationalQual = async (updatedQual: EducationQualModDto) => {
    try {
      setError(null);
      const savedQual = await educationQualService.updateEducationQual(updatedQual);
      setEducationalQuals((prev) =>
        prev.map((qual) =>
          qual.id === savedQual.id ? savedQual : qual
        )
      );
      setEditingQual(null);
    } catch (err) {
      setError('Failed to update educational qualification');
      console.error('Error updating educational qualification:', err);
    }
  };

  const handleDeleteQual = (qual: EducationQualListDto) => {
    setDeletingQual(qual);
  };

  const handleConfirmDelete = async (qual: EducationQualListDto) => {
    try {
      setError(null);
      await educationQualService.deleteEducationQual(qual.id);
      setEducationalQuals((prev) => prev.filter((q) => q.id !== qual.id));
      setDeletingQual(null);
    } catch (err) {
      setError('Failed to delete educational qualification');
      console.error('Error deleting educational qualification:', err);
    }
  };

  return (
    <motion.section
      className="bg-gray-50 space-y-6 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
    >
      <EducationalQualHeader />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {error.includes("load") ? (
                <>
                  Failed to load educational qualifications.{" "}
                  <button
                    onClick={loadEducationQuals}
                    className="underline hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Try again
                  </button>{" "}
                  later.
                </>
              ) : error.includes("create") ? (
                "Failed to create educational qualification. Please try again."
              ) : error.includes("update") ? (
                "Failed to update educational qualification. Please try again."
              ) : error.includes("delete") ? (
                "Failed to delete educational qualification. Please try again."
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

      {/* Search and Filters with Add Modal */}
      <EducationalQualSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddEducationalQual={handleAddEducationalQual}
      />

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center py-12"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading educational qualifications...</p>
          </div>
        </motion.div>
      )}

      {/* Educational Qualifications List */}
      {!loading && (
        <EducationalQualList
          educationalQuals={filteredEducationalQuals}
          onEdit={handleEditQual}
          onDelete={handleDeleteQual}
        />
      )}

      {/* Edit Modal */}
      <EditEducationalQualModal
        educationalQual={editingQual}
        onEditEducationalQual={handleUpdateEducationalQual}
        onClose={() => setEditingQual(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEducationalQualModal
        educationalQual={deletingQual}
        isOpen={!!deletingQual}
        onClose={() => setDeletingQual(null)}
        onConfirm={handleConfirmDelete}
      />
    </motion.section>
  );
}

export default PageEducationalQual;