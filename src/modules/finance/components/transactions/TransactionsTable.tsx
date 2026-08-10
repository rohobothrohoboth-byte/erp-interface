import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Eye,
  PenBox,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Repeat,
  Building,
  Calendar,
  Tag,
  Loader,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';

interface TransactionItem {
  id: number;
  date: string;
  reference: string;
  description: string;
  type: 'Income' | 'Expense' | 'Transfer' | 'Refund';
  amount: number;
  account: string;
  category: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reconciled';
  balance: number;
}

interface TransactionsTableProps {
  data: TransactionItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetails: (item: any) => void;
  onEdit: (item: any) => void;
  onCategorize: (item: any) => void;
  onReconcile: (item: any) => void;
  loading?: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  data,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetails,
  onEdit,
  onCategorize,
  onReconcile,
  loading = false,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'Income': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800',
        icon: <TrendingUp className="w-3 h-3 mr-1" />
      },
      'Expense': { 
        bg: 'bg-rose-100', 
        text: 'text-rose-800',
        icon: <TrendingDown className="w-3 h-3 mr-1" />
      },
      'Transfer': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: <Repeat className="w-3 h-3 mr-1" />
      },
      'Refund': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        icon: <TrendingUp className="w-3 h-3 mr-1" />
      },
    };
    const config = typeConfig[type] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center`}>
        {config.icon}
        {type}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      'Pending': { bg: 'bg-amber-100', text: 'text-amber-800' },
      'Failed': { bg: 'bg-rose-100', text: 'text-rose-800' },
      'Reconciled': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getAccountBadge = (account: string) => {
    const colors: Record<string, string> = {
      'Checking': 'bg-blue-100 text-blue-800',
      'Savings': 'bg-green-100 text-green-800',
      'Credit Card': 'bg-purple-100 text-purple-800',
      'Petty Cash': 'bg-amber-100 text-amber-800',
      'Investment': 'bg-cyan-100 text-cyan-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[account] || 'bg-gray-100 text-gray-800'}`}>
        {account}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    }}>
      <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
        <table className="min-w-full divide-y divide-indigo-200">
          <thead className="bg-gradient-to-r from-indigo-50 to-white">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Transaction Details
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Type & Category
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider hidden lg:table-cell">
                Amount & Balance
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider hidden md:table-cell">
                Status & Account
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-16 w-16 text-indigo-300 mb-4" />
                    <p className="text-xl font-semibold text-indigo-700 mb-2">No transactions found</p>
                    <p className="text-sm text-indigo-500">Add transactions or adjust your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
                  }}
                  className="transition-colors hover:bg-indigo-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <CreditCard className="text-indigo-600 h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          <div className="font-mono font-bold text-indigo-900">
                            {item.reference}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">{item.description}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {getTypeBadge(item.type)}
                      <div className="text-sm font-medium text-gray-900">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="space-y-2">
                      <div className={`text-lg font-bold ${item.type === 'Income' ? 'text-emerald-700' : item.type === 'Expense' ? 'text-rose-700' : 'text-blue-700'}`}>
                        ${Math.abs(item.amount).toLocaleString()}
                        <span className="text-sm font-normal ml-1">
                          {item.type === 'Income' ? 'Income' : item.type === 'Expense' ? 'Expense' : 'Transfer'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Balance: <span className="font-medium text-gray-900">${item.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-2">
                      {getStatusBadge(item.status)}
                      {getAccountBadge(item.account)}
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
                            Edit Transaction
                          </button>
                          <button
                            onClick={() => onCategorize(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 rounded text-purple-700 flex items-center gap-2"
                          >
                            <Tag size={16} />
                            Categorize
                          </button>
                          <button
                            onClick={() => onReconcile(item)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 rounded text-emerald-700 flex items-center gap-2"
                          >
                            <Building size={16} />
                            Reconcile
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
                  of <span className="font-medium">{totalItems}</span> transactions
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

export default TransactionsTable;