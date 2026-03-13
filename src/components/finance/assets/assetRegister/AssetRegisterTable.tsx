import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Eye, RefreshCw, AlertCircle, ArrowRight, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import type { FixedAsset } from './types';

interface AssetRegisterTableProps {
  assets: FixedAsset[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewAsset: (asset: FixedAsset) => void;
  onRevalueAsset: (asset: FixedAsset) => void;
  onImpairAsset: (asset: FixedAsset) => void;
  onTransferAsset: (asset: FixedAsset) => void;
  onDisposeAsset: (asset: FixedAsset) => void;
}

const AssetRegisterTable: React.FC<AssetRegisterTableProps> = ({
  assets,
  currentPage,
  totalPages,
  itemsPerPage,
  isLoading,
  onPageChange,
  onViewAsset,
  onRevalueAsset,
  onImpairAsset,
  onTransferAsset,
  onDisposeAsset,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  
  // Calculate total items for pagination display
  const totalItems = totalPages * itemsPerPage;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DISPOSED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IMPAIRED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TRANSFERRED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
      },
    }),
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading assets...</p>
        </div>
      </motion.div>
    );
  }

  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No assets found in the register
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl shadow-sm overflow-hidden bg-white"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accum Dep
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Value
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset, index) => (
              <motion.tr
                key={asset.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={rowVariants}
                className="transition-colors hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewAsset(asset)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-indigo-600">
                    {asset.asset_id}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 font-medium">{asset.asset_name}</div>
                  <div className="text-xs text-gray-500">{asset.department}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {asset.category}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {formatCurrency(asset.cost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                  {formatCurrency(asset.accumulated_depreciation)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                  {formatCurrency(asset.net_book_value)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <Popover
                    open={popoverOpen === asset.id}
                    onOpenChange={(open) => setPopoverOpen(open ? asset.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </motion.button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewAsset(asset);
                            setPopoverOpen(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        {asset.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRevalueAsset(asset);
                                setPopoverOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-blue-700 flex items-center gap-2"
                            >
                              <RefreshCw size={16} />
                              Revalue
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onImpairAsset(asset);
                                setPopoverOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-yellow-700 flex items-center gap-2"
                            >
                              <AlertCircle size={16} />
                              Impair
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTransferAsset(asset);
                                setPopoverOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-700 flex items-center gap-2"
                            >
                              <ArrowRight size={16} />
                              Transfer
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDisposeAsset(asset);
                                setPopoverOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-red-700 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Dispose
                            </button>
                          </>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> assets
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssetRegisterTable;