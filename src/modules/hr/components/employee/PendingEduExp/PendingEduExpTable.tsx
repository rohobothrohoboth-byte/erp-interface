// components/hr/employee/PendingEduExp/PendingEduExpTable.tsx - Updated with text buttons

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  GraduationCap,
  Briefcase,
  User,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye as EyeIcon
} from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import toast from 'react-hot-toast';
import ReviewEduExpModal from '@/modules/hr/components/employee/PendingEduExp/ReviewEduExpModal';
import type { UUID } from 'crypto';

// ============================================================
// TYPES
// ============================================================

interface PendingRecord {
  id: string;
  employeeId: string;
  empFullName: string;
  empFullNameAm: string;
  code: string;
  gender: string;
  department: string;
  branch: string;
  position: string;
  type: 'education' | 'experience';
  institution?: string;
  fieldOfStudy?: string;
  company?: string;
  positionTitle?: string;
  startDate: string;
  endDate: string;
  status: string;
  dateAdd: string;
}

interface PendingEduExpTableProps {
  items: PendingRecord[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  onReview?: (id: string, decision: 'approve' | 'reject') => Promise<void>;
}

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }: { status: string }) => {
  if (status === '0' || status === 'Pending' || status === 'pending') {
    return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
    );
  }
  if (status === '1' || status === 'Approved' || status === 'approved') {
    return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>
    );
  }
  if (status === '2' || status === 'Rejected' || status === 'rejected') {
    return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>
    );
  }
  return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PendingEduExpTable: React.FC<PendingEduExpTableProps> = ({
                                                                 items,
                                                                 currentPage,
                                                                 totalPages,
                                                                 totalItems,
                                                                 onPageChange,
                                                                 loading = false,
                                                                 onReview,
                                                               }) => {
  const { t } = useLanguage();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PendingRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============================================================
  // HANDLE REVIEW
  // ============================================================

  const handleReview = async (id: string, decision: 'approve' | 'reject') => {
    if (!onReview) {
      toast.error('Review function not available');
      return;
    }

    setReviewingId(id);
    try {
      await onReview(id, decision);
      toast.success(
          decision === 'approve'
              ? 'Record approved successfully!'
              : 'Record rejected successfully!'
      );
      setIsModalOpen(false);
      setSelectedRecord(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to review record');
    } finally {
      setReviewingId(null);
    }
  };

  // ============================================================
  // HANDLE VIEW
  // ============================================================

  const handleView = (record: PendingRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  // ============================================================
  // GET TYPE ICON
  // ============================================================

  const getTypeIcon = (type: string) => {
    if (type === 'education') {
      return <GraduationCap className="w-4 h-4 text-blue-500" />;
    }
    return <Briefcase className="w-4 h-4 text-emerald-500" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'education') {
      return 'Education';
    }
    return 'Experience';
  };

  // ============================================================
  // GET INITIALS
  // ============================================================

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0).toUpperCase();
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">
            Loading records...
          </span>
          </div>
        </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {t.noRecordsFound || 'No pending records found'}
            </p>
          </div>
        </div>
    );
  }

  return (
      <>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Update Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, index) => (
                  <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Employee */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-700 dark:text-purple-400 font-semibold text-sm">
                          {getInitials(item.empFullName)}
                        </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {item.empFullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {item.position || 'N/A'} • {item.department || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {item.code || 'N/A'}
                    </span>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                        {item.gender || 'N/A'}
                      </span>
                      </div>
                    </td>

                    {/* Update Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(item.type)}
                        <span className={`text-sm font-medium ${
                            item.type === 'education'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {getTypeLabel(item.type)}
                      </span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {item.type === 'education' ? (
                            <div>
                              <p className="font-medium">{item.institution || 'N/A'}</p>
                              <p className="text-xs text-slate-400">{item.fieldOfStudy || ''}</p>
                            </div>
                        ) : (
                            <div>
                              <p className="font-medium">{item.company || 'N/A'}</p>
                              <p className="text-xs text-slate-400">{item.positionTitle || ''}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {item.startDate || 'N/A'} - {item.endDate || 'N/A'}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Action - Updated with Text Buttons */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                            onClick={() => handleView(item)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 rounded-lg transition-colors"
                            title="View Details"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          View
                        </button>

                        {/* Approve Button */}
                        <button
                            onClick={() => handleReview(item.id, 'approve')}
                            disabled={reviewingId === item.id}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 rounded-lg transition-colors ${
                                reviewingId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Approve"
                        >
                          {reviewingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>

                        {/* Reject Button */}
                        <button
                            onClick={() => handleReview(item.id, 'reject')}
                            disabled={reviewingId === item.id}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 rounded-lg transition-colors ${
                                reviewingId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Reject"
                        >
                          {reviewingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                              <XCircle className="w-3.5 h-3.5" />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && totalPages > 1 && (
              <div className="bg-white/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{' '}
                    <span className="font-semibold">
                  {(currentPage - 1) * 10 + 1}
                </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                  {Math.min(currentPage * 10, totalItems)}
                </span>{' '}
                    of{' '}
                    <span className="font-semibold">{totalItems}</span>{' '}
                    records
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p;
                      if (totalPages <= 5) p = i + 1;
                      else if (currentPage <= 3) p = i + 1;
                      else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                      else p = currentPage - 2 + i;
                      return (
                          <button
                              key={p}
                              onClick={() => onPageChange(p)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                  currentPage === p
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                          >
                            {p}
                          </button>
                      );
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Review Modal */}
        <ReviewEduExpModal
            record={selectedRecord}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedRecord(null);
            }}
            onReview={handleReview}
            loading={reviewingId !== null}
        />
      </>
  );
};

export default PendingEduExpTable;