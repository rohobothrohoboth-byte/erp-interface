// components/finance/chart-of-accounts/hooks/useAccountModals.ts

import { useState, useCallback } from 'react';
import type { Account, AccountFormData, UsageInfo } from '../../../../types/finance/account.types';

const DEFAULT_FORM_DATA: AccountFormData = {
    code: '',
    name: '',
    nameAm: '',
    accountType: 'Asset',
    accountSubType: '',
    description: '',
    level: 1,
    openingBalance: 0,
    parentId: '',
    isActive: true,
    rowVersion: '',
    usefulLife: undefined,
    salvageValue: undefined,
    acquisitionDate: '',
    location: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    assignedTo: '',
    departmentId: '',
    categoryId: '',
};

type ModalType = 'add' | 'edit' | 'view' | 'delete' | 'bulkDelete' | 'usage' | 'hierarchy' | 'export';

export const useAccountModals = () => {
    // Modal states
    const [modals, setModals] = useState<Record<ModalType, boolean>>({
        add: false,
        edit: false,
        view: false,
        delete: false,
        bulkDelete: false,
        usage: false,
        hierarchy: false,
        export: false,
    });

    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [formData, setFormData] = useState<AccountFormData>(DEFAULT_FORM_DATA);
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
    const [isUsageLoading, setIsUsageLoading] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
    const [exporting, setExporting] = useState(false);

    // Modal helpers
    const openModal = useCallback((modal: ModalType) => {
        setModals(prev => ({ ...prev, [modal]: true }));
    }, []);

    const closeModal = useCallback((modal: ModalType) => {
        setModals(prev => ({ ...prev, [modal]: false }));
    }, []);

    const closeAllModals = useCallback(() => {
        setModals({
            add: false,
            edit: false,
            view: false,
            delete: false,
            bulkDelete: false,
            usage: false,
            hierarchy: false,
            export: false,
        });
    }, []);

    // Form helpers
    const resetForm = useCallback(() => {
        setFormData(DEFAULT_FORM_DATA);
    }, []);

    const handleFormChange = useCallback(<K extends keyof AccountFormData>(
        field: K,
        value: AccountFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Account action helpers
    const openAddModal = useCallback(() => {
        resetForm();
        openModal('add');
    }, [resetForm, openModal]);

    const openEditModal = useCallback((account: Account) => {
        if (!account) return;
        setSelectedAccount(account);
        setFormData({
            code: account.code || '',
            name: account.name || '',
            nameAm: account.nameAm || '',
            accountType: account.accountType || 'Asset',
            accountSubType: account.accountSubType || '',
            description: account.description || '',
            level: account.level || 1,
            openingBalance: account.openingBalance || 0,
            parentId: account.parentId || '',
            isActive: account.isActive !== undefined ? account.isActive : true,
            rowVersion: account.rowVersion || '',
            usefulLife: account.usefulLife,
            salvageValue: account.salvageValue,
            acquisitionDate: account.acquisitionDate ? account.acquisitionDate.split('T')[0] : '',
            location: account.location || '',
            serialNumber: account.serialNumber || '',
            manufacturer: account.manufacturer || '',
            model: account.model || '',
            assignedTo: account.assignedTo || '',
            departmentId: account.departmentId || '',
            categoryId: account.categoryId || '',
        });
        openModal('edit');
    }, [openModal]);

    const openViewModal = useCallback((account: Account) => {
        setSelectedAccount(account);
        openModal('view');
    }, [openModal]);

    const openDeleteModal = useCallback((account: Account) => {
        setSelectedAccount(account);
        openModal('delete');
    }, [openModal]);

    const openUsageModal = useCallback((account: Account) => {
        setSelectedAccount(account);
        setUsageInfo(null);
        setIsUsageLoading(true);
        openModal('usage');
    }, [openModal]);

    const openHierarchyModal = useCallback(() => {
        openModal('hierarchy');
    }, [openModal]);

    const openExportModal = useCallback(() => {
        openModal('export');
    }, [openModal]);

    const handleCloseUsageModal = useCallback(() => {
        closeModal('usage');
        setUsageInfo(null);
        setIsUsageLoading(false);
    }, [closeModal]);

    const setUsageData = useCallback((info: UsageInfo | null) => {
        setUsageInfo(info);
        setIsUsageLoading(false);
    }, []);

    return {
        // State
        modals,
        formData,
        selectedAccount,
        usageInfo,
        isUsageLoading,
        exportFormat,
        exporting,

        // Setters
        setSelectedAccount,
        setUsageData,
        setExportFormat,
        setExporting,

        // Modal helpers
        openModal,
        closeModal,
        closeAllModals,

        // Form helpers
        resetForm,
        handleFormChange,

        // Account action helpers
        openAddModal,
        openEditModal,
        openViewModal,
        openDeleteModal,
        openUsageModal,
        openHierarchyModal,
        openExportModal,
        handleCloseUsageModal,
    };
};