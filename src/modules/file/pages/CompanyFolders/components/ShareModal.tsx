// src/pages/file/CompanyFolders/components/ShareModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Mail, Users, Link, Copy, Check, Globe, UserPlus,Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: any;
    onShare: (data: { sharedWith: string; permission: string }) => void;
    sharing: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
                                                          isOpen,
                                                          onClose,
                                                          folder,
                                                          onShare,
                                                          sharing,
                                                      }) => {
    const [sharedWith, setSharedWith] = useState('');
    const [permission, setPermission] = useState('view');
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/folder/${folder?.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        showToast.success('Link copied to clipboard!');
    };

    const handleSubmit = () => {
        if (!sharedWith.trim()) {
            showToast.warning('Please enter an email or username');
            return;
        }
        onShare({ sharedWith: sharedWith.trim(), permission });
    };

    if (!folder) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-purple-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Share Folder</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{folder.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sharing this folder</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Share with <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={sharedWith}
                                    onChange={(e) => setSharedWith(e.target.value)}
                                    placeholder="Enter email or username"
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Permission
                                </label>
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="view">View Only</option>
                                    <option value="edit">Edit</option>
                                    <option value="manage">Manage</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <Link className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={`${window.location.origin}/folder/${folder.id}`}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 truncate"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                disabled={sharing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                disabled={!sharedWith.trim() || sharing}
                            >
                                {sharing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Sharing...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4 inline mr-2" />
                                        Share
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};