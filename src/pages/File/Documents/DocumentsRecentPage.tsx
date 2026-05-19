import { DocumentSection } from '../../../components/file/documents/DocumentSection';
import type { DocumentItem } from '../../../components/file/documents/DocumentTable';

const SAMPLE: DocumentItem[] = [
  { id: '1', name: 'Employment_Contract_2026.pdf', contentType: 'application/pdf', size: '245 KB', updatedAt: '2026-05-10', owner: 'Admin',   folder: 'Contracts' },
  { id: '3', name: 'Employee_Photo.png',           contentType: 'image/png',       size: '540 KB', updatedAt: '2026-05-05', owner: 'HR',      folder: 'HR Documents' },
  { id: '2', name: 'Q1_Finance_Report.pdf',        contentType: 'application/pdf', size: '1.2 MB', updatedAt: '2026-05-08', owner: 'Finance', folder: 'Finance Reports' },
];

export default function DocumentsRecentPage() {
  return (
    <DocumentSection
      title="Recent Documents"
      subtitle="Files you've accessed recently"
      documents={SAMPLE}
      showUpload={false}
    />
  );
}
