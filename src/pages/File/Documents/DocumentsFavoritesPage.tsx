import { DocumentSection } from '../../../components/file/documents/DocumentSection';
import type { DocumentItem } from '../../../components/file/documents/DocumentTable';

const SAMPLE: DocumentItem[] = [
  { id: '1', name: 'Employment_Contract_2026.pdf', contentType: 'application/pdf', size: '245 KB', updatedAt: '2026-05-10', owner: 'Admin', folder: 'Contracts',  isFavorite: true },
  { id: '4', name: 'Leave_Policy.pdf',             contentType: 'application/pdf', size: '180 KB', updatedAt: '2026-04-28', owner: 'Admin', folder: 'Policies',   isFavorite: true },
];

export default function DocumentsFavoritesPage() {
  return (
    <DocumentSection
      title="Favorites"
      subtitle="Files you've starred for quick access"
      documents={SAMPLE}
      showUpload={false}
    />
  );
}
