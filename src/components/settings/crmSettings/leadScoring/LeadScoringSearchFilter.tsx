import React from "react";
import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";

interface LeadScoringSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddClick: () => void;
  totalPercentage: number;
}

const LeadScoringSearchFilter: React.FC<LeadScoringSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  onAddClick,
  totalPercentage
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search lead scoring criteria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onAddClick} className="bg-orange-600 hover:bg-orange-700 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LeadScoringSearchFilter;
