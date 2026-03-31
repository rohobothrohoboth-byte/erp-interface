import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../ui/popover';
import { Badge } from '../../../../ui/badge';
import type { EvaluationStepListDto } from '../../../../../types/hr/recruit/evaluationStep';

interface EvaluationStepTableProps {
  items: EvaluationStepListDto[];
  isLoading?: boolean;
  onEdit: (item: EvaluationStepListDto) => void;
  onDelete: (item: EvaluationStepListDto) => void;
}

const PAGE_SIZE = 10;

const EvaluationStepTable: React.FC<EvaluationStepTableProps> = ({ items, isLoading = false, onEdit, onDelete }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluation Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Step</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading steps...</p>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <ListOrdered className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900 mb-1">No Steps Found</p>
                  <p className="text-sm text-gray-500">
                    {items.length === 0
                      ? 'Add the first step to this evaluation flow.'
                      : 'No steps match your search.'}
                  </p>
                </td>
              </tr>
            ) : null}
            {!isLoading && paginated.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    {item.stepOrder}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.stepName}</span>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{item.evalType ?? item.evalTypeName ?? '—'}</span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Badge className={item.isFinal ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-gray-600'}>
                    {item.isFinal ? 'Final' : 'No'}
                  </Badge>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right">
                  <Popover open={popoverOpen === item.id} onOpenChange={(o) => setPopoverOpen(o ? item.id : null)}>
                    <PopoverTrigger asChild>
                      <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-0" align="end">
                      <div className="py-1">
                        <button
                          onClick={() => { onEdit(item); setPopoverOpen(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                        >
                          <Edit size={15} /> Edit
                        </button>
                        <button
                          onClick={() => { onDelete(item); setPopoverOpen(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={15} /> Delete
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

      {items.length > 0 && (
        <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * PAGE_SIZE + 1, items.length)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, items.length)}</span> of{' '}
            <span className="font-medium">{items.length}</span> steps
          </p>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </motion.div>
  );
};

export default EvaluationStepTable;
