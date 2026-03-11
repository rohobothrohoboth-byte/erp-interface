import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import type { JournalEntryWithLines } from '../../../../types/finance/generalLedger';

interface ViewJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntryWithLines;
}

const ViewJournalEntryModal: React.FC<ViewJournalEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  // Debug: Log the entry data to see what we're receiving
  React.useEffect(() => {
    if (isOpen && entry) {
      console.log('ViewJournalEntryModal - Entry data:', entry);
      console.log('ViewJournalEntryModal - Entry lines:', entry.lines);
      console.log('ViewJournalEntryModal - Total Debit:', entry.totalDebit);
      console.log('ViewJournalEntryModal - Total Credit:', entry.totalCredit);
      entry.lines.forEach((line, index) => {
        console.log(`Line ${index + 1}:`, {
          lineNumber: line.lineNumber,
          accountCode: line.accountCode,
          accountName: line.accountName,
          memo: line.memo,
          debit: line.debit,
          credit: line.credit
        });
      });
    }
  }, [isOpen, entry]);

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Journal Entry Lines - {entry.entryNumber}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Journal Lines Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Line #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {line.lineNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium text-gray-900">
                            {line.accountCode || 'N/A'}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {line.accountName || 'Unknown Account'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {line.memo || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          {line.debit > 0 ? (
                            <span className="font-medium text-gray-900">
                              {formatCurrency(line.debit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          {line.credit > 0 ? (
                            <span className="font-medium text-gray-900">
                              {formatCurrency(line.credit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="bg-indigo-100 font-semibold border-t-2 border-indigo-200">
                      <td colSpan={3} className="px-4 py-3 text-sm text-gray-900 font-semibold">
                        Total
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(entry.totalDebit)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(entry.totalCredit)}
                      </td>
                    </tr>
                    
                    {/* Balance Check Row */}
                    <tr className="bg-indigo-50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">
                        Balance Check
                      </td>
                      <td colSpan={2} className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          entry.isBalanced 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-end">
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div> */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewJournalEntryModal;
