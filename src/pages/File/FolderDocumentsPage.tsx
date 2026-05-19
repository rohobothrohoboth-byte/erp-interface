import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FolderDocumentsView } from '../../components/file/documents/FolderDocumentsView';
import type { FolderItem } from '../../types/file/folder.types';
import { MOCK_FOLDERS } from '../../data/file/fileMockData';

export default function FolderDocumentsPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer state passed via navigate(), fall back to mock data lookup
  const [folder, setFolder] = useState<FolderItem | null>(
    (location.state as any)?.folder ?? null
  );

  useEffect(() => {
    if (!folder && folderId) {
      const found = MOCK_FOLDERS.find((f) => f.id === folderId);
      if (found) setFolder(found);
      else navigate('/file', { replace: true });
    }
  }, [folderId, folder, navigate]);

  if (!folder) return null;

  return <FolderDocumentsView folder={folder} />;
}
