import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { ChartOfAccount } from '../../../../types/finance/generalLedger';

interface ViewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ChartOfAccount;
}

const ViewAccountModal: React.FC<ViewAccountModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Code</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{account.code}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{account.accountType}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Account Name (English)</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{account.name}</p>
              </div>

              {account.nameAm && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Name (Amharic)</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{account.nameAm}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Balance</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(account.balance)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Debit Balance</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(account.debitBalance)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Credit Balance</label>
                  <p className="mt-1 text-lg font-semibold text-red-600">{formatCurrency(account.creditBalance)}</p>
                </div>
              </div>

              {account.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-gray-900">{account.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="mt-1 text-gray-900">{account.currency}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                  </p>
                </div>
              </div>

              {account.taxCode && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax Code (ERCA)</label>
                  <p className="mt-1 text-gray-900">{account.taxCode}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Control Account</label>
                  <p className="mt-1 text-gray-900">{account.isControlAccount ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Allow Manual Entry</label>
                  <p className="mt-1 text-gray-900">{account.allowManualEntry ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(account.createdAt).toLocaleString()} by {account.createdBy}
                  </div>
                  {account.updatedAt && (
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(account.updatedAt).toLocaleString()} by {account.updatedBy}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewAccountModal;
