import { FolderSection } from '../../../components/file/folders/FolderSection';
import type { FolderItem } from '../../../components/file/folders/FolderGrid';

const SAMPLE: FolderItem[] = [
  { id: '1', name: 'HR Documents',    fileCount: 24, updatedAt: '2026-05-10', type: 'shared',   owner: 'Admin' },
  { id: '2', name: 'Finance Reports', fileCount: 12, updatedAt: '2026-05-08', type: 'personal', owner: 'Me' },
  { id: '3', name: 'Contracts',       fileCount: 8,  updatedAt: '2026-05-01', type: 'shared',   owner: 'Legal' },
  { id: '4', name: 'Policies',        fileCount: 5,  updatedAt: '2026-04-28', type: 'public',   owner: 'Admin' },
  { id: '5', name: 'Training',        fileCount: 17, updatedAt: '2026-04-20', type: 'shared',   owner: 'HR' },
  { id: '6', name: 'Personal Notes',  fileCount: 3,  updatedAt: '2026-05-12', type: 'personal', owner: 'Me' },
];

export default function FoldersAllPage() {
  return (
    <FolderSection
      title="All Folders"
      subtitle="Browse all folders you have access to"
      folders={SAMPLE}
    />
  );
}
