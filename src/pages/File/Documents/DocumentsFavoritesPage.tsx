// src/pages/file/DocumentsFavoritesPage.tsx

import { DocumentSection } from '../../components/file/documents/DocumentSection';
import { DocumentProvider } from '../../contexts/DocumentContext';

export default function DocumentsFavoritesPage() {
  return (
      <DocumentProvider>
        <DocumentSection
            title="Favorites"
            subtitle="Files you've starred for quick access"
            filterBy="favorites"
            showUpload={false}
        />
      </DocumentProvider>
  );
}