// components/settings/coreSettings/modules/DeleteModuleModal.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { ModuleDto } from '../../../../services/core/settings/ModCore/core-module.api';
import toast from 'react-hot-toast';

interface DeleteModuleModalProps {
    module: ModuleDto;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

const DeleteModuleModal: React.FC<DeleteModuleModalProps> = ({ module, onConfirm, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete module');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Module</h3>
                    <p className="text-gray-500 mb-4">
                        Are you sure you want to delete <span className="font-semibold">{module.desc}</span>?
                        <br />
                        <span className="text-sm text-red-500">This action cannot be undone.</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        Module key: <code className="font-mono">{module.key}</code>
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? 'Deleting...' : 'Delete Module'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteModuleModal;