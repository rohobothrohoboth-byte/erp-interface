import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Eye,
  PenBox,
  Trash2,
  Building,
  Wrench,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  MapPin,
  Tag,
  Calculator,
  Loader,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';

interface AssetItem {
  id: number;
  tag: string;
  name: string;
  category: string;
  department: string;
  location: string;
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue: number;
  depreciationMethod: string;
  usefulLife: number;
  status: 'Active' | 'In Use' | 'Idle' | 'Under Maintenance' | 'Disposed';
  serialNumber: string;
  nextMaintenance: string;
}

interface AssetsTableProps {
  data: AssetItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onMaintenance: (item: any) => void;
  onTransfer: (item: any) => void;
  loading?: boolean;
}

const AssetsTable: React.FC<AssetsTableProps> = ({
  data,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  onMaintenance,
  onTransfer,
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
    hover: { backgroundColor: "rgba(0, 0, 0, 0.05)" },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Active': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800',
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      'In Use': { 
        bg: 'bg-indigo-100', 
        text: 'text-indigo-800',
        icon: <Building className="w-3 h-3 mr-1" />
      },
      'Idle': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      'Under Maintenance': { 
        bg: 'bg-rose-100', 
        text: 'text-rose-800',
        icon: <Wrench className="w-3 h-3 mr-1" />
      },
      'Disposed': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800',
        icon: <Trash2 className="w-3 h-3 mr-1" />
      },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Equipment': 'bg-blue-100 text-blue-800',
      'Furniture': 'bg-purple-100 text-purple-800',
      'Vehicles': 'bg-cyan-100 text-cyan-800',
      'Computers': 'bg-green-100 text-green-800',
      'Buildings': 'bg-orange-100 text-orange-800',
      'Software': 'bg-pink-100 text-pink-800',
      'Machinery': 'bg-teal-100 text-teal-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  const calculateDepreciation = (acquisitionCost: number, currentValue: number) => {
    const depreciation = ((acquisitionCost - currentValue) / acquisitionCost) * 100;
    return Math.round(depreciation * 10) / 10;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading assets...</span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
        <table className="min-w-full divide-y divide-indigo-200">
          <thead className="bg-gradient-to-r from-indigo-50 to-white">
            <motion.tr
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Asset Details
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Location & Department
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider hidden lg:table-cell">
                Financial Info
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </motion.tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Building className="h-16 w-16 text-indigo-300 mb-4" />
                    <p className="text-xl font-semibold text-indigo-700 mb-2">No assets found</p>
                    <p className="text-sm text-indigo-500">Add your first asset to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="transition-colors hover:bg-indigo-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center"
                      >
                        <Building className="text-indigo-600 h-6 w-6" />
                      </motion.div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <div className="font-mono font-bold text-indigo-900">
                            {item.tag}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {getCategoryBadge(item.category)}
                          <span className="text-xs text-gray-500">SN: {item.serialNumber}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span className="text-sm text-gray-900">{item.location}</span>
                      </div>
                      <div className="text-sm text-gray-700">{item.department}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Acquired: {item.acquisitionDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cost:</span>
                        <span className="text-sm font-medium text-gray-900">
                          ${item.acquisitionCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Value:</span>
                        <span className="text-sm font-medium text-emerald-700">
                          ${item.currentValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Depreciation:</span>
                        <div className="flex items-center gap-1">
                          {calculateDepreciation(item.acquisitionCost, item.currentValue) > 50 ? (
                            <TrendingDown className="w-3 h-3 text-rose-500" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            calculateDepreciation(item.acquisitionCost, item.currentValue) > 50 
                              ? 'text-rose-600' 
                              : 'text-amber-600'
                          }`}>
                            {calculateDepreciation(item.acquisitionCost, item.currentValue)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calculator className="w-3 h-3" />
                        <span>{item.depreciationMethod} ({item.usefulLife} yrs)</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-2">
                      {getStatusBadge(item.status)}
                      {item.nextMaintenance && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Wrench className="w-3 h-3" />
                          <span>Maintenance: {item.nextMaintenance}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Popover
                      open={popoverOpen === item.id.toString()}
                      onOpenChange={(open) =>
                        setPopoverOpen(open ? item.id.toString() : null)
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
                      <PopoverContent className="w-56 p-0" align="end">
                        <div className="py-1">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            onClick={() => onEdit(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 rounded text-indigo-700 flex items-center gap-2"
                          >
                            <PenBox size={16} />
                            Edit Asset
                          </button>
                          <button
                            onClick={() => onMaintenance(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 rounded text-amber-700 flex items-center gap-2"
                          >
                            <Wrench size={16} />
                            Maintenance
                          </button>
                          <button
                            onClick={() => onTransfer(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 rounded text-purple-700 flex items-center gap-2"
                          >
                            <MapPin size={16} />
                            Transfer
                          </button>
                          <div className="border-t my-1"></div>
                          <button
                            onClick={() => onDelete(item)}
                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Dispose Asset
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

        {/* Pagination */}
        {data.length > 0 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-indigo-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-indigo-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> assets
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-indigo-300 text-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssetsTable;