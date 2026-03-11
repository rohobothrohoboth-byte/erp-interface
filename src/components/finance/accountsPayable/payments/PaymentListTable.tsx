import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';

interface Payment {
  id: string;
  internal_pv_no: string;
  external_bank_ref: string;
  vendor_id: string;
  vendor_name: string;
  invoice_id: string;
  invoice_no: string;
  payment_date: string;
  payment_method: string;
  bank_account_id: string;
  bank_account_name: string;
  total_amount: number;
  attachment_url?: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface PaymentListTableProps {
  payments: Payment[];
  onViewInvoice: (payment: Payment) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function PaymentListTable({
  payments,
  onViewInvoice,
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: PaymentListTableProps) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      Cash: 'bg-green-100 text-green-800',
      Bank_Transfer: 'bg-blue-100 text-blue-800',
      Check: 'bg-purple-100 text-purple-800',
      Telebirr: 'bg-orange-100 text-orange-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3
      }
    })
  };

  if (payments.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No payments found
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
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                PV Number
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice No
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPayments.map((payment, index) => (
              <motion.tr
                key={payment.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={rowVariants}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"
                    >
                      <span className="text-indigo-600 font-medium text-xs">
                        {payment.internal_pv_no.split('-').pop()}
                      </span>
                    </motion.div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.internal_pv_no}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ref: {payment.external_bank_ref}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.vendor_name}</div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-gray-400" />
                    {payment.invoice_no}
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(payment.payment_date)}
                </td>
                <td className="px-4 py-1 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadge(payment.payment_method)}`}>
                    {payment.payment_method.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-semibold text-indigo-600">
                    {formatCurrency(payment.total_amount)}
                  </div>
                </td>
                <td className="px-4 py-1 whitespace-nowrap text-right text-sm font-medium">
                  <Popover open={popoverOpen === payment.id} onOpenChange={(open) => setPopoverOpen(open ? payment.id : null)}>
                    <PopoverTrigger asChild>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </motion.button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onViewInvoice(payment);
                            setPopoverOpen(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-indigo-600 flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Invoice
                        </button>
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
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> payments
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
}
