// src/pages/file/DocumentDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, AlertCircle, Download, Share2, Trash2, File, Clock, User, Calendar, Tag, Loader2,
    FileText, Image, FileSpreadsheet, Video, Music, Archive, X, AlertTriangle, Copy, Check,
    Eye, Maximize2, Minimize2, Play
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { showToast } from '@/shared/layout/layout';
import { getFile, downloadFile, deleteFile, generateShareLink } from '@/modules/file/services/fileManagement/fileManagementApi';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import api from '@/shared/services/api';

// ============================================================
// DELETE MODAL COMPONENT
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    fileName: string;
    isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     fileName,
                                                     isDeleting,
                                                 }) => {
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
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Document</h2>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center text-center py-4">
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full mb-4">
                                <Trash2 className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                You are about to delete <strong className="text-gray-700 dark:text-gray-300">{fileName}</strong>.
                                <span className="text-amber-500 block mt-1">This item will be moved to trash.</span>
                            </p>
                        </div>

                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 inline mr-2" />
                                        Delete Document
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

// ============================================================
// SHARE MODAL COMPONENT
// ============================================================

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareLink: string;
    onCopy: () => void;
    copied: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   shareLink,
                                                   onCopy,
                                                   copied,
                                               }) => {
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
                            <div className="flex items-center gap-2 text-purple-500">
                                <Share2 className="w-5 h-5" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Share Document</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Share this document with anyone using the link below</p>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 truncate focus:outline-none"
                                />
                                <button
                                    onClick={onCopy}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-purple-500"
                                    title="Copy link"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {copied && (
                                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                                    <p className="text-sm text-green-600 dark:text-green-400">✅ Link copied to clipboard!</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                <span>Anyone with this link can view the document</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={onCopy}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 inline mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 inline mr-2" />
                                        Copy Link
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

// ============================================================
// VIEWER COMPONENT (Inline - inside the page)
// ============================================================

interface ViewerProps {
    documentId: string;
    fileName: string;
    fileType: string;
    onClose: () => void;
    onDownload: () => void;
}

const Viewer: React.FC<ViewerProps> = ({
                                           documentId,
                                           fileName,
                                           fileType,
                                           onClose,
                                           onDownload,
                                       }) => {
    const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (documentId) {
            loadFile();
        }
        return () => {
            if (fileObjectUrl) {
                URL.revokeObjectURL(fileObjectUrl);
            }
        };
    }, [documentId]);

    const loadFile = async () => {
        try {
            setLoading(true);
            setError(null);
            const blob = await downloadFile(documentId);

            if (!blob || blob.size === 0) {
                throw new Error('File is empty');
            }

            const objectUrl = URL.createObjectURL(blob);
            setFileObjectUrl(objectUrl);
        } catch (error: any) {
            console.error('Failed to load file:', error);
            setError(error?.message || 'Failed to load file');
            showToast.error('Failed to load file for viewing');
        } finally {
            setLoading(false);
        }
    };

    const isImage = fileType?.startsWith('image/');
    const isPdf = fileType?.includes('pdf');
    const isVideo = fileType?.startsWith('video/');
    const isAudio = fileType?.startsWith('audio/');

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    <p className="text-gray-500 dark:text-gray-400 ml-4">Loading file...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Load File</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={onDownload} className="bg-purple-500 hover:bg-purple-600 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download to View
                    </Button>
                </div>
            );
        }

        if (!fileObjectUrl) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No file loaded</p>
                </div>
            );
        }

        if (isImage) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <img
                        src={fileObjectUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain"
                        onError={() => {
                            setLoading(false);
                            showToast.error('Failed to load image');
                        }}
                    />
                </div>
            );
        }

        if (isPdf) {
            return (
                <div className="w-full h-full">
                    <embed
                        src={fileObjectUrl}
                        type="application/pdf"
                        className="w-full h-full"
                        title={fileName}
                    />
                </div>
            );
        }

        if (isVideo) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <video controls className="max-w-full max-h-full" autoPlay playsInline>
                        <source src={fileObjectUrl} type={fileType} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        if (isAudio) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="mb-8">
                        <Music className="w-20 h-20 text-purple-500" />
                    </div>
                    <audio controls className="w-full max-w-md" autoPlay>
                        <source src={fileObjectUrl} type={fileType} />
                        Your browser does not support the audio tag.
                    </audio>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{fileName}</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6">
                    <File className="w-20 h-20 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{fileName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This file type cannot be previewed directly.</p>
                <Button onClick={onDownload} className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                </Button>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{fileName}</span>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{fileType || 'File'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDownload}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-purple-500"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                        title="Close Viewer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Viewer Content */}
            <div className="h-[500px] overflow-auto bg-black/5 dark:bg-black/20">
                {renderContent()}
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const DocumentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [uploaderName, setUploaderName] = useState<string>('');

    useEffect(() => {
        const loadDocument = async () => {
            if (!id) {
                setError('Invalid document ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getFile(id);
                const data = response?.data?.data || response?.data;

                if (data) {
                    setDocument(data);
                    // Fetch user name if uploadedBy is a GUID
                    if (data.uploadedBy && data.uploadedBy.length === 36) {
                        await fetchUserName(data.uploadedBy);
                    } else if (data.uploadedByName) {
                        setUploaderName(data.uploadedByName);
                    } else {
                        setUploaderName(data.uploadedBy || 'Unknown');
                    }
                } else {
                    setError('Document not found');
                }
            } catch (error: any) {
                console.error('Failed to load document:', error);
                setError(error?.response?.data?.message || 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };

        loadDocument();
    }, [id]);

    // ✅ Fixed fetchUserName function
    const fetchUserName = async (userId: string) => {


        if (!userId || userId === 'Unknown') {

            setUploaderName('Unknown User');
            return;
        }

        try {

            const response = await api.get(`/auth/v1/User/${userId}`);


            // ✅ Check if response.data exists and has data
            const userData = response?.data?.data;


            if (userData) {
                // ✅ The fields are capitalized in the response: UserName, FirstName, etc.
                const firstName = userData.FirstName || userData.firstName || '';
                const middleName = userData.MiddleName || userData.middleName || '';
                const lastName = userData.LastName || userData.lastName || '';
                const userName = userData.UserName || userData.userName || '';
                const email = userData.Email || userData.email || '';



                // Build full name
                const fullName = [firstName, middleName, lastName]
                    .filter(name => name && name.trim() !== '')
                    .join(' ')
                    .trim();


                // ✅ Use full name if available, otherwise UserName, then Email, then userId
                const displayName = fullName || userName || email || userId;


                setUploaderName(displayName);
            } else {
                console.warn('⚠️ [fetchUserName] No userData found');
                setUploaderName(userId);
            }
        } catch (error: any) {
            console.error('❌ [fetchUserName] Failed to fetch user name:', error);
            setUploaderName(userId);
        }
    };

    const isViewable = (contentType: string, fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase() || '';
        const type = contentType?.toLowerCase() || '';

        if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
            return true;
        }
        if (type.includes('pdf') || ext === 'pdf') {
            return true;
        }
        if (type.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
            return true;
        }
        if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
            return true;
        }
        if (type.startsWith('text/') || ['txt', 'csv', 'md', 'xml', 'json'].includes(ext)) {
            return true;
        }
        return false;
    };

    const handleView = () => {
        setShowViewer(true);
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
    };

    const handleDownload = async () => {
        if (!document) return;

        try {
            setDownloading(true);
            const blob = await downloadFile(document.id);

            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = document.fileName || document.name || 'download';
            window.document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(link);

            showToast.success('File downloaded successfully');
        } catch (error: any) {
            console.error('Download failed:', error);
            showToast.error(error?.message || 'Failed to download file');
        } finally {
            setDownloading(false);
        }
    };

    const handleShareClick = async () => {
        if (!document) return;

        try {
            setSharing(true);
            const response = await generateShareLink(document.id);

            if (response?.data) {
                const token = response.data.token || response.data.Token;

                if (token) {
                    const baseUrl = window.location.origin;
                    const publicUrl = `${baseUrl}/public/file/${token}`;
                    setShareLink(publicUrl);
                    setShowShareModal(true);
                } else {
                    const link = response.data.shareUrl || response.data.link || response.data.url;
                    if (link) {
                        setShareLink(link);
                        setShowShareModal(true);
                    } else {
                        showToast.error('Failed to generate share link');
                    }
                }
            } else {
                showToast.error('Failed to generate share link');
            }
        } catch (error: any) {
            console.error('Share failed:', error);
            showToast.error(error?.message || 'Failed to generate share link');
        } finally {
            setSharing(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;

        const copied = await copyToClipboard(shareLink);
        if (copied) {
            setCopied(true);
            showToast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 3000);
        } else {
            showToast.info('Copy the link manually: ' + shareLink);
        }
    };

    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }

            const textArea = window.document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            window.document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = window.document.execCommand('copy');
                window.document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                window.document.body.removeChild(textArea);
                return false;
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            return false;
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!document) return;

        setIsDeleting(true);
        try {
            await deleteFile(document.id, false);
            showToast.success('Document deleted');
            setShowDeleteModal(false);
            navigate(-1);
        } catch (error: any) {
            console.error('Delete failed:', error);
            showToast.error(error?.message || 'Failed to delete document');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const getFileIcon = (contentType: string, fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase() || '';
        const type = contentType?.toLowerCase() || '';

        if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
            return <Image className="w-16 h-16 text-purple-500" />;
        }
        if (type.includes('pdf') || ext === 'pdf') {
            return <FileText className="w-16 h-16 text-red-500" />;
        }
        if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(ext)) {
            return <FileSpreadsheet className="w-16 h-16 text-green-500" />;
        }
        if (type.includes('word') || type.includes('document') || ['doc', 'docx', 'txt'].includes(ext)) {
            return <FileText className="w-16 h-16 text-blue-500" />;
        }
        if (type.startsWith('video/') || ['mp4', 'avi', 'mov'].includes(ext)) {
            return <Video className="w-16 h-16 text-red-400" />;
        }
        if (type.startsWith('audio/') || ['mp3', 'wav'].includes(ext)) {
            return <Music className="w-16 h-16 text-green-400" />;
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return <Archive className="w-16 h-16 text-amber-500" />;
        }
        return <File className="w-16 h-16 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 KB';
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${bytes} bytes`;
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            policy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            procedure: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
            form: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            template: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            report: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            presentation: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
            archive: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
            document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            image: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            spreadsheet: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            video: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
            audio: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        };
        return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <File className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Document Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'The document you\'re looking for does not exist.'}</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const fileName = document.fileName || document.name || 'Unnamed';
    const fileSize = document.fileSize || document.size || 0;
    const fileType = document.fileType || document.contentType || '';
    const uploadedAt = document.uploadedAt || document.createdAt || new Date();
    const category = document.category || document.documentType || 'Uncategorized';
    const viewable = isViewable(fileType, fileName);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    {getFileIcon(fileType, fileName)}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {fileName}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatFileSize(fileSize)}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {fileType || 'Unknown type'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {viewable && (
                                    <Button
                                        onClick={handleView}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20"
                                        title="View File"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                                >
                                    {downloading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    onClick={handleShareClick}
                                    disabled={sharing}
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                                >
                                    {sharing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Share2 className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDeleteClick}
                                    variant="outline"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Document Details */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <User className="w-4 h-4"/>
                                <span>Uploaded by: <span className="font-medium text-gray-700 dark:text-gray-300">
                {uploaderName || document?.uploadedBy || 'Unknown'}
            </span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4"/>
                                <span>Uploaded on: <span
                                    className="font-medium text-gray-700 dark:text-gray-300">{format(new Date(uploadedAt), 'PPP')}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4"/>
                                <span>Last modified: <span
                                    className="font-medium text-gray-700 dark:text-gray-300">{formatDistanceToNow(new Date(uploadedAt), {addSuffix: true})}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Tag className="w-4 h-4"/>
                                <span>Category: <Badge className={getCategoryBadge(category)}>{category}</Badge></span>
                            </div>
                        </div>

                        {document.description && (
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">{document.description}</p>
                            </div>
                        )}

                        {/* ✅ Viewer - Inline inside the page */}
                        {showViewer && (
                            <Viewer
                                documentId={document.id}
                                fileName={fileName}
                                fileType={fileType}
                                onClose={handleCloseViewer}
                                onDownload={handleDownload}
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex flex-wrap gap-3">
                            {viewable && !showViewer && (
                                <Button
                                    onClick={handleView}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View File
                                </Button>
                            )}
                            {showViewer && (
                                <Button
                                    onClick={handleCloseViewer}
                                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-500/20"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Close Viewer
                                </Button>
                            )}
                            <Button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                {downloading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                Download
                            </Button>
                            <Button
                                onClick={handleShareClick}
                                disabled={sharing}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                            >
                                {sharing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Share2 className="w-4 h-4 mr-2" />
                                )}
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                fileName={fileName}
                isDeleting={isDeleting}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    setCopied(false);
                }}
                shareLink={shareLink || ''}
                onCopy={handleCopyLink}
                copied={copied}
            />
        </>
    );
};

export default DocumentDetailPage;