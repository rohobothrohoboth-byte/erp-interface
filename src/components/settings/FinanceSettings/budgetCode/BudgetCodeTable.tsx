import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreVertical,
  PenBox,
  Trash2,
  Code,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
import type { BudgetCode } from "./BudgetCodeSection";

interface BudgetCodeTableProps {
  budgetCodes: BudgetCode[];
  onEdit: (budgetCode: BudgetCode) => void;
  onDelete: (budgetCode: BudgetCode) => void;
  onToggleStatus: (budgetCode: BudgetCode) => void;
  loading?: boolean;
}

const BudgetCodeTable: React.FC<BudgetCodeTableProps> = ({
  budgetCodes,
  onEdit,
  onDelete,
  onToggleStatus,
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

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading budget codes...</span>
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
                Budget Code
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Fiscal Year
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {budgetCodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-indigo-500">
                  No budget codes found.
                </td>
              </tr>
            ) : (
              budgetCodes.map((budgetCode, index) => (
                <motion.tr
                  key={budgetCode.id}
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
                        <Code className="text-indigo-600 h-5 w-5" />
                      </motion.div>
                      <div className="ml-3">
                        <div className="font-medium text-indigo-900">
                          {budgetCode.budgetCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-indigo-900 max-w-md truncate">
                      {budgetCode.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900 hidden md:table-cell">
                    {budgetCode.fiscalYear}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-900 hidden md:table-cell">
                    {getStatusBadge(budgetCode.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-700 hidden md:table-cell">
                    {new Date(budgetCode.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Popover
                      open={popoverOpen === budgetCode.id.toString()}
                      onOpenChange={(open) =>
                        setPopoverOpen(open ? budgetCode.id.toString() : null)
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
                              onEdit(budgetCode);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <PenBox size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onToggleStatus(budgetCode);
                              setPopoverOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            {budgetCode.status === 'Active' ? (
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
                              onDelete(budgetCode);
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

export default BudgetCodeTable;
