import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  FileImage,
  File,
  CheckCircle,
  AlertCircle,
  PenTool,
  Eye,
  Download
} from 'lucide-react';

interface SignatureStepProps {
  signatureFile: File | null;
  onNext: (file: File | null) => void;
  loading?: boolean;
}

export const SignatureStep: React.FC<SignatureStepProps> = ({
                                                              signatureFile: initialSignatureFile,
                                                              onNext,
                                                              loading = false,
                                                            }) => {
  const [signatureFile, setSignatureFile] = useState<File | null>(initialSignatureFile);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load preview if initial file exists
  useEffect(() => {
    if (initialSignatureFile) {
      if (initialSignatureFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(initialSignatureFile);
        setPreviewUrl(url);
      } else if (initialSignatureFile.type.includes('pdf')) {
        const url = URL.createObjectURL(initialSignatureFile);
        setPreviewUrl(url);
      }
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [initialSignatureFile]);

  const validateFile = (file: File): boolean => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and PDF files are allowed');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSignatureFile(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type.includes('pdf')) {
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
      setSignatureFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type.includes('pdf')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemove = () => {
    setSignatureFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  const handleDownload = () => {
    if (signatureFile) {
      const url = URL.createObjectURL(signatureFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = signatureFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = () => {
    if (!signatureFile) return null;

    if (signatureFile.type.startsWith('image/')) {
      return (
          <div className="relative w-full h-full">
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Signature preview"
                    className="w-full h-full object-contain p-4"
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <FileImage className="w-16 h-16 text-blue-500 mb-3" />
                  <p className="text-base font-medium text-gray-700">Image File</p>
                </div>
            )}
          </div>
      );
    } else if (signatureFile.type.includes('pdf')) {
      return (
          <div className="relative w-full h-full">
            {previewUrl ? (
                <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-64 rounded-lg"
                />
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                  <div className="w-20 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-base font-medium text-gray-700">PDF Document</p>
                </div>
            )}
          </div>
      );
    } else {
      return (
          <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
            <File className="w-16 h-16 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-700">Document</p>
          </div>
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(signatureFile);
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
      >
        {/* Error Display */}
        <AnimatePresence>
          {error && (
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setError(null)}
                      className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Upload Signature</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Upload employee's digital signature
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <label className="cursor-pointer block w-full">
                  <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                  />
                  <motion.div
                      whileHover={{ scale: signatureFile ? 1 : 1.02 }}
                      whileTap={{ scale: signatureFile ? 1 : 0.98 }}
                      className={`
                    relative w-full rounded-2xl border-2 transition-all duration-300 overflow-hidden
                    ${isDragging
                          ? "border-purple-500 bg-purple-50/50 shadow-lg scale-105"
                          : signatureFile
                              ? "border-purple-200 bg-white shadow-sm"
                              : "border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-purple-400 hover:shadow-md"
                      }
                  `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                  >
                    {signatureFile ? (
                        <div className="relative">
                          <div className="h-64">
                            {getFileIcon()}
                          </div>

                          {/* File Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div className="flex items-center justify-between text-white">
                              <div className="flex-1 truncate">
                                <p className="text-sm font-medium truncate">{signatureFile.name}</p>
                                <p className="text-xs opacity-80">
                                  {(signatureFile.size / 1024 / 1024).toFixed(2)} MB • {signatureFile.type.split('/').pop()?.toUpperCase()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {(signatureFile.type.startsWith('image/') || signatureFile.type.includes('pdf')) && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setShowPreview(!showPreview);
                                        }}
                                        className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDownload();
                                    }}
                                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                          <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                              className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4"
                          >
                            <PenTool className="w-8 h-8 text-purple-600" />
                          </motion.div>
                          <h4 className="text-lg font-semibold text-slate-800 mb-2">
                            Upload Signature
                          </h4>
                          <p className="text-sm text-slate-500 mb-2">
                            Drag and drop or click to browse
                          </p>
                          <p className="text-xs text-slate-400">
                            Supports JPEG, PNG, PDF • Max 10MB
                          </p>
                        </div>
                    )}
                  </motion.div>
                </label>

                {/* Remove Button */}
                <AnimatePresence>
                  {signatureFile && (
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
              </div>

              {/* File Details Card */}
              <AnimatePresence>
                {signatureFile && !showPreview && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4"
                    >
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              Signature Uploaded Successfully
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {signatureFile.name} • {(signatureFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-purple-600 mt-2">
                              This signature will be used for official documents
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>

              {/* Preview Modal */}
              <AnimatePresence>
                {showPreview && previewUrl && signatureFile?.type.includes('image/') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPreview(false)}
                    >
                      <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.9 }}
                          className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                      >
                        <img
                            src={previewUrl}
                            alt="Signature Preview"
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </motion.div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upload Tips */}
          {!signatureFile && !error && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <PenTool className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">
                Accepted formats: JPEG, PNG, PDF • Max size: 10MB
              </span>
                </div>
              </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
                type="submit"
                disabled={loading}
                className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <PenTool className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Save Signature
                  </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center gap-6 pt-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Secure upload</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Encrypted storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Digital signature ready</span>
          </div>
        </motion.div>
      </motion.div>
  );
};