import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreVertical, Edit, Trash2, Eye, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
import { useNavigate } from 'react-router-dom';
import type { JobReqListDto } from '../../../../types/hr/recruit/jobRequisition';

interface JobRequisitionTableProps {
  items: JobReqListDto[];
  isLoading?: boolean;
  onEdit: (item: JobReqListDto) => void;
  onDelete: (item: JobReqListDto) => void;
}

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  InProgress: 'bg-blue-100 text-blue-800',
};

const JobRequisitionTable: React.FC<JobRequisitionTableProps> = ({ items, isLoading = false, onEdit, onDelete }) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              {['Req Number', 'Reason', 'Position', 'JG Step', 'Qty', 'Status', 'Start Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading job requisitions...</p>
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm font-medium text-gray-900 mb-1">No Job Requisitions Found</p>
                <p className="text-sm text-gray-500">Get started by creating your first job requisition.</p>
              </td></tr>
            ) : paginated.map((item, index) => (
              <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-mono text-xs font-medium text-gray-900">{item.reqNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{item.reqReason}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.position}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.jgStep}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{item.reqQuantity}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.statusStr] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.statusStr}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.startDateStr || new Date(item.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Popover open={popoverOpen === item.id} onOpenChange={(o) => setPopoverOpen(o ? item.id : null)}>
                    <PopoverTrigger asChild>
                      <button className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                      <div className="py-1">
                        <button onClick={() => { navigate(`/hr/recruitment/job-requisition/${item.id}/review`); setPopoverOpen(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                          <Eye size={15} /> Review
                        </button>
                        {item.statusStr === 'Approve' && (
                          <button onClick={() => { navigate(`/hr/recruitment/job-requisition/${item.id}/postings`); setPopoverOpen(null); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700 flex items-center gap-2">
                            <Megaphone size={15} /> Job Postings
                          </button>
                        )}
                        <button onClick={() => { onEdit(item); setPopoverOpen(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2">
                          <Edit size={15} /> Edit
                        </button>
                        <button onClick={() => { onDelete(item); setPopoverOpen(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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
            <span className="font-medium">{items.length}</span> requisitions
          </p>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </motion.div>
  );
};

export default JobRequisitionTable;
