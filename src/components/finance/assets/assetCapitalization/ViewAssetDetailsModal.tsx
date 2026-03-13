import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { AssetPendingCapitalization } from './types';

interface ViewAssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetPendingCapitalization | null;
  onCapitalize: (asset: AssetPendingCapitalization) => void;
}

const ViewAssetDetailsModal: React.FC<ViewAssetDetailsModalProps> = ({
  isOpen,
  onClose,
  asset,
  onCapitalize,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Asset Details</h2>
                <p className="text-sm text-gray-600">Pending Capitalization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Asset Reference ID</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{asset.asset_reference_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Asset Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{asset.asset_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(asset.created_at)}</p>
                </div>
              </div>
              {asset.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
                  <p className="text-sm text-gray-700 mt-1">{asset.description}</p>
                </div>
              )}
            </div>

            {/* Purchase Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Purchase Cost</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(asset.purchase_cost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Purchase Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(asset.purchase_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Vendor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Vendor Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{asset.vendor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Invoice Number</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    {asset.invoice_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Capitalization Notice */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-indigo-100 rounded-full">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-indigo-800">Ready for Capitalization</h4>
                  <p className="text-sm text-indigo-700 mt-1">
                    This asset has been approved and is ready to be capitalized. Click "Capitalize Asset" to proceed with the capitalization process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onCapitalize(asset);
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                Capitalize Asset
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewAssetDetailsModal;