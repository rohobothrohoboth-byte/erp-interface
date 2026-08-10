import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, BadgePlus, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import AddEducationalQualModal from "@/modules/settings/components/hrSettings/educationalqual/AddEducationalQualModal";
import type { EducationQualAddDto } from "@/modules/hr/types/educationalqual";

interface EducationalQualSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddEducationalQual: (educationalQual: EducationQualAddDto) => void;
}

const EducationalQualSearchFilters: React.FC<
  EducationalQualSearchFiltersProps
> = ({ searchTerm, setSearchTerm, onAddEducationalQual }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddEducationalQual = (educationalQual: EducationQualAddDto) => {
    onAddEducationalQual(educationalQual);
    setIsAddModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap">
          {/* 🔍 Search Input */}
          <div className="w-full lg:flex-1">
            <label htmlFor="educationalqual-search" className="sr-only">
              Search Educational Qualifications
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="educationalqual-search"
                name="educationalqual-search"
                placeholder="Search Educational Qualifications"
                className="block w-full md:w-2/3 pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer rounded-r-md transition-colors"
                  style={{ right: '33.333%' }} // Adjust position for the 2/3 width input
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto items-center justify-end">
            {/* ➕ Add Educational Qualification Button */}
            <Button
              onClick={handleAddClick}
              size="sm"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <BadgePlus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Add Educational Qualification Modal */}
      {isAddModalOpen && (
        <AddEducationalQualModal
          onAddEducationalQual={handleAddEducationalQual}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default EducationalQualSearchFilters;