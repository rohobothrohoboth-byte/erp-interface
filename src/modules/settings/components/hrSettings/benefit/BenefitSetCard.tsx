import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Types based on your DTOs
interface BenefitSetListDto {
  id: string;
  name: string;
  benefit: number;
  benefitStr: string;
  per: number;
  perStr: string;
  rowVersion?: string;
}

interface BenefitSetCardProps {
  benefitSet: BenefitSetListDto;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  viewMode: "grid" | "list";
}

const BenefitSetCard: React.FC<BenefitSetCardProps> = ({
  benefitSet,
  onEdit,
  onDelete,
  viewMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  // List View
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-green-200 relative group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-3 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {benefitSet.name}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {benefitSet.benefitStr}{" "}
                <span className="text-sm text-gray-500">
                  ETB/ {benefitSet.perStr}
                </span>
              </p>
            </div>
          </div>

          {/* Action Menu for List View */}
          <div className="relative ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleMenuToggle}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
              >
                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-green-200 relative group"
    >
      {/* Action Menu for Grid View */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100"
          onClick={handleMenuToggle}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
          >
            <button
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </motion.div>
        )}
      </div>

      {/* Grid Content */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-full bg-green-50 group-hover:bg-green-100 transition-colors">
          <DollarSign className="text-green-600" size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
          {benefitSet.name}
        </h3>
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-green-600">
          {benefitSet.benefitStr}{" "}
          <span className="text-sm text-gray-500">
            {" "}
            ETB/ {benefitSet.perStr}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default BenefitSetCard;
