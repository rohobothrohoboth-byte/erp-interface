// src/pages/finance/ap/invoice/components/InvoiceDeleteModal.tsx

import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../../../components/ui/dialog';
import type{ Invoice } from '../types/invoice.types';

interface InvoiceDeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice | null;
    onConfirm: () => void;
}

export const InvoiceDeleteModal: React.FC<InvoiceDeleteModalProps> = ({
                                                                          isOpen,
                                                                          onOpenChange,
                                                                          invoice,
                                                                          onConfirm,
                                                                      }) => {
    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Delete Invoice
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong>{invoice.invoiceNumber}</strong>?
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};