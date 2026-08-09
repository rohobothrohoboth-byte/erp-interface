// components/finance/chart-of-accounts/modals/AccountFormModal.tsx

import React from 'react';
import { Plus, Edit } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../../ui/dialog';
import { AccountForm } from '../forms/AccountForm';
import type { Account, AccountFormData, AccountCategory, Department } from '../../../../types/finance/account.types';

interface AccountFormModalProps {
    open: boolean;
    mode: 'add' | 'edit';
    account: Account | null;
    formData: AccountFormData;
    categories: AccountCategory[]; // ✅ Add this
    departments: Department[]; // ✅ Add this
    isSubmitting: boolean;
    onFormChange: (field: keyof AccountFormData, value: any) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
                                                                      open,
                                                                      mode,
                                                                      account,
                                                                      formData,
                                                                      categories = [], // ✅ Default to empty array
                                                                      departments = [], // ✅ Default to empty array
                                                                      isSubmitting,
                                                                      onFormChange,
                                                                      onSubmit,
                                                                      onClose,
                                                                  }) => {
    const isEdit = mode === 'edit';

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <Edit className="h-5 w-5 text-green-600" />
                        ) : (
                            <Plus className="h-5 w-5 text-blue-600" />
                        )}
                        {isEdit ? 'Edit Account' : 'Add New Account'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Update account details for "${account?.name || 'Account'}"`
                            : 'Create a new chart of accounts entry'}
                    </DialogDescription>
                </DialogHeader>

                <AccountForm
                    formData={formData}
                    onFormChange={onFormChange}
                    accounts={[]} // ✅ Pass accounts if needed
                    accountCategories={categories} // ✅ Pass categories
                    departments={departments} // ✅ Pass departments
                    isSubmitting={isSubmitting}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    mode={mode}
                    selectedAccount={account}
                />
            </DialogContent>
        </Dialog>
    );
};