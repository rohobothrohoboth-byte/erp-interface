// src/pages/finance/budget/components/BudgetToggleModal.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';

interface BudgetToggleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    budgetName: string;
    currentStatus: string;
    isSubmitting: boolean;
}

export const BudgetToggleModal: React.FC<BudgetToggleModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onConfirm,
                                                                        budgetName,
                                                                        currentStatus,
                                                                        isSubmitting,
                                                                    }) => {
    const isActive = currentStatus === 'Active';
    const action = isActive ? 'Deactivate' : 'Activate';
    const description = isActive
        ? 'This budget will become inactive.'
        : 'This budget will become active.';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${isActive ? 'text-red-600' : 'text-green-600'}`}>
                        <AlertCircle className="h-5 w-5" />
                        {action} Budget
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        Are you sure you want to <strong>{action.toLowerCase()}</strong> <strong>{budgetName}</strong>?
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {action}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};