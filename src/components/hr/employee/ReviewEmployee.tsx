// components/hr/employee/PendingEduExp/ReviewEduExpModal.tsx - With File Attachments

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  XCircle,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
  Award,
  BookOpen,
  Users,
  Paperclip,
  Download,
  Trash2,
  File,
  Image,
  Upload,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { useLanguage } from '../../../i18n/LanguageContext';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateUtils';
import {
  getFilesByReference,
  deleteFile,
  downloadFile,
  uploadFile,
} from '../../../services/fileManagement/fileManagementApi';

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

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  filePath?: string;
}

interface ReviewEduExpModalProps {
  record: PendingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (id: string, decision: 'approve' | 'reject') => Promise<void>;
  loading?: boolean;
}

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }: { status: string }) => {
  if (status === '0' || status === 'Pending' || status === 'pending') {
    return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Review
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
// DATE FORMATTER
// ============================================================

const formatSubmittedDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return date;
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date || 'N/A';
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ReviewEduExpModal: React.FC<ReviewEduExpModalProps> = ({
                                                               record,
                                                               isOpen,
                                                               onClose,
                                                               onReview,
                                                               loading = false,
                                                             }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');

  // ✅ File attachment states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!record) return null;

  const isEducation = record.type === 'education';
  const isExperience = record.type === 'experience';
  const moduleName = isEducation ? 'education' : 'experience';
  const categoryName = isEducation ? 'certificate' : 'experience_letter';

  // ✅ Load attachments when modal opens
  useEffect(() => {
    if (isOpen && record?.id) {
      loadAttachments();
    }
  }, [isOpen, record?.id]);

  const loadAttachments = async () => {
    if (!record?.id) return;

    setLoadingAttachments(true);
    try {
      const response = await getFilesByReference(moduleName, record.id, categoryName);
      const files = response?.data?.data || response?.data || [];

      const formattedAttachments: Attachment[] = Array.isArray(files)
          ? files.map((file: any) => ({
            id: file.id,
            fileName: file.fileName || file.name || file.originalFileName || 'File',
            fileSize: file.fileSize || file.size || 0,
            fileType: file.mimeType || file.fileType || file.documentType || '',
            uploadDate: file.uploadedAt || file.createdAt || new Date().toISOString(),
            filePath: file.filePath || '',
          }))
          : [];

      setAttachments(formattedAttachments);
    } catch (error: any) {
      console.error('Failed to load attachments:', error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // ✅ Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!record?.id) {
      toast.error('No record found');
      return;
    }

    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 10MB limit`);
          continue;
        }

        const response = await uploadFile({
          file,
          module: moduleName,
          referenceId: record.id,
          category: categoryName,
          description: file.name,
          isPublic: false,
          isShared: false,
          sharingLevel: 'Private',
        });

        const uploadedFile = response?.data || response || {};

        const newAttachment: Attachment = {
          id: uploadedFile.id || uploadedFile.fileId || '',
          fileName: uploadedFile.fileName || uploadedFile.name || file.name,
          fileSize: uploadedFile.fileSize || uploadedFile.size || file.size || 0,
          fileType: uploadedFile.mimeType || uploadedFile.fileType || file.type || '',
          uploadDate: uploadedFile.uploadedAt || new Date().toISOString(),
          filePath: uploadedFile.filePath || '',
        };

        setAttachments(prev => [...prev, newAttachment]);
        toast.success(`File "${file.name}" uploaded successfully`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ✅ Handle file download
  const handleDownloadAttachment = async (attachment: Attachment) => {
    setDownloadingFile(attachment.id);
    try {
      const blob = await downloadFile(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  // ✅ Handle file deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteFile(attachmentId, false);
      setAttachments(prev => prev.filter(f => f.id !== attachmentId));
      toast.success('File deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete file');
    }
  };

  // ✅ Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // ✅ Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ✅ Format date
  const formatDateDisplay = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0).toUpperCase();
  };

  const handleReview = async (decision: 'approve' | 'reject') => {
    setIsSubmitting(true);
    try {
      await onReview(record.id, decision);
      toast.success(
          decision === 'approve'
              ? `${isEducation ? 'Education' : 'Experience'} record approved successfully!`
              : `${isEducation ? 'Education' : 'Experience'} record rejected successfully!`
      );
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to review record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
      <AnimatePresence>
        {isOpen && (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget && !isSubmitting) onClose();
                }}
            >
              <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
              >
                {/* ============================================================ */}
                {/* HEADER */}
                {/* ============================================================ */}
                <div className={`px-6 py-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 ${
                    isEducation
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      {isEducation ? (
                          <GraduationCap className="w-5 h-5 text-white" />
                      ) : (
                          <Briefcase className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {isEducation ? 'Review Education' : 'Review Experience'}
                      </h2>
                      <p className="text-sm text-white/80">
                        {isEducation ? 'Education Record Details' : 'Experience Record Details'}
                      </p>
                    </div>
                  </div>
                  <button
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* ============================================================ */}
                {/* BODY */}
                {/* ============================================================ */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Employee Info */}
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {getInitials(record.empFullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            {record.empFullName || 'Unknown'}
                          </h3>
                          {record.empFullNameAm && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {record.empFullNameAm}
                              </p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                  {record.gender || 'N/A'}
                                                </span>
                            <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                              {record.department || 'N/A'}
                                                </span>
                            <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                              {record.position || 'N/A'}
                                                </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {record.code || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Record Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Record Information
                        </h4>
                        <div className="space-y-2">
                          {isEducation ? (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Institution</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {record.institution || 'N/A'}
                                                        </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Field of Study</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {record.fieldOfStudy || 'N/A'}
                                                        </span>
                                </div>
                              </>
                          ) : (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Company</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {record.company || 'N/A'}
                                                        </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">Position Title</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {record.positionTitle || 'N/A'}
                                                        </span>
                                </div>
                              </>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Status</span>
                            <StatusBadge status={record.status} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Duration
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Start Date</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    {record.startDate || 'N/A'}
                                                </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">End Date</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    {record.endDate || 'N/A'}
                                                </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    {formatSubmittedDate(record.dateAdd)}
                                                </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Attachments Section */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Attachments
                        {attachments.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {attachments.length}
                            </Badge>
                        )}
                      </Label>
                      <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingFiles || isSubmitting}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                      </Button>
                      <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleFileUpload(e.target.files);
                            }
                          }}
                      />
                    </div>

                    {uploadingFiles && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading files...
                        </div>
                    )}

                    {loadingAttachments ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          <span className="ml-2 text-sm text-gray-400">Loading attachments...</span>
                        </div>
                    ) : attachments.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {attachments.map((attachment) => (
                              <div
                                  key={attachment.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                      {attachment.fileName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(attachment.fileSize)} • {formatDateDisplay(attachment.uploadDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                      onClick={() => handleDownloadAttachment(attachment)}
                                      disabled={downloadingFile === attachment.id}
                                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title="Download"
                                  >
                                    {downloadingFile === attachment.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    ) : (
                                        <Download size={14} className="text-blue-500" />
                                    )}
                                  </button>
                                  <button
                                      onClick={() => handleDeleteAttachment(attachment.id)}
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      title="Delete"
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                  </button>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                          <Paperclip className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-400 dark:text-gray-500">No attachments</p>
                          <p className="text-xs text-gray-300 dark:text-gray-600">
                            Upload {isEducation ? 'certificates' : 'experience letters'} or supporting documents
                          </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Supported: PDF, JPEG, PNG, DOC (Max 10MB)
                    </p>
                  </div>

                  {/* Remarks */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Review Remarks
                    </h4>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks (optional)..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        rows={3}
                        disabled={isSubmitting}
                    />
                  </div>

                  {/* Impact Note */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          {isEducation ? 'Education Record Review' : 'Experience Record Review'}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Approving this record will mark it as verified and update the employee's profile.
                          Rejecting will require the employee to resubmit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* FOOTER - Action Buttons */}
                {/* ============================================================ */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                  <Button
                      onClick={onClose}
                      variant="outline"
                      className="px-5 cursor-pointer"
                      disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                      onClick={() => handleReview('reject')}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-6 gap-2 transition-all duration-200"
                  >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </Button>
                  <Button
                      onClick={() => handleReview('approve')}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer px-6 gap-2 transition-all duration-200"
                  >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>,
      document.body
  );
};

export default ReviewEduExpModal;