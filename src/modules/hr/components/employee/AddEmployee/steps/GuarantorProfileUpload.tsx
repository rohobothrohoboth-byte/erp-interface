import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  FileImage,
  File,
  CheckCircle,
  AlertCircle,
  Eye,
  Download
} from "lucide-react";
import { useLanguage } from "@/shared/i18n/LanguageContext";

interface GuarantorProfileUploadProps {
  guarantorFile: File | null;
  onGuarantorFileSelect: (file: File) => void;
  onGuarantorFileRemove: () => void;
  guarantorName?: string;
  guarantorNameAm?: string;
  maxSize?: number;
  acceptedTypes?: string[];
}

export const GuarantorProfileUpload: React.FC<GuarantorProfileUploadProps> = ({
                                                                                guarantorFile,
                                                                                onGuarantorFileSelect,
                                                                                onGuarantorFileRemove,
                                                                                guarantorName,
                                                                                guarantorNameAm,
                                                                                maxSize = 10,
                                                                                acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
                                                                              }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(t.fileSizeExceeds ? `${t.fileSizeExceeds} ${maxSize}MB` : `File size exceeds ${maxSize}MB limit`);
      return false;
    }
    if (!acceptedTypes.includes(file.type)) {
      setError(t.unsupportedFileType ? `${t.unsupportedFileType} ${acceptedTypes.join(', ')}` : `Unsupported file type. Please upload ${acceptedTypes.join(', ')}`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onGuarantorFileSelect(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type.includes("pdf")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onGuarantorFileSelect(file);
      if (file.type.startsWith("image/") || file.type.includes("pdf")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemove = () => {
    onGuarantorFileRemove();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  const handleDownload = () => {
    if (guarantorFile) {
      const url = URL.createObjectURL(guarantorFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = guarantorFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = () => {
    if (!guarantorFile) return null;

    if (guarantorFile.type.startsWith("image/")) {
      return (
          <div className="relative w-full h-full">
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <FileImage className="w-16 h-16 text-blue-500 mb-3" />
                  <p className="text-base font-medium text-gray-700">{t.imageFile || 'Image File'}</p>
                </div>
            )}
          </div>
      );
    } else if (guarantorFile.type.includes("pdf")) {
      return (
          <div className="relative w-full h-full">
            {previewUrl ? (
                <iframe src={previewUrl} title="PDF Preview" className="w-full h-64 rounded-lg" />
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <div className="w-20 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-base font-medium text-gray-700">{t.pdfDocument || 'PDF Document'}</p>
                </div>
            )}
          </div>
      );
    } else if (guarantorFile.type.includes("word") || guarantorFile.type.includes("document")) {
      return (
          <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
            <div className="w-20 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <p className="text-base font-medium text-gray-700">{t.wordDocument || 'Word Document'}</p>
          </div>
      );
    } else {
      return (
          <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
            <File className="w-16 h-16 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-700">{t.document || 'Document'}</p>
          </div>
      );
    }
  };

  return (
      <div className="w-full">
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <label className="cursor-pointer block w-full">
              <input type="file" className="hidden" accept={acceptedTypes.join(',')} onChange={handleFileChange} />
              <motion.div
                  whileHover={{ scale: guarantorFile ? 1 : 1.02 }}
                  whileTap={{ scale: guarantorFile ? 1 : 0.98 }}
                  className={`relative w-full rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isDragging ? "border-emerald-500 bg-emerald-50/50 shadow-lg scale-105" : guarantorFile ? "border-emerald-200 bg-white shadow-sm" : "border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-emerald-400 hover:shadow-md"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
              >
                {guarantorFile ? (
                    <div className="relative">
                      <div className="h-64">{getFileIcon()}</div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">{guarantorFile.name}</p>
                            <p className="text-xs opacity-80">{(guarantorFile.size / 1024 / 1024).toFixed(2)} MB • {guarantorFile.type.split('/').pop()?.toUpperCase()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={(e) => { e.preventDefault(); setShowPreview(!showPreview); }} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={(e) => { e.preventDefault(); handleDownload(); }} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-emerald-600" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">{t.uploadGuarantorDocument || 'Upload Guarantor Document'}</h4>
                      <p className="text-sm text-slate-500 mb-2">{t.dragDropOrClick || 'Drag and drop or click to browse'}</p>
                      <p className="text-xs text-slate-400">Supports {acceptedTypes.map(t => t.split('/').pop()?.toUpperCase()).join(', ')} • Max {maxSize}MB</p>
                    </div>
                )}
              </motion.div>
            </label>

            <AnimatePresence>
              {guarantorFile && (
                  <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={handleRemove}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-2 hover:shadow-lg transition-all duration-200 z-10"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {guarantorFile && !showPreview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{t.documentUploadedSuccessfully || 'Document Uploaded Successfully'}</p>
                        <p className="text-xs text-slate-500 mt-1">{guarantorFile.name} • {(guarantorFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {guarantorName && (
                            <p className="text-xs text-emerald-600 mt-2">{t.associatedWith || 'Associated with'}: {guarantorName} {guarantorNameAm && `(${guarantorNameAm})`}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPreview && previewUrl && guarantorFile?.type.includes('image/') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!guarantorFile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <FileText className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500">{t.acceptedFormats || 'Accepted formats'}: PDF, DOC, DOCX, JPG, PNG</span>
              </div>
            </motion.div>
        )}
      </div>
  );
};