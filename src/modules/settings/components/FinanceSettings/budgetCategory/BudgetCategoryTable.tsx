import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreVertical,
  PenBox,
  Trash2,
  Layers,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import type { BudgetCategory } from "@/modules/settings/components/FinanceSettings/budgetCategory/BudgetCategorySection";

interface BudgetCategoryTableProps {
  categories: BudgetCategory[];
  onEdit: (category: BudgetCategory) => void;
  onDelete: (category: BudgetCategory) => void;
  onToggleActive: (category: BudgetCategory) => void;
  loading?: boolean;
}

const BudgetCategoryTable: React.FC<BudgetCategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="overflow-x-auto rounded-lg border border-indigo-200 shadow-sm">
        <table className="min-w-full divide-y divide-indigo-200">
          <thead className="bg-white">
            <motion.tr
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Category Code
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Category Name (EN)
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden lg:table-cell">
                Category Name (AM)
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-indigo-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="transition-colors hover:bg-indigo-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"
                      >
                        <Layers className="text-indigo-600 h-5 w-5" />
                      </motion.div>
                      <div className="ml-3">
                        <div className="font-medium text-indigo-900">
                          {category.categoryCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-indigo-900">
                      {category.categoryNameEn}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-indigo-900">
                      {category.categoryNameAm}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm text-indigo-900 max-w-md truncate">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900 hidden md:table-cell">
                    {getStatusBadge(category.is_active)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Popover
                      open={popoverOpen === category.id.toString()}
                      onOpenChange={(open) =>
                        setPopoverOpen(open ? category.id.toString() : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </motion.button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0" align="end">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEdit(category);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <PenBox size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onToggleActive(category);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            {category.is_active ? (
                              <>
                                <EyeOff size={16} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye size={16} />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              onDelete(category);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default BudgetCategoryTable;
