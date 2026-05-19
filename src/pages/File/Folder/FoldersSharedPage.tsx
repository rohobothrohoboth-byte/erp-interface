import { FolderSection } from '../../../components/file/folders/FolderSection';
import type { FolderItem } from '../../../components/file/folders/FolderGrid';

const SAMPLE: FolderItem[] = [
  { id: '1', name: 'HR Documents',    fileCount: 24, updatedAt: '2026-05-10', type: 'shared', owner: 'Admin' },
  { id: '3', name: 'Contracts',       fileCount: 8,  updatedAt: '2026-05-01', type: 'shared', owner: 'Legal' },
  { id: '5', name: 'Training',        fileCount: 17, updatedAt: '2026-04-20', type: 'shared', owner: 'HR' },
];

export default function FoldersSharedPage() {
  return (
    <FolderSection
      title="Shared Folders"
      subtitle="Folders shared with you by others"
      folders={SAMPLE}
      showNew={false}
    />
  );
}
