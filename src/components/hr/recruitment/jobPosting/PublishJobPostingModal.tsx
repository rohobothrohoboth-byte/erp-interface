// src/components/hr/recruitment/jobPosting/PublishJobPostingModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, X, CheckCircle, Clock, Users, FileText } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import type { JobPostingViewDto } from '../../../../types/hr/recruit/jobPosting'; // ✅ Change to ViewDto

interface PublishJobPostingModalProps {
  isOpen: boolean;
  item: JobPostingViewDto | null; // ✅ Change to ViewDto
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (id: string, comment: string | null) => void;
  onSuccess?: () => void;
}

const PublishJobPostingModal: React.FC<PublishJobPostingModalProps> = ({
                                                                         isOpen,
                                                                         item,
                                                                         isLoading = false,
                                                                         onClose,
                                                                         onSubmit,
                                                                         onSuccess,
                                                                       }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setIsSubmitting(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLoading, isSubmitting]);

  const handleClose = () => {
    if (!isLoading && !isSubmitting) {
      setComment('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!item || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(item.id, comment || null);
      onSuccess?.();
      setComment('');
      onClose();
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPostTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'Internal': 'Internal Only',
      'External': 'External Only',
      'Both': 'Internal & External',
    };
    return labels[type] || type;
  };

  const getDeadlineStatus = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const deadline = new Date(dateStr);
      const now = new Date();
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) return { label: 'Expired', className: 'text-red-600' };
      if (daysRemaining <= 7) return { label: `${daysRemaining} days remaining`, className: 'text-yellow-600' };
      return { label: `${daysRemaining} days remaining`, className: 'text-green-600' };
    } catch {
      return null;
    }
  };

  const deadlineStatus = item?.deadlineDateStr ? getDeadlineStatus(item.deadlineDateStr) : null;

  if (!isOpen || !item) return null;

  const isSubmittingState = isLoading || isSubmitting;

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 sticky top-0 z-10">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Send size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800">Publish Job Posting</h2>
                    <p className="text-xs text-gray-500 truncate">
                      {item.postNumber} · {item.reqNumber}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 shrink-0">
                    Draft → Published
                  </Badge>
                  <button
                      onClick={handleClose}
                      disabled={isSubmittingState}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Posting Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="font-medium text-gray-900 truncate">{item.position || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-medium text-gray-900 truncate">{item.department || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Post Type</p>
                        <p className="font-medium text-gray-900">{getPostTypeLabel(item.postTypeStr)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Deadline</p>
                        <p className={`font-medium ${deadlineStatus?.className || 'text-gray-900'}`}>
                          {item.deadlineDateStr
                              ? new Date(item.deadlineDateStr).toLocaleDateString()
                              : 'N/A'
                          }
                          {deadlineStatus && (
                              <span className="text-xs text-gray-500 ml-1">
                                                    ({deadlineStatus.label})
                                                </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Publishing this posting will:</p>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                          <li>• Make it visible to all applicants</li>
                          <li>• Start accepting applications immediately</li>
                          <li>• Send notifications to relevant stakeholders</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Publish Note <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <textarea
                        ref={textareaRef}
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a publish note for internal reference..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none disabled:opacity-50 transition-shadow"
                        disabled={isSubmittingState}
                        maxLength={500}
                    />
                    <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">
                                        {comment.length}/500 characters
                                    </span>
                      {comment.length > 0 && (
                          <button
                              type="button"
                              onClick={() => setComment('')}
                              className="text-gray-400 hover:text-gray-600"
                          >
                            Clear
                          </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmittingState}
                      className="px-6 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmittingState}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 cursor-pointer min-w-[120px]"
                  >
                    {isSubmittingState ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Publishing...
                        </>
                    ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish Now
                        </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default PublishJobPostingModal;