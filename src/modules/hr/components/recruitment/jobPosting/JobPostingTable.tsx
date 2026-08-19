// src/components/hr/recruitment/jobPosting/JobPostingTable.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, MoreVertical, Edit, Trash2, Send, ChevronLeft, ChevronRight,
  Eye, CheckCircle, XCircle, Clock, AlertCircle, FileText,
  Calendar, Users, Link, Check, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { JobPostingListDto } from '@/modules/hr/types/recruit/jobPosting';
import { format } from 'date-fns';

interface JobPostingTableProps {
  items: JobPostingListDto[];
  isLoading?: boolean;
  onEdit: (item: JobPostingListDto) => void;
  onDelete: (item: JobPostingListDto) => void;
  onPublish?: (item: JobPostingListDto) => void;
  onClose?: (item: JobPostingListDto) => void;
  onEvalFlow?: (item: JobPostingListDto) => void;
  onRowClick?: (item: JobPostingListDto) => void;
}

const PAGE_SIZE = 10;

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: <Clock className="w-3 h-3" />
  },
  Published: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <CheckCircle className="w-3 h-3" />
  },
  Closed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: <XCircle className="w-3 h-3" />
  },
  Expired: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: <AlertCircle className="w-3 h-3" />
  },
  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: <XCircle className="w-3 h-3" />
  },
};

const typeColors: Record<string, string> = {
  Internal: 'bg-blue-100 text-blue-800 border-blue-200',
  External: 'bg-purple-100 text-purple-800 border-purple-200',
  Both: 'bg-teal-100 text-teal-800 border-teal-200',
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Draft: 'Draft',
    Published: 'Published',
    Closed: 'Closed',
    Expired: 'Expired',
    Cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

// ✅ Improved date formatting with better error handling
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    // If it's already a formatted string, return it
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    }
    return dateStr;
  } catch {
    return 'Invalid date';
  }
};

const JobPostingTable: React.FC<JobPostingTableProps> = ({
                                                           items,
                                                           isLoading = false,
                                                           onEdit,
                                                           onDelete,
                                                           onPublish,
                                                           onClose,
                                                           onEvalFlow,
                                                           onRowClick
                                                         }) => {
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCopyLink = (postNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/vacancies/${postNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isPublished = (status: string) => status === 'Published';
  const isDraft = (status: string) => status === 'Draft';
  const isClosed = (status: string) => status === 'Closed' || status === 'Expired';

  // ✅ Navigation handlers with correct paths - using navigate directly
  const handleNavigate = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Navigating to:', path); // Debug log
    navigate(path);
  };

  if (isLoading) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500">Loading job postings...</p>
          </div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Post Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Req Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Deadline
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
            {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Megaphone className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">No Job Postings Found</p>
                      <p className="text-sm text-gray-500">Get started by creating your first job posting.</p>
                    </div>
                  </td>
                </tr>
            ) : (
                paginated.map((item, index) => {
                  const statusInfo = statusColors[item.statusStr] || statusColors.Draft;
                  const isItemPublished = isPublished(item.statusStr);
                  const isItemDraft = isDraft(item.statusStr);
                  const isItemClosed = isClosed(item.statusStr);

                  return (
                      <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                          onClick={onRowClick ? () => onRowClick(item) : undefined}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isItemPublished ? 'bg-green-100' :
                                    isItemDraft ? 'bg-yellow-100' :
                                        'bg-gray-100'
                            }`}>
                              <Megaphone className={`w-4 h-4 ${
                                  isItemPublished ? 'text-green-600' :
                                      isItemDraft ? 'text-yellow-600' :
                                          'text-gray-500'
                              }`} />
                            </div>
                            <div>
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {item.postNumber}
                          </span>
                              {isItemPublished && (
                                  <Badge className="ml-2 bg-green-100 text-green-700 text-[10px]">
                                    Live
                                  </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-600">
                        {item.reqNumber}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${typeColors[item.postTypeStr] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {item.postTypeStr}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.icon}
                        {getStatusLabel(item.statusStr)}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                          {formatDate(item.deadlineDateStr)}
                        </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                        {item.reqAppQuan || 0}
                      </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            {/* ✅ View Details - Direct navigation */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleNavigate(`/hr/recruitment/posting/${item.id}`, e)}
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* ✅ Dashboard */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleNavigate(`/hr/recruitment/posting/${item.id}/dashboard`, e)}
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                                  >
                                    <LayoutDashboard className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Dashboard</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* ✅ Applicants */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleNavigate(`/hr/recruitment/posting/${item.id}/applicants`, e)}
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Applicants</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Copy Link Button (Published only) */}
                            {isItemPublished && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => handleCopyLink(item.postNumber, e)}
                                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                      >
                                        {copiedId === item.postNumber ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Link className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {copiedId === item.postNumber ? 'Copied!' : 'Copy Link'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* Actions Menu */}
                            <Popover
                                open={popoverOpen === item.id}
                                onOpenChange={(o) => setPopoverOpen(o ? item.id : null)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-52 p-1" align="end">
                                <div className="py-1">
                                  <button
                                      onClick={() => { navigate(`/hr/recruitment/posting/${item.id}`); setPopoverOpen(null); }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-2 transition-colors"
                                  >
                                    <Eye size={15} /> View Details
                                  </button>
                                  <button
                                      onClick={() => { navigate(`/hr/recruitment/posting/${item.id}/dashboard`); setPopoverOpen(null); }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 text-purple-700 rounded-md flex items-center gap-2 transition-colors"
                                  >
                                    <LayoutDashboard size={15} /> Dashboard
                                  </button>
                                  <button
                                      onClick={() => { navigate(`/hr/recruitment/posting/${item.id}/applicants`); setPopoverOpen(null); }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-blue-700 rounded-md flex items-center gap-2 transition-colors"
                                  >
                                    <Users size={15} /> Applicants
                                  </button>
                                  {onPublish && isItemDraft && (
                                      <button
                                          onClick={() => { onPublish(item); setPopoverOpen(null); }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 text-green-700 rounded-md flex items-center gap-2 transition-colors border-t border-gray-100"
                                      >
                                        <Send size={15} /> Publish
                                      </button>
                                  )}
                                  {onClose && isItemPublished && (
                                      <button
                                          onClick={() => { onClose(item); setPopoverOpen(null); }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 text-orange-700 rounded-md flex items-center gap-2 transition-colors"
                                      >
                                        <XCircle size={15} /> Close
                                      </button>
                                  )}
                                  {onEvalFlow && (
                                      <button
                                          onClick={() => { onEvalFlow(item); setPopoverOpen(null); }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 text-purple-700 rounded-md flex items-center gap-2 transition-colors"
                                      >
                                        <FileText size={15} /> Evaluation Flow
                                      </button>
                                  )}
                                  <button
                                      onClick={() => { onEdit(item); setPopoverOpen(null); }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700 rounded-md flex items-center gap-2 transition-colors"
                                  >
                                    <Edit size={15} /> Edit
                                  </button>
                                  {isItemDraft && (
                                      <button
                                          onClick={() => { onDelete(item); setPopoverOpen(null); }}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-md flex items-center gap-2 transition-colors border-t border-gray-100"
                                      >
                                        <Trash2 size={15} /> Delete
                                      </button>
                                  )}
                                  {!isItemDraft && (
                                      <div className="px-3 py-2 text-xs text-gray-400 italic border-t border-gray-100">
                                        Actions restricted for published/closed posts
                                      </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </td>
                      </motion.tr>
                  );
                })
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {items.length > 0 && (
            <div className="bg-white px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 gap-3">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * PAGE_SIZE + 1, items.length)}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, items.length)}</span> of{' '}
                <span className="font-medium">{items.length}</span> postings
              </p>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                    if (i === 6) pageNum = totalPages;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return pageNum;
                }).filter((p, i, arr) => {
                  if (i === 0) return true;
                  if (i === arr.length - 1) return true;
                  return p - arr[i - 1] === 1;
                }).map((page, i, arr) => {
                  if (i > 0 && page - arr[i - 1] > 1) {
                    return (
                        <span key={`ellipsis-${i}`} className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500">
                    …
                  </span>
                    );
                  }
                  return (
                      <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === page
                                  ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                  );
                })}
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
        )}
      </motion.div>
  );
};

export default JobPostingTable;