import {
  FileImage, FileVideo, FileAudio, BookOpen, FileText,
  Briefcase, Scale, BarChart3, Users, Settings,
} from 'lucide-react';
import type { FolderItem, DocumentItem } from '../../types/file/folder.types';

export const MOCK_FOLDERS: FolderItem[] = [
  // ── Company (system folders with Windows-style icons) ──────────────────────
  {
    id: 'c-pictures',
    name: 'Pictures',
    fileCount: 42,
    updatedAt: '2026-05-10',
    category: 'company',
    owner: 'System',
    description: 'Company images and photos',
    systemIcon: <FileImage className="w-8 h-8 text-purple-500" />,
  },
  {
    id: 'c-videos',
    name: 'Videos',
    fileCount: 15,
    updatedAt: '2026-05-08',
    category: 'company',
    owner: 'System',
    description: 'Company video content',
    systemIcon: <FileVideo className="w-8 h-8 text-violet-500" />,
  },
  {
    id: 'c-audio',
    name: 'Audio',
    fileCount: 8,
    updatedAt: '2026-04-20',
    category: 'company',
    owner: 'System',
    description: 'Audio recordings and files',
    systemIcon: <FileAudio className="w-8 h-8 text-yellow-500" />,
  },
  {
    id: 'c-policies',
    name: 'Policies',
    fileCount: 18,
    updatedAt: '2026-05-10',
    category: 'company',
    owner: 'Admin',
    description: 'Official company policies',
    systemIcon: <BookOpen className="w-8 h-8 text-emerald-600" />,
  },
  {
    id: 'c-reports',
    name: 'Annual Reports',
    fileCount: 12,
    updatedAt: '2026-04-30',
    category: 'company',
    owner: 'Admin',
    description: 'Yearly financial and operational reports',
    systemIcon: <BarChart3 className="w-8 h-8 text-blue-500" />,
  },
  {
    id: 'c-legal',
    name: 'Legal',
    fileCount: 9,
    updatedAt: '2026-04-15',
    category: 'company',
    owner: 'Legal',
    description: 'Contracts, agreements, and legal filings',
    systemIcon: <Scale className="w-8 h-8 text-gray-600" />,
  },
  {
    id: 'c-hr',
    name: 'HR',
    fileCount: 34,
    updatedAt: '2026-05-12',
    category: 'company',
    owner: 'HR',
    description: 'HR forms, templates, and resources',
    systemIcon: <Users className="w-8 h-8 text-green-600" />,
  },
  {
    id: 'c-projects',
    name: 'Projects',
    fileCount: 27,
    updatedAt: '2026-05-08',
    category: 'company',
    owner: 'Management',
    description: 'Company project files',
    systemIcon: <Briefcase className="w-8 h-8 text-indigo-500" />,
  },
  {
    id: 'c-it',
    name: 'IT & Systems',
    fileCount: 15,
    updatedAt: '2026-05-01',
    category: 'company',
    owner: 'IT',
    description: 'IT documentation and manuals',
    systemIcon: <Settings className="w-8 h-8 text-slate-500" />,
  },

  // ── Personal (user-created, plain folder icon) ─────────────────────────────
  {
    id: 'p-reports',
    name: 'My Reports',
    fileCount: 7,
    updatedAt: '2026-05-15',
    category: 'personal',
    owner: 'Me',
    description: 'Personal work reports',
  },
  {
    id: 'p-templates',
    name: 'My Templates',
    fileCount: 5,
    updatedAt: '2026-05-09',
    category: 'personal',
    owner: 'Me',
    description: 'Reusable document templates',
  },
  {
    id: 'p-notes',
    name: 'Personal Notes',
    fileCount: 3,
    updatedAt: '2026-05-13',
    category: 'personal',
    owner: 'Me',
    description: 'Private notes and drafts',
  },
  {
    id: 'p-archive',
    name: 'Archive',
    fileCount: 11,
    updatedAt: '2026-04-20',
    category: 'personal',
    owner: 'Me',
    description: 'Archived personal files',
  },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  // Company – Pictures
  { id: 'd1',  name: 'Office Photo.jpg',          contentType: 'image/jpeg',   size: '3.2 MB', updatedAt: '2026-05-10', owner: 'Admin',   folderId: 'c-pictures', folderCategory: 'company' },
  { id: 'd2',  name: 'Team Event.png',             contentType: 'image/png',    size: '5.1 MB', updatedAt: '2026-05-08', owner: 'Admin',   folderId: 'c-pictures', folderCategory: 'company' },
  { id: 'd3',  name: 'Logo.svg',                   contentType: 'image/svg+xml',size: '120 KB', updatedAt: '2026-04-20', owner: 'Design',  folderId: 'c-pictures', folderCategory: 'company' },
  // Company – Videos
  { id: 'd4',  name: 'Company Intro.mp4',          contentType: 'video/mp4',    size: '45 MB',  updatedAt: '2026-05-08', owner: 'Marketing', folderId: 'c-videos', folderCategory: 'company' },
  { id: 'd5',  name: 'Training Video.mp4',         contentType: 'video/mp4',    size: '120 MB', updatedAt: '2026-04-15', owner: 'HR',      folderId: 'c-videos', folderCategory: 'company' },
  // Company – Audio
  { id: 'd6',  name: 'Board Meeting Recording.mp3',contentType: 'audio/mpeg',   size: '18 MB',  updatedAt: '2026-04-20', owner: 'Admin',   folderId: 'c-audio', folderCategory: 'company' },
  // Company – Policies
  { id: 'd7',  name: 'Employee Handbook.pdf',      contentType: 'application/pdf', size: '2.1 MB', updatedAt: '2026-05-10', owner: 'Admin', folderId: 'c-policies', folderCategory: 'company' },
  { id: 'd8',  name: 'Code of Conduct.pdf',        contentType: 'application/pdf', size: '1.4 MB', updatedAt: '2026-04-28', owner: 'Admin', folderId: 'c-policies', folderCategory: 'company' },
  // Company – Reports
  { id: 'd9',  name: 'Annual Report 2025.pdf',     contentType: 'application/pdf', size: '5.2 MB', updatedAt: '2026-04-30', owner: 'Admin', folderId: 'c-reports', folderCategory: 'company' },
  { id: 'd10', name: 'Q4 Summary.xlsx',            contentType: 'application/vnd.ms-excel', size: '1.8 MB', updatedAt: '2026-04-25', owner: 'Finance', folderId: 'c-reports', folderCategory: 'company' },
  // Company – Legal
  { id: 'd11', name: 'Service Agreement.docx',     contentType: 'application/msword', size: '890 KB', updatedAt: '2026-04-15', owner: 'Legal', folderId: 'c-legal', folderCategory: 'company' },
  { id: 'd12', name: 'NDA Template.docx',          contentType: 'application/msword', size: '450 KB', updatedAt: '2026-03-10', owner: 'Legal', folderId: 'c-legal', folderCategory: 'company' },
  // Company – HR
  { id: 'd13', name: 'Leave Request Form.docx',    contentType: 'application/msword', size: '340 KB', updatedAt: '2026-05-12', owner: 'HR', folderId: 'c-hr', folderCategory: 'company' },
  { id: 'd14', name: 'Onboarding Checklist.xlsx',  contentType: 'application/vnd.ms-excel', size: '520 KB', updatedAt: '2026-05-05', owner: 'HR', folderId: 'c-hr', folderCategory: 'company' },
  // Company – Projects
  { id: 'd15', name: 'Project Alpha Roadmap.pptx', contentType: 'application/vnd.ms-powerpoint', size: '4.1 MB', updatedAt: '2026-05-14', owner: 'Team A', folderId: 'c-projects', folderCategory: 'company' },
  { id: 'd16', name: 'Budget Plan.xlsx',           contentType: 'application/vnd.ms-excel', size: '2.3 MB', updatedAt: '2026-05-11', owner: 'Finance', folderId: 'c-projects', folderCategory: 'company' },
  // Company – IT
  { id: 'd17', name: 'IT Setup Guide.pdf',         contentType: 'application/pdf', size: '3.4 MB', updatedAt: '2026-05-01', owner: 'IT', folderId: 'c-it', folderCategory: 'company' },
  { id: 'd18', name: 'Network Diagram.png',        contentType: 'image/png', size: '1.1 MB', updatedAt: '2026-04-10', owner: 'IT', folderId: 'c-it', folderCategory: 'company' },
  // Personal
  { id: 'd19', name: 'Q1 Report.xlsx',             contentType: 'application/vnd.ms-excel', size: '2.3 MB', updatedAt: '2026-05-15', owner: 'Me', folderId: 'p-reports', folderCategory: 'personal' },
  { id: 'd20', name: 'Meeting Notes.docx',         contentType: 'application/msword', size: '210 KB', updatedAt: '2026-05-09', owner: 'Me', folderId: 'p-templates', folderCategory: 'personal', isFavorite: true },
  { id: 'd21', name: 'Personal Budget.xlsx',       contentType: 'application/vnd.ms-excel', size: '780 KB', updatedAt: '2026-05-13', owner: 'Me', folderId: 'p-notes', folderCategory: 'personal' },
  { id: 'd22', name: 'Old Contracts.zip',          contentType: 'application/zip', size: '12.4 MB', updatedAt: '2026-04-20', owner: 'Me', folderId: 'p-archive', folderCategory: 'personal' },
  { id: 'd23', name: 'Presentation Draft.pptx',   contentType: 'application/vnd.ms-powerpoint', size: '3.8 MB', updatedAt: '2026-05-14', owner: 'Me', folderId: 'p-reports', folderCategory: 'personal' },
];
