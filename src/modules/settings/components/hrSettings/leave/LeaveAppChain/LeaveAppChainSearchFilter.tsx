import React from "react";
import { motion } from "framer-motion";
import {  BadgePlus, FileText, History } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface LeaveAppChainSearchFiltersProps {
  onAddClick: () => void;
  onViewHistory: () => void;
}

const LeaveAppChainSearchFilters: React.FC<LeaveAppChainSearchFiltersProps> = ({

  onAddClick,
  onViewHistory,
}) => {
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-4 rounded-t-lg shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row lg:items-center sm:justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <FileText className="w-6 h-6 text-green-600" />
            <h1 className="sm:text-2xl text-xl font-bold text-black">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <span className="bg-linear-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
                  Leave
                </span>{" "}
                Approval Chain
              </motion.span>
            </h1>
          </motion.div>
        </div>
        <div className="flex gap-2 sm:flex-row flex-col">
          <Button
            onClick={onViewHistory}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer border-emerald-200"
          >
            <History size={18} />
            <span>View History</span>
          </Button>
          <Button
            onClick={onAddClick}
            size="sm"
            className="flex cursor-pointer items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white whitespace-nowrap w-full sm:w-auto"
          >
            <BadgePlus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveAppChainSearchFilters;