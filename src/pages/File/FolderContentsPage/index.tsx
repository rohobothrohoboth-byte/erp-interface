// src/pages/file/FolderContentsPage/index.tsx

import { FolderProvider } from '../../../contexts/FolderContext';
import { FolderContentsContent } from './FolderContentsContent';

export default function FolderContentsPage() {
    return (
        <FolderProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <FolderContentsContent />
                </div>
            </div>
        </FolderProvider>
    );
}