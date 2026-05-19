import { FolderSection } from '../../../components/file/folders/FolderSection';
import type { FolderItem } from '../../../components/file/folders/FolderGrid';

const SAMPLE: FolderItem[] = [
  { id: '2', name: 'Finance Reports', fileCount: 12, updatedAt: '2026-05-08', type: 'personal', owner: 'Me' },
  { id: '6', name: 'Personal Notes',  fileCount: 3,  updatedAt: '2026-05-12', type: 'personal', owner: 'Me' },
];

export default function FoldersPersonalPage() {
  return (
    <FolderSection
      title="Personal Folders"
      subtitle="Your private folders"
      folders={SAMPLE}
    />
  );
}
