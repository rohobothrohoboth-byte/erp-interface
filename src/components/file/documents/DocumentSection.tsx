import { useState } from 'react';
import { DocumentHeader } from './DocumentHeader';
import { DocumentTable, type DocumentItem } from './DocumentTable';

interface DocumentSectionProps {
  title: string;
  subtitle: string;
  documents: DocumentItem[];
  showUpload?: boolean;
}

export function DocumentSection({ title, subtitle, documents, showUpload = true }: DocumentSectionProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <DocumentHeader
        title={title}
        subtitle={subtitle}
        view={view}
        onViewChange={setView}
        onSearch={setQuery}
        onUpload={showUpload ? () => {} : undefined}
      />
      <DocumentTable documents={filtered} />
    </div>
  );
}
