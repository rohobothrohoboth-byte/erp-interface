import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

const BudgetCodeHeader: React.FC = () => {
 const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };


  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="mb-4 flex items-center gap-3 flex"
    >
         <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Button>
        <FolderOpen className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-black">
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-600 bg-clip-text text-transparent">
            Budget Code
          </span>
        </h1>
    </motion.div>
  );
};

export default BudgetCodeHeader;
