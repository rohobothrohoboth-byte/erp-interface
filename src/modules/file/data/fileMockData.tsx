import type { FolderItem, DocumentItem } from '@/modules/file/types/folder.types';

export const MOCK_FOLDERS: FolderItem[] = [
  // ── Company ────────────────────────────────────────────────────────────────
  { id: 'c-policies', name: 'Policies',      fileCount: 18, updatedAt: '2026-05-10', category: 'company',  owner: 'Admin',      description: 'Official company policies' },
  { id: 'c-reports',  name: 'Annual Reports',fileCount: 12, updatedAt: '2026-04-30', category: 'company',  owner: 'Admin',      description: 'Yearly financial and operational reports' },
  { id: 'c-legal',    name: 'Legal',         fileCount: 9,  updatedAt: '2026-04-15', category: 'company',  owner: 'Legal',      description: 'Contracts, agreements, and legal filings' },
  { id: 'c-hr',       name: 'HR',            fileCount: 34, updatedAt: '2026-05-12', category: 'company',  owner: 'HR',         description: 'HR forms, templates, and resources' },
  { id: 'c-projects', name: 'Projects',      fileCount: 27, updatedAt: '2026-05-08', category: 'company',  owner: 'Management', description: 'Company project files' },
  { id: 'c-it',       name: 'IT & Systems',  fileCount: 15, updatedAt: '2026-05-01', category: 'company',  owner: 'IT',         description: 'IT documentation and manuals' },

  // ── Personal ───────────────────────────────────────────────────────────────
  { id: 'p-reports',   name: 'My Reports',     fileCount: 7,  updatedAt: '2026-05-15', category: 'personal', owner: 'Me', description: 'Personal work reports' },
  { id: 'p-templates', name: 'My Templates',   fileCount: 5,  updatedAt: '2026-05-09', category: 'personal', owner: 'Me', description: 'Reusable document templates' },
  { id: 'p-notes',     name: 'Personal Notes', fileCount: 3,  updatedAt: '2026-05-13', category: 'personal', owner: 'Me', description: 'Private notes and drafts' },
  { id: 'p-archive',   name: 'Archive',        fileCount: 11, updatedAt: '2026-04-20', category: 'personal', owner: 'Me', description: 'Archived personal files' },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  // ── Company – Policies ─────────────────────────────────────────────────────
  { id: 'd7',   name: 'Employee Handbook.pdf',      contentType: 'application/pdf',               size: '2.1 MB', updatedAt: '2026-05-10', owner: 'Admin',   folderId: 'c-policies', folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd8',   name: 'Code of Conduct.pdf',        contentType: 'application/pdf',               size: '1.4 MB', updatedAt: '2026-04-28', owner: 'Admin',   folderId: 'c-policies', folderCategory: 'company', docPermission: 'view-only' },
  { id: 'd8b',  name: 'IT Security Policy.pdf',     contentType: 'application/pdf',               size: '980 KB', updatedAt: '2026-03-15', owner: 'IT',      folderId: 'c-policies', folderCategory: 'company', docPermission: 'view-only' },
  // ── Company – Annual Reports ───────────────────────────────────────────────
  { id: 'd9',   name: 'Annual Report 2025.pdf',     contentType: 'application/pdf',               size: '5.2 MB', updatedAt: '2026-04-30', owner: 'Admin',   folderId: 'c-reports',  folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd10',  name: 'Q4 Summary.xlsx',            contentType: 'application/vnd.ms-excel',      size: '1.8 MB', updatedAt: '2026-04-25', owner: 'Finance', folderId: 'c-reports',  folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd10b', name: 'Internal Draft 2026.docx',   contentType: 'application/msword',            size: '760 KB', updatedAt: '2026-05-01', owner: 'Finance', folderId: 'c-reports',  folderCategory: 'company', docPermission: 'view-only' },
  // ── Company – Legal ────────────────────────────────────────────────────────
  { id: 'd11',  name: 'Service Agreement.docx',     contentType: 'application/msword',            size: '890 KB', updatedAt: '2026-04-15', owner: 'Legal',   folderId: 'c-legal',    folderCategory: 'company', docPermission: 'view-only' },
  { id: 'd12',  name: 'NDA Template.docx',          contentType: 'application/msword',            size: '450 KB', updatedAt: '2026-03-10', owner: 'Legal',   folderId: 'c-legal',    folderCategory: 'company', docPermission: 'view-only' },
  { id: 'd12b', name: 'Employment Contract.pdf',    contentType: 'application/pdf',               size: '1.2 MB', updatedAt: '2026-02-20', owner: 'Legal',   folderId: 'c-legal',    folderCategory: 'company', docPermission: 'print-download' },
  // ── Company – HR ───────────────────────────────────────────────────────────
  { id: 'd13',  name: 'Leave Request Form.docx',    contentType: 'application/msword',            size: '340 KB', updatedAt: '2026-05-12', owner: 'HR',      folderId: 'c-hr',       folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd14',  name: 'Onboarding Checklist.xlsx',  contentType: 'application/vnd.ms-excel',      size: '520 KB', updatedAt: '2026-05-05', owner: 'HR',      folderId: 'c-hr',       folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd14b', name: 'Salary Structure 2026.xlsx', contentType: 'application/vnd.ms-excel',      size: '1.1 MB', updatedAt: '2026-01-10', owner: 'HR',      folderId: 'c-hr',       folderCategory: 'company', docPermission: 'view-only' },
  // ── Company – Projects ─────────────────────────────────────────────────────
  { id: 'd15',  name: 'Project Alpha Roadmap.pptx', contentType: 'application/vnd.ms-powerpoint', size: '4.1 MB', updatedAt: '2026-05-14', owner: 'Team A',  folderId: 'c-projects', folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd16',  name: 'Budget Plan.xlsx',           contentType: 'application/vnd.ms-excel',      size: '2.3 MB', updatedAt: '2026-05-11', owner: 'Finance', folderId: 'c-projects', folderCategory: 'company', docPermission: 'view-only' },
  { id: 'd16b', name: 'Risk Register.xlsx',         contentType: 'application/vnd.ms-excel',      size: '890 KB', updatedAt: '2026-05-09', owner: 'PMO',     folderId: 'c-projects', folderCategory: 'company', docPermission: 'view-only' },
  // ── Company – IT & Systems ─────────────────────────────────────────────────
  { id: 'd17',  name: 'IT Setup Guide.pdf',         contentType: 'application/pdf',               size: '3.4 MB', updatedAt: '2026-05-01', owner: 'IT',      folderId: 'c-it',       folderCategory: 'company', docPermission: 'print-download' },
  { id: 'd18',  name: 'Network Diagram.png',        contentType: 'image/png',                     size: '1.1 MB', updatedAt: '2026-04-10', owner: 'IT',      folderId: 'c-it',       folderCategory: 'company', docPermission: 'view-only' },
  { id: 'd18b', name: 'Server Inventory.xlsx',      contentType: 'application/vnd.ms-excel',      size: '670 KB', updatedAt: '2026-03-22', owner: 'IT',      folderId: 'c-it',       folderCategory: 'company', docPermission: 'view-only' },
  // ── Personal ───────────────────────────────────────────────────────────────
  { id: 'd19',  name: 'Q1 Report.xlsx',              contentType: 'application/vnd.ms-excel',      size: '2.3 MB',  updatedAt: '2026-05-15', owner: 'Me', folderId: 'p-reports',   folderCategory: 'personal' },
  { id: 'd20',  name: 'Presentation Draft.pptx',    contentType: 'application/vnd.ms-powerpoint', size: '3.8 MB',  updatedAt: '2026-05-14', owner: 'Me', folderId: 'p-reports',   folderCategory: 'personal' },
  { id: 'd21',  name: 'Meeting Notes Template.docx',contentType: 'application/msword',            size: '210 KB',  updatedAt: '2026-05-09', owner: 'Me', folderId: 'p-templates', folderCategory: 'personal', isFavorite: true },
  { id: 'd22',  name: 'Personal Budget.xlsx',        contentType: 'application/vnd.ms-excel',      size: '780 KB',  updatedAt: '2026-05-13', owner: 'Me', folderId: 'p-notes',     folderCategory: 'personal' },
  { id: 'd23',  name: 'Old Contracts.zip',           contentType: 'application/zip',               size: '12.4 MB', updatedAt: '2026-04-20', owner: 'Me', folderId: 'p-archive',   folderCategory: 'personal' },
];
