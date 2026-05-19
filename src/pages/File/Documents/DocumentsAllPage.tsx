import { DocumentSection } from '../../../components/file/documents/DocumentSection';
import type { DocumentItem } from '../../../components/file/documents/DocumentTable';

const SAMPLE: DocumentItem[] = [
  { id: '1', name: 'Employment_Contract_2026.pdf', contentType: 'application/pdf', size: '245 KB', updatedAt: '2026-05-10', owner: 'Admin',   folder: 'Contracts',    isFavorite: true },
  { id: '2', name: 'Q1_Finance_Report.pdf',        contentType: 'application/pdf', size: '1.2 MB', updatedAt: '2026-05-08', owner: 'Finance', folder: 'Finance Reports' },
  { id: '3', name: 'Employee_Photo.png',           contentType: 'image/png',       size: '540 KB', updatedAt: '2026-05-05', owner: 'HR',      folder: 'HR Documents' },
  { id: '4', name: 'Leave_Policy.pdf',             contentType: 'application/pdf', size: '180 KB', updatedAt: '2026-04-28', owner: 'Admin',   folder: 'Policies',     isFavorite: true },
  { id: '5', name: 'Training_Schedule.pdf',        contentType: 'application/pdf', size: '320 KB', updatedAt: '2026-04-20', owner: 'HR',      folder: 'Training' },
];

export default function DocumentsAllPage() {
  return (
    <DocumentSection
      title="All Documents"
      subtitle="All files you have access to"
      documents={SAMPLE}
    />
  );
}
