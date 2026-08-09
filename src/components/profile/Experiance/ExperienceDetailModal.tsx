// src/components/profile/Experiance/ExperienceDetailModal.tsx

import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  X,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Eye,
  Download,
  File,
  Image,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { showToast } from "../../../layout/layout";
import {
  getFilesByReference,
  deleteFile,
  downloadFile,
  uploadFile,
} from "../../../services/fileManagement/fileManagementApi";
import type { EmpExpListDto } from "../../../types/profile/EmpExp.types";

// ============================================================
// ✅ ExperienceDetailModal
// ============================================================

interface Props {
  isOpen: boolean;
  data?: EmpExpListDto;
  isLoading?: boolean;
  onClose: () => void;
  onFileUploaded?: () => void;
  onFileDeleted?: () => void;
}

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  filePath?: string;
}

export default function ExperienceDetailModal({
                                                isOpen,
                                                data,
                                                isLoading,
                                                onClose,
                                                onFileUploaded,
                                                onFileDeleted,
                                              }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Load attachments when modal opens or data changes
  useEffect(() => {
    if (isOpen && data?.id) {
      loadAttachments();
    }
  }, [isOpen, data?.id]);

  const loadAttachments = async () => {
    if (!data?.id) return;

    setLoadingAttachments(true);
    try {
      const response = await getFilesByReference('experience', data.id, 'experience_letter');
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
      if (error.response?.status !== 404) {
        showToast.error(error?.message || 'Failed to load attachments');
      }
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // ✅ Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!data?.id) {
      showToast.error('No experience record found');
      return;
    }

    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast.error(`File "${file.name}" exceeds 10MB limit`);
          continue;
        }

        const response = await uploadFile({
          file,
          module: 'experience',
          referenceId: data.id,
          category: 'experience_letter',
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
        showToast.success(`File "${file.name}" uploaded successfully`);
      }

      if (onFileUploaded) onFileUploaded();
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast.error(error?.message || 'Failed to upload file');
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
      showToast.error(error?.message || 'Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  // ✅ Handle file deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteFile(attachmentId, false);
      setAttachments(prev => prev.filter(f => f.id !== attachmentId));
      showToast.success('File deleted successfully');
      if (onFileDeleted) onFileDeleted();
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to delete file');
    }
  };

  // ✅ Get file icon based on mime type
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
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Eye size={20} />
                    <h2 className="text-lg font-bold text-gray-800">
                      Experience Details
                    </h2>
                  </div>
                  <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {isLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                      </div>
                  ) : !data ? (
                      <p className="text-center text-sm text-gray-400 py-10 italic">
                        No data available.
                      </p>
                  ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Job Title</p>
                                <p className="font-medium text-gray-900">
                                  {data.posTitle || (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  {data.company || (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {data.location || (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium text-gray-900">
                                  {data.status || (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {data.dateStart ? (
                                      new Date(data.dateStart).toLocaleDateString()
                                  ) : (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-gray-500">End Date</p>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {data.dateEnd ? (
                                      new Date(data.dateEnd).toLocaleDateString()
                                  ) : (
                                      <span className="text-gray-400 italic">—</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ✅ Responsibilities Section */}
                        {data.respo && (
                            <div className="mt-6">
                              <div className="border-t pt-4">
                                <div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    Responsibilities
                                  </p>
                                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                                    <p className="font-medium text-gray-900 whitespace-pre-wrap">
                                      {data.respo}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                        )}

                        {/* ✅ Attachments Section */}
                        <div className="border-t border-gray-200 pt-4 mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
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
                                disabled={uploadingFiles}
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
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-700 truncate">
                                            {attachment.fileName}
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadDate)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => handleDownloadAttachment(attachment)}
                                            disabled={downloadingFile === attachment.id}
                                            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
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
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                          <Trash2 size={14} className="text-red-500" />
                                        </button>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          ) : (
                              <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                                <p className="text-sm text-gray-400">No attachments</p>
                                <p className="text-xs text-gray-300">Upload experience letters or supporting documents</p>
                              </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Supported: PDF, JPEG, PNG, DOC (Max 10MB)
                          </p>
                        </div>
                      </>
                  )}
                </div>

                <div className="border-t p-2 flex justify-center">
                  <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
  );
}