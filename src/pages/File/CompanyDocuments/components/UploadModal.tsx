// src/pages/file/CompanyDocuments/components/CompanyUploadModal.tsx

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Folder } from 'lucide-react';
import { CATEGORIES } from '../../../../constants/file/CompanyDocuments/categories';
import { getFileIcon } from '../../../../utils/file/CompanyDocuments/helpers';

interface CompanyUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    description: string;
    onDescriptionChange: (description: string) => void;
    uploading: boolean;
    uploadProgress: number;
    selectedFolderId: string | null;
    onFolderChange: (folderId: string | null) => void;
    availableFolders: Array<{ id: string; name: string; type?: string }>;
}

export const UploadModal: React.FC<CompanyUploadModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onUpload,
                                                                          selectedFile,
                                                                          onFileSelect,
                                                                          selectedCategory,
                                                                          onCategoryChange,
                                                                          description,
                                                                          onDescriptionChange,
                                                                          uploading,
                                                                          uploadProgress,
                                                                          selectedFolderId,
                                                                          onFolderChange,
                                                                          availableFolders,
                                                                      }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileSelect(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Filter categories to exclude 'all' for upload
    const uploadCategories = CATEGORIES.filter(cat => cat.id !== 'all');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Company Document</h2>
                            </div>
                            {/* ✅ Close button - only disabled when uploading */}
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={uploading}
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Folder Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Upload to <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedFolderId || ''}
                                        onChange={(e) => onFolderChange(e.target.value || null)}
                                        className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={uploading}
                                    >
                                        <option value="">Select a folder...</option>
                                        {availableFolders.map((folder) => (
                                            <option key={folder.id} value={folder.id}>
                                                📁 {folder.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* File Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select File <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/50 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-950/70 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Category Selection - Company categories */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Document Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                    disabled={uploading}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select a document type...</option>
                                    {uploadCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => onDescriptionChange(e.target.value)}
                                    placeholder="Enter a description (optional)"
                                    rows={2}
                                    disabled={uploading}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Selected File Info */}
                            {selectedFile && (
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        {getFileIcon(selectedFile.type, selectedFile.name)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {(selectedFile.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleRemoveFile}
                                            disabled={uploading}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        Uploading... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            {/* Quick Category Tags */}
                            {!uploading && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Quick types:</span>
                                    {uploadCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => onCategoryChange(cat.id)}
                                            className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                                selectedCategory === cat.id
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            {/* ✅ Cancel button - always clickable except when uploading */}
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            {/* ✅ Upload button */}
                            <button
                                onClick={onUpload}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                disabled={!selectedFile || !selectedCategory || uploading || !selectedFolderId}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload Document'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UploadModal;