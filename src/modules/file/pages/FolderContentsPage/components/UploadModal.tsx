// src/pages/file/FolderContentsPage/components/UploadModal.tsx

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, File, FileText, Image, FileSpreadsheet, Video, Music, Archive } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { formatFileSize, getFileIcon } from '@/modules/file/pages/FolderContentsPage/utils/helpers';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFiles: File[];
    onRemoveFile: (index: number) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    description: string;
    onDescriptionChange: (desc: string) => void;
    uploading: boolean;
    uploadProgress: number;
    onUpload: () => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    FILE_CATEGORIES: any[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            selectedFiles,
                                                            onRemoveFile,
                                                            selectedCategory,
                                                            onCategoryChange,
                                                            description,
                                                            onDescriptionChange,
                                                            uploading,
                                                            uploadProgress,
                                                            onUpload,
                                                            onFileSelect,
                                                            FILE_CATEGORIES,
                                                        }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileSelect(e);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ✅ Filter out 'all' category for upload
    const uploadCategories = FILE_CATEGORIES.filter(cat => cat.id !== 'all');

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
                                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upload Files</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                disabled={uploading}
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* File Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Files <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mp3"
                                        onChange={handleFileSelect}
                                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-950/70"
                                    />
                                    {selectedFiles.length > 0 && (
                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                            {selectedFiles.length} selected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ✅ Category Selection - Filtered to exclude 'all' */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Select a category...</option>
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
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white resize-none"
                                />
                            </div>

                            {/* Selected Files List */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {selectedFiles.length} file(s) selected
                                    </p>
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {getFileIcon(file.type, file.name)}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemoveFile(index)}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                                disabled={uploading}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        Uploading... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            {/* Quick Category Tags - Filtered to exclude 'all' */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Quick categories:</span>
                                {uploadCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => onCategoryChange(cat.id)}
                                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                            selectedCategory === cat.id
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={onUpload}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                                disabled={selectedFiles.length === 0 || !selectedCategory || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Files'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};