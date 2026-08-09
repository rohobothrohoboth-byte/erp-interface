// src/pages/finance/budget/components/BudgetDeleteModal.tsx

import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';

interface BudgetDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    budgetName: string;
    isSubmitting: boolean;
}

export const BudgetDeleteModal: React.FC<BudgetDeleteModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onConfirm,
                                                                        budgetName,
                                                                        isSubmitting,
                                                                    }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Delete Budget
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong>{budgetName}</strong>?
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isSubmitting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};