import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Presentation,
  File,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface FileTypeConfig {
  label: string;
  icon: ReactNode;
  iconClass: string;
  bgClass: string;
  extensions: string[];
}

export const FILE_TYPE_MAP: Record<string, FileTypeConfig> = {
  // PDF
  'application/pdf': {
    label: 'PDF',
    icon: <FileText className="w-full h-full" />,
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50',
    extensions: ['pdf'],
  },
  // Word
  'application/msword': {
    label: 'Word',
    icon: <FileText className="w-full h-full" />,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    extensions: ['doc'],
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'Word',
    icon: <FileText className="w-full h-full" />,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    extensions: ['docx'],
  },
  // Excel
  'application/vnd.ms-excel': {
    label: 'Excel',
    icon: <FileSpreadsheet className="w-full h-full" />,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-50',
    extensions: ['xls'],
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    label: 'Excel',
    icon: <FileSpreadsheet className="w-full h-full" />,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-50',
    extensions: ['xlsx'],
  },
  // PowerPoint
  'application/vnd.ms-powerpoint': {
    label: 'PowerPoint',
    icon: <Presentation className="w-full h-full" />,
    iconClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
    extensions: ['ppt'],
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    label: 'PowerPoint',
    icon: <Presentation className="w-full h-full" />,
    iconClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
    extensions: ['pptx'],
  },
  // Images
  'image/jpeg': {
    label: 'Image',
    icon: <FileImage className="w-full h-full" />,
    iconClass: 'text-purple-500',
    bgClass: 'bg-purple-50',
    extensions: ['jpg', 'jpeg'],
  },
  'image/png': {
    label: 'Image',
    icon: <FileImage className="w-full h-full" />,
    iconClass: 'text-purple-500',
    bgClass: 'bg-purple-50',
    extensions: ['png'],
  },
  'image/gif': {
    label: 'GIF',
    icon: <FileImage className="w-full h-full" />,
    iconClass: 'text-pink-500',
    bgClass: 'bg-pink-50',
    extensions: ['gif'],
  },
  'image/svg+xml': {
    label: 'SVG',
    icon: <FileImage className="w-full h-full" />,
    iconClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50',
    extensions: ['svg'],
  },
  // Video
  'video/mp4': {
    label: 'Video',
    icon: <FileVideo className="w-full h-full" />,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    extensions: ['mp4'],
  },
  'video/quicktime': {
    label: 'Video',
    icon: <FileVideo className="w-full h-full" />,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    extensions: ['mov'],
  },
  'video/x-msvideo': {
    label: 'Video',
    icon: <FileVideo className="w-full h-full" />,
    iconClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    extensions: ['avi'],
  },
  // Audio
  'audio/mpeg': {
    label: 'Audio',
    icon: <FileAudio className="w-full h-full" />,
    iconClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
    extensions: ['mp3'],
  },
  'audio/wav': {
    label: 'Audio',
    icon: <FileAudio className="w-full h-full" />,
    iconClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
    extensions: ['wav'],
  },
  // Archives
  'application/zip': {
    label: 'ZIP',
    icon: <FileArchive className="w-full h-full" />,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    extensions: ['zip'],
  },
  'application/x-rar-compressed': {
    label: 'RAR',
    icon: <FileArchive className="w-full h-full" />,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    extensions: ['rar'],
  },
  // Code
  'text/plain': {
    label: 'Text',
    icon: <FileCode className="w-full h-full" />,
    iconClass: 'text-gray-600',
    bgClass: 'bg-gray-50',
    extensions: ['txt'],
  },
  'text/html': {
    label: 'HTML',
    icon: <FileCode className="w-full h-full" />,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    extensions: ['html', 'htm'],
  },
  'application/json': {
    label: 'JSON',
    icon: <FileCode className="w-full h-full" />,
    iconClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    extensions: ['json'],
  },
};

const FALLBACK: FileTypeConfig = {
  label: 'File',
  icon: <File className="w-full h-full" />,
  iconClass: 'text-gray-400',
  bgClass: 'bg-gray-50',
  extensions: [],
};

/** Get config by MIME type, falling back to extension match, then generic */
export function getFileTypeConfig(contentType: string, fileName?: string): FileTypeConfig {
  if (FILE_TYPE_MAP[contentType]) return FILE_TYPE_MAP[contentType];

  // Try by extension
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const match = Object.values(FILE_TYPE_MAP).find((c) => c.extensions.includes(ext));
    if (match) return match;
  }

  // Generic image fallback
  if (contentType.startsWith('image/')) {
    return { ...FALLBACK, label: 'Image', icon: <FileImage className="w-full h-full" />, iconClass: 'text-purple-400', bgClass: 'bg-purple-50' };
  }
  if (contentType.startsWith('video/')) {
    return { ...FALLBACK, label: 'Video', icon: <FileVideo className="w-full h-full" />, iconClass: 'text-violet-400', bgClass: 'bg-violet-50' };
  }
  if (contentType.startsWith('audio/')) {
    return { ...FALLBACK, label: 'Audio', icon: <FileAudio className="w-full h-full" />, iconClass: 'text-yellow-400', bgClass: 'bg-yellow-50' };
  }

  return FALLBACK;
}
