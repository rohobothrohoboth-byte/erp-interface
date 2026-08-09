// src/pages/public/PublicFileView.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    File, Download, Clock, User, Calendar,
    FileText, Image, FileSpreadsheet, Video, Music, Archive,
    AlertCircle, Loader2, CheckCircle, XCircle, Eye,
    Maximize2, Minimize2, Play, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    getPublicFileInfo,
    downloadPublicFile,
    viewPublicFile
} from '../../services/fileManagement/publicFileManagementApi';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { showToast } from '../../layout/layout';

interface PublicFileInfo {
    fileName: string;
    originalFileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    contentType: string;
    token: string;
    expiresAt: string;
    uploadedBy: string;
    uploadedAt: string;
    description: string;
    isValid: boolean;
    errorMessage: string;
    // ✅ Add this field
    createdByName: string;
}

const PublicFileView = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [fileInfo, setFileInfo] = useState<PublicFileInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [viewing, setViewing] = useState(false);
    const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
    const [showViewer, setShowViewer] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // LOAD FILE INFO
    // ============================================================

    useEffect(() => {
        const loadFileInfo = async () => {
            if (!token) {
                setError('Invalid share link');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getPublicFileInfo(token);

                if (response?.data) {
                    const data = response.data;
                    if (data.isValid) {
                        setFileInfo(data);
                    } else {
                        setError(data.errorMessage || 'Invalid share link');
                    }
                } else {
                    setError('Failed to load file information');
                }
            } catch (error: any) {
                console.error('Failed to load file info:', error);
                setError(error?.response?.data?.message || 'Failed to load file');
            } finally {
                setLoading(false);
            }
        };

        loadFileInfo();
    }, [token]);

    // ============================================================
    // DOWNLOAD FILE
    // ============================================================

    const handleDownload = async () => {
        if (!token) return;

        try {
            setDownloading(true);
            const blob = await downloadPublicFile(token);

            if (!blob || blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileInfo?.originalFileName || 'download';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            showToast.success('File downloaded successfully');
        } catch (error: any) {
            console.error('Download failed:', error);
            showToast.error(error?.message || 'Failed to download file');
        } finally {
            setDownloading(false);
        }
    };

    // ============================================================
    // VIEW FILE
    // ============================================================

    const handleView = async () => {
        if (!token) return;

        try {
            setViewing(true);
            setShowViewer(true);

            const blob = await viewPublicFile(token);

            if (!blob || blob.size === 0) {
                throw new Error('File is empty');
            }

            const objectUrl = URL.createObjectURL(blob);
            setFileObjectUrl(objectUrl);

            showToast.success('File loaded successfully');
        } catch (error: any) {
            console.error('View failed:', error);
            showToast.error(error?.message || 'Failed to view file');
            setShowViewer(false);
        } finally {
            setViewing(false);
        }
    };

    const closeViewer = () => {
        setShowViewer(false);
        if (fileObjectUrl) {
            URL.revokeObjectURL(fileObjectUrl);
            setFileObjectUrl(null);
        }
        if (isFullscreen) {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const toggleFullscreen = () => {
        const viewerElement = document.getElementById('file-viewer-container');
        if (!viewerElement) return;

        if (!document.fullscreenElement) {
            viewerElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    // ============================================================
    // CHECK IF FILE IS VIEWABLE
    // ============================================================

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

    // ============================================================
    // RENDER FILE VIEWER
    // ============================================================

    const renderViewer = () => {
        if (!fileObjectUrl || !fileInfo) return null;

        const type = fileInfo.contentType?.toLowerCase() || '';
        const ext = fileInfo.fileName?.split('.').pop()?.toLowerCase() || '';

        if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <img
                        src={fileObjectUrl}
                        alt={fileInfo.originalFileName}
                        className="max-w-full max-h-full object-contain"
                        onError={() => {
                            console.error('Failed to load image');
                            showToast.error('Failed to load image');
                        }}
                    />
                </div>
            );
        }

        if (type.includes('pdf') || ext === 'pdf') {
            return (
                <div className="w-full h-full">
                    <embed
                        src={fileObjectUrl}
                        type="application/pdf"
                        className="w-full h-full"
                        title={fileInfo.originalFileName}
                    />
                </div>
            );
        }

        if (type.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <video
                        controls
                        className="max-w-full max-h-full"
                        autoPlay
                        playsInline
                    >
                        <source src={fileObjectUrl} type={fileInfo.contentType} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="mb-8">
                        {getFileIcon(fileInfo.contentType, fileInfo.fileName)}
                    </div>
                    <audio
                        controls
                        className="w-full max-w-md"
                        autoPlay
                    >
                        <source src={fileObjectUrl} type={fileInfo.contentType} />
                        Your browser does not support the audio tag.
                    </audio>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {fileInfo.originalFileName}
                    </p>
                </div>
            );
        }

        if (type.startsWith('text/') || ['txt', 'csv', 'md', 'xml', 'json'].includes(ext)) {
            return (
                <div className="w-full h-full overflow-auto p-6 bg-white dark:bg-slate-900">
                    <iframe
                        src={fileObjectUrl}
                        className="w-full h-full border-0"
                        title={fileInfo.originalFileName}
                        sandbox="allow-scripts"
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6">
                    {getFileIcon(fileInfo.contentType, fileInfo.fileName)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {fileInfo.originalFileName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {fileInfo.fileSizeFormatted} • {getFileTypeLabel(fileInfo.contentType, fileInfo.fileName)}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    This file type cannot be previewed directly.
                </p>
                <Button
                    onClick={handleDownload}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                </Button>
            </div>
        );
    };

    // ============================================================
    // GET FILE ICON
    // ============================================================

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

    // ============================================================
    // GET FILE TYPE LABEL
    // ============================================================

    const getFileTypeLabel = (contentType: string, fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase() || '';
        const type = contentType?.toLowerCase() || '';

        if (type.startsWith('image/')) return 'Image';
        if (type.includes('pdf')) return 'PDF';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'Spreadsheet';
        if (type.includes('word') || type.includes('document')) return 'Document';
        if (type.startsWith('video/')) return 'Video';
        if (type.startsWith('audio/')) return 'Audio';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Archive';
        return ext.toUpperCase() || 'File';
    };

    // ============================================================
    // FILE VIEWER MODAL
    // ============================================================

    const FileViewerModal = () => {
        if (!showViewer) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            >
                <div
                    id="file-viewer-container"
                    className="relative w-full h-full"
                >
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <File className="w-5 h-5" />
                                <span className="font-medium truncate max-w-xs">
                                    {fileInfo?.originalFileName}
                                </span>
                                <Badge className="bg-white/20 text-white border-0">
                                    {fileInfo?.fileSizeFormatted}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                >
                                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={closeViewer}
                                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full pt-16">
                        {viewing ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-12 h-12 animate-spin text-white" />
                            </div>
                        ) : (
                            renderViewer()
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading file...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-200 dark:border-slate-700 text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Share Link</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        This link may have expired or been removed by the owner.
                    </p>
                </div>
            </div>
        );
    }

    if (!fileInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-200 dark:border-slate-700 text-center">
                    <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">File Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400">The file you're looking for could not be found.</p>
                </div>
            </div>
        );
    }

    const isExpired = new Date(fileInfo.expiresAt) < new Date();

    if (isExpired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-200 dark:border-slate-700 text-center">
                    <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Expired</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        This share link has expired. Please contact the file owner for a new link.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Expired on: {new Date(fileInfo.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4 py-12 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <File className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shared File</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        You have been given access to this file
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File Info */}
                        <div className="p-6 space-y-6">
                            {/* File Icon & Name */}
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                    {getFileIcon(fileInfo.contentType, fileInfo.fileName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {fileInfo.originalFileName}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                            {getFileTypeLabel(fileInfo.contentType, fileInfo.fileName)}
                                        </Badge>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {fileInfo.fileSizeFormatted}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {fileInfo.description && (
                                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {fileInfo.description}
                                    </p>
                                </div>
                            )}

                            {/* File Details - ✅ Using createdByName from database */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <User className="w-4 h-4" />
                                    <span>Shared by: {fileInfo.createdByName || fileInfo.uploadedBy || 'Unknown User'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Shared on: {new Date(fileInfo.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <File className="w-4 h-4" />
                                    <span>Size: {fileInfo.fileSizeFormatted}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>Expires: {formatDistanceToNow(new Date(fileInfo.expiresAt), { addSuffix: true })}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {isViewable(fileInfo.contentType, fileInfo.fileName) && (
                                        <Button
                                            onClick={handleView}
                                            disabled={viewing}
                                            className="py-6 text-base bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {viewing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-5 h-5 mr-2" />
                                                    View File
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <Button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className={`py-6 text-base bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all ${!isViewable(fileInfo.contentType, fileInfo.fileName) ? 'col-span-2' : ''}`}
                                    >
                                        {downloading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5 mr-2" />
                                                Download File
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
                                    This link will expire on {new Date(fileInfo.expiresAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <FileViewerModal />
        </>
    );
};

export default PublicFileView;