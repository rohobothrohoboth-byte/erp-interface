// src/pages/file/FileDashboard.tsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Sun, Moon, Activity, Shield, Sparkles,
  FolderOpen, FileText, Image, Video, Music, Archive,
  Download, Share2, Star, Clock, HardDrive,
  Cloud, Lock, Users, Loader2, Eye,
  Building2, Folder, User, Globe, ChevronRight,
  Plus, Search, Filter, Grid, List, Upload,
  Trash2, Edit, MoreVertical, Check, X,
  AlertCircle, File, Home, PieChart, BarChart3,
  FolderPlus
} from 'lucide-react';
import { DashboardProvider, useDashboard } from '@/shared/contexts/DashboardContext';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { useFolders } from '@/shared/contexts/FolderContext';
import { FolderProvider } from '@/shared/contexts/FolderContext';
import { uploadFile } from '@/modules/file/services/fileManagement/fileManagementApi';

// ============================================================
// TYPES
// ============================================================

interface FileDocument {
  id: string;
  name: string;
  fileName?: string;
  size?: number;
  fileSize?: number;
  fileSizeFormatted?: string;
  type?: string;
  fileType?: string;
  contentType?: string;
  mimeType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt?: string;
  dateMod?: string;
  isFavorite?: boolean;
  isStarred?: boolean;
  folderId?: string;
  folderName?: string;
  path?: string;
  filePath?: string;
  thumbnail?: string;
  extension?: string;
  version?: number;
  sharingLevel?: string;
  isShared?: boolean;
  isPublic?: boolean;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getDocProperty = (doc: any, key: string): any => {
  if (!doc) return undefined;
  const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  return doc[camelKey] !== undefined ? doc[camelKey] : doc[pascalKey];
};

const getFileName = (doc: any): string => {
  return getDocProperty(doc, 'name') || getDocProperty(doc, 'fileName') || 'Unknown file';
};

const getFileSize = (doc: any): string => {
  const size = getDocProperty(doc, 'size') || getDocProperty(doc, 'fileSize') || getDocProperty(doc, 'fileSizeFormatted');
  if (typeof size === 'string') return size;
  if (typeof size === 'number') {
    if (size > 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size > 1024) return `${(size / 1024).toFixed(0)} KB`;
    return `${size} bytes`;
  }
  return '0 KB';
};

const getFileOwner = (doc: any): string => {
  const owner = getDocProperty(doc, 'owner') || getDocProperty(doc, 'uploadedBy') || getDocProperty(doc, 'uploadedByName');
  if (owner === 'b6ef402d-f7f2-4b9d-90fa-faf507e0961c') return 'Me';
  return owner || 'Unknown';
};

const getUpdatedAt = (doc: any): string => {
  return getDocProperty(doc, 'updatedAt') || getDocProperty(doc, 'uploadedAt') || getDocProperty(doc, 'dateMod');
};

const getContentType = (doc: any): string => {
  return getDocProperty(doc, 'contentType') || getDocProperty(doc, 'fileType') || getDocProperty(doc, 'mimeType') || '';
};

const getIsFavorite = (doc: any): boolean => {
  return getDocProperty(doc, 'isFavorite') || getDocProperty(doc, 'isStarred') || false;
};

const getFileId = (doc: any): string => {
  return getDocProperty(doc, 'id') || `doc-${Math.random()}`;
};

// ============================================================
// DARK MODE HOOK
// ============================================================

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  return { isDarkMode, toggleDarkMode };
};

// ============================================================
// COMPONENTS
// ============================================================

// ✅ Quick Stats Component
const QuickStats = () => {
  const { stats } = useDashboard() || {};
  const { t } = useLanguage();

  const statItems = [
    { label: t.totalFiles || 'Total Files', value: stats?.totalFiles?.toLocaleString() || '0', icon: FileText, color: 'blue' },
    { label: t.folders || 'Folders', value: stats?.totalFolders?.toLocaleString() || '0', icon: FolderOpen, color: 'cyan' },
    { label: t.images || 'Images', value: stats?.totalImages?.toLocaleString() || '0', icon: Image, color: 'purple' },
    { label: t.videos || 'Videos', value: stats?.totalVideos?.toLocaleString() || '0', icon: Video, color: 'red' },
    { label: t.audio || 'Audio', value: stats?.totalAudio?.toLocaleString() || '0', icon: Music, color: 'green' },
    { label: t.archives || 'Archives', value: stats?.totalArchives?.toLocaleString() || '0', icon: Archive, color: 'amber' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  };

  return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
              <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
          );
        })}
      </div>
  );
};

// ✅ Quick Access Cards Component
const QuickAccessCards = () => {
  const navigate = useNavigate();
  const { folders = [] } = useDashboard() || {};
  const { t } = useLanguage();

  const cards = [
    {
      title: t.companyDocuments || 'Company Documents',
      icon: Building2,
      color: 'blue',
      path: '/file/documents/company',
      count: folders.filter(f => f?.type === 'company' || f?.type === 'organization').length,
      description: t.companyDocsDesc || 'Organization-wide documents'
    },
    {
      title: t.myFolders || 'My Folders',
      icon: FolderOpen,
      color: 'green',
      path: '/file/folders/personal',
      count: folders.filter(f => f?.type === 'personal' || f?.type === 'my').length,
      description: t.myFoldersDesc || 'Your personal folders'
    },
    {
      title: t.sharedDocuments || 'Shared Documents',
      icon: Users,
      color: 'purple',
      path: '/file/documents/shared',
      count: folders.filter(f => f?.type === 'shared').length,
      description: t.sharedDocsDesc || 'Documents shared with you'
    },
    {
      title: t.recentFiles || 'Recent Files',
      icon: Clock,
      color: 'amber',
      path: '/file/documents/recent',
      count: 0,
      description: t.recentFilesDesc || 'Recently accessed files'
    },
    {
      title: t.starred || 'Starred',
      icon: Star,
      color: 'yellow',
      path: '/file/documents/starred',
      count: 0,
      description: t.starredDesc || 'Your favorite files'
    },
    {
      title: t.archive || 'Archive',
      icon: Archive,
      color: 'gray',
      path: '/file/documents/archive',
      count: folders.filter(f => f?.type === 'archive').length,
      description: t.archiveDesc || 'Archived documents'
    },
  ];

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
    green: 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50',
    purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50',
    amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
    yellow: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50',
    gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:bg-gray-800/50',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
              <motion.div
                  key={card.title}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(card.path)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${colorClasses[card.color as keyof typeof colorClasses]}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-white/60 dark:bg-white/10 ${iconColorClasses[card.color as keyof typeof iconColorClasses]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{card.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
                  {card.count > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {card.count} {t.items || 'items'}
                      </Badge>
                  )}
                </div>
              </motion.div>
          );
        })}
      </div>
  );
};

// ✅ File Icon Helper
const getFileIcon = (contentType: string, fileName?: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';

  if (contentType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return <Image className="w-4 h-4 text-purple-500" />;
  }
  if (contentType?.includes('pdf') || ext === 'pdf') {
    return <FileText className="w-4 h-4 text-red-500" />;
  }
  if (contentType?.includes('excel') || contentType?.includes('spreadsheet') || ['xls', 'xlsx', 'csv', 'tsv'].includes(ext)) {
    return <FileText className="w-4 h-4 text-green-500" />;
  }
  if (contentType?.includes('word') || contentType?.includes('document') || ['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className="w-4 h-4 text-blue-500" />;
  }
  if (contentType?.includes('presentation') || contentType?.includes('powerpoint') || ['ppt', 'pptx', 'key'].includes(ext)) {
    return <FileText className="w-4 h-4 text-orange-500" />;
  }
  if (contentType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return <Video className="w-4 h-4 text-red-400" />;
  }
  if (contentType?.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
    return <Music className="w-4 h-4 text-green-400" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return <Archive className="w-4 h-4 text-amber-500" />;
  }
  return <FileText className="w-4 h-4 text-gray-500" />;
};

// ✅ Recent Files Section
const RecentFilesSection = () => {
  const { recentFiles = [], loading = true } = useDashboard() || {};
  const navigate = useNavigate();
  const { t } = useLanguage();

  const hasFiles = Array.isArray(recentFiles) && recentFiles.length > 0;

  if (loading) {
    return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{t.loading || 'Loading...'}</span>
        </div>
    );
  }

  return (
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            {t.recentFiles || 'Recent Files'}
          </h3>
          <button
              onClick={() => navigate('/file/documents/recent')}
              className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {t.viewAll || 'View all'}
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {!hasFiles ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t.noRecentFiles || 'No recent files'}</p>
              </div>
          ) : (
              recentFiles.slice(0, 5).map((file) => {
                const id = getFileId(file);
                const name = getFileName(file);
                const size = getFileSize(file);
                const owner = getFileOwner(file);
                const updatedAt = getUpdatedAt(file);
                const contentType = getContentType(file);
                const isFavorite = getIsFavorite(file);

                return (
                    <motion.div
                        key={id}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        onClick={() => navigate(`/file/document/${id}`)}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(contentType, name)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-[300px]">
                            {name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {size} • {owner}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                    {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'N/A'}
                  </span>
                        {isFavorite && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </motion.div>
                );
              })
          )}
        </div>
      </div>
  );
};

// ✅ Storage Stats Component
const StorageStats = () => {
  const { stats } = useDashboard() || {};
  const { t } = useLanguage();

  // ✅ Debug: Log stats to see what's coming through
  console.log('📊 [StorageStats] Current stats:', stats);

  // ✅ Use actual values from stats
  const storageUsed = stats?.storageUsed || 0;
  const totalStorage = stats?.totalStorage || 100;
  const percentage = totalStorage > 0 ? (storageUsed / totalStorage) * 100 : 0;

  const getColor = (pct: number) => {
    if (pct > 90) return 'bg-red-500';
    if (pct > 70) return 'bg-yellow-500';
    return 'bg-cyan-500';
  };
  const formatGB = (value: number) => {
    if (value < 0.01) {
      // Show in MB if less than 0.01 GB
      const mb = value * 1024;
      if (mb < 1) {
        return `${(mb * 1024).toFixed(0)} KB`;
      }
      return `${mb.toFixed(2)} MB`;
    }
    return `${value.toFixed(2)} GB`;
  };

  return (
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-cyan-500" />
          {t.storageUsage || 'Storage Usage'}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t.usedSpace || 'Used Space'}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatGB(storageUsed)} / {formatGB(totalStorage)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${getColor(percentage)}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{t.available || 'Available'}: {formatGB(totalStorage - storageUsed)}</span>
            <span>{percentage.toFixed(1)}% {t.used || 'used'}</span>
          </div>
        </div>
      </div>
  );
};

// ============================================================
// QUICK ACTIONS WITH MODALS - FIXED
// ============================================================

const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { folders = [], refreshDashboard } = useDashboard() || {};
  const { createFolder } = useFolders() || {};

  // Upload state


  // Create folder state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [creating, setCreating] = useState(false);


  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast.warning('Please select a file first');
      return;
    }

    if (!selectedCategory) {
      showToast.warning('Please select a category');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await uploadFile({
        file: selectedFile,
        module: 'file',
        category: selectedCategory,
        documentType: selectedFile.type.includes('pdf') ? 'PDF' : selectedFile.type.split('/')[0] || 'Other',
        description: description || selectedFile.name,
        isPublic: false,
        isShared: false,
        sharingLevel: 'Private',
      });

      clearInterval(interval);
      setUploadProgress(100);

      showToast.success(`File "${selectedFile.name}" uploaded successfully`);

      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setSelectedCategory('');
        setDescription('');
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh the dashboard
        if (refreshDashboard) {
          refreshDashboard();
        }
      }, 500);
    } catch (error: any) {
      console.error('Upload failed:', error);
      showToast.error(error?.message || 'Failed to upload file');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Create folder handler
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      showToast.warning('Please enter a folder name');
      return;
    }

    setCreating(true);
    try {
      await createFolder?.({
        name: folderName.trim(),
        description: folderDescription.trim(),
        folderType: 'company',
        isPublic: true,
        isShared: true,
        sharingLevel: 'Company',
      });

      showToast.success(`Folder "${folderName}" created successfully`);
      setShowCreateFolderModal(false);
      setFolderName('');
      setFolderDescription('');
      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (error: any) {
      console.error('Create folder failed:', error);
      showToast.error(error?.message || 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  return (
      <>
        <div className="flex flex-wrap gap-2">
          {/* Upload Button */}
          <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/30 dark:hover:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 rounded-lg transition-all hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            {t.uploadFile || 'Upload File'}
          </button>
          <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
          />

          {/* Create Folder Button */}
          <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg transition-all hover:shadow-md"
          >
            <FolderPlus className="w-4 h-4" />
            {t.createFolder || 'Create Folder'}
          </button>

          {/* Search Button */}
          <button
              onClick={() => navigate('/file/documents/recent')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-400 rounded-lg transition-all hover:shadow-md"
          >
            <Search className="w-4 h-4" />
            {t.searchFiles || 'Search Files'}
          </button>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Upload File
                      </h2>
                    </div>
                    <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setSelectedFile(null);
                          setUploadProgress(0);
                          setSelectedCategory('');
                          setDescription('');
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* File Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select File <span className="text-red-500">*</span>
                      </label>
                      <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 dark:file:bg-cyan-950/50 dark:file:text-cyan-400 hover:file:bg-cyan-100 dark:hover:file:bg-cyan-950/70"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="">Select a category...</option>
                        <option value="document">📄 Document</option>
                        <option value="image">🖼️ Image</option>
                        <option value="pdf">📕 PDF</option>
                        <option value="spreadsheet">📊 Spreadsheet</option>
                        <option value="presentation">📑 Presentation</option>
                        <option value="archive">📦 Archive</option>
                        <option value="other">📎 Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter a description (optional)"
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white resize-none"
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
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-red-500"
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
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                    )}

                    {/* Quick Category Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">Quick categories:</span>
                      {['document', 'image', 'pdf', 'spreadsheet', 'presentation', 'archive'].map((cat) => (
                          <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                                  selectedCategory === cat
                                      ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
                              }`}
                          >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setSelectedFile(null);
                          setUploadProgress(0);
                          setSelectedCategory('');
                          setDescription('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedFile || !selectedCategory || uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>

        {/* Create Folder Modal */}
        <AnimatePresence>
          {showCreateFolderModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Create Folder
                      </h2>
                    </div>
                    <button
                        onClick={() => {
                          setShowCreateFolderModal(false);
                          setFolderName('');
                          setFolderDescription('');
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Folder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="text"
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          placeholder="Enter folder name"
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                          autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                          value={folderDescription}
                          onChange={(e) => setFolderDescription(e.target.value)}
                          placeholder="Enter description (optional)"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => {
                          setShowCreateFolderModal(false);
                          setFolderName('');
                          setFolderDescription('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleCreateFolder}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!folderName.trim() || creating}
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </>
  );
};

// ============================================================
// MAIN DASHBOARD CONTENT
// ============================================================

const FileDashboardContent = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { refreshing = false, refreshDashboard, error } = useDashboard() || {};
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRefresh = async () => {
    if (refreshDashboard) {
      await refreshDashboard();
      showToast.success(t.refreshed || 'Dashboard refreshed');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 260,
        damping: 20,
        duration: prefersReducedMotion ? 0.3 : undefined,
      },
    },
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 dark:from-cyan-400/5 dark:to-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Error Banner */}
          {error && (
              <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="ml-auto text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  {t.retry || 'Retry'}
                </button>
              </motion.div>
          )}

          {/* Header */}
          <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                {t.fileManagement || 'File Management'}
              </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {t.documentManagement || 'Document Management System'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.docManagementDesc || 'Organize, store, and manage all your documents in one place'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </span>
              </div>

              <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={t.toggleTheme || 'Toggle theme'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-950/50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? t.refreshing || 'Refreshing...' : t.refresh || 'Refresh'}</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
          >
            <QuickActions />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
          >
            <QuickStats />
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-6"
          >
            <QuickAccessCards />
          </motion.div>

          {/* Storage & Recent Files */}
          <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-1">
              <StorageStats />
            </div>
            <div className="lg:col-span-2">
              <RecentFilesSection />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center pt-4 mt-6"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{t.cloudSyncActive || 'Cloud Sync Active'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3" />
                <span>{t.endToEndEncrypted || 'End-to-End Encrypted'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Cloud className="w-3 h-3" />
                <span>{t.autoBackup || 'Auto Backup'}</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>{t.version || 'Version'} 2.0</span>
              </div>
            </div>
          </motion.div>
        </div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
        .dark .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}</style>
      </div>
  );
};

// ============================================================
// EXPORT WITH PROVIDER
// ============================================================

export default function FileDashboard() {
  return (
      <FolderProvider>
        <DashboardProvider>
          <FileDashboardContent />
        </DashboardProvider>
      </FolderProvider>
  );
}