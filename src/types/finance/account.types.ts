// types/finance/account.types.ts

export interface Account {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    accountType: string;
    accountSubType?: string;
    categoryId?: string;
    categoryName?: string;
    isActive: boolean;
    description?: string;
    level: number;
    openingBalance?: number;
    parentId?: string;
    parentName?: string;
    dateAdd: string;
    dateMod?: string;
    childCount?: number;
    usageCount?: number;
    rowVersion?: string;
    usefulLife?: number;
    salvageValue?: number;
    acquisitionDate?: string;
    location?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    assignedTo?: string;
    departmentId?: string;
    departmentName?: string;
}

export interface AccountCategory {
    id: string;
    name: string;
    code: string;
    type: string;
    isActive: boolean;
    parentId?: string;
    parentName?: string;
}

export interface Department {
    id: string;
    name: string;
}

export interface HierarchyNode {
    id: string;
    code: string;
    name: string;
    type: string;
    isActive: boolean;
    categoryId?: string; // ✅ ADD THIS
    categoryName?: string; // ✅ ADD THIS
    children: HierarchyNode[];
}



export interface BulkDeleteResult {
    deletedCount: number;
    failedCount: number;
    errors: Array<{ id: string; error: string }>;
}

export interface AccountFormData {
    code: string;
    name: string;
    nameAm: string;
    accountType: string;
    accountSubType: string;
    description: string;
    level: number;
    openingBalance: number;
    parentId: string;
    isActive: boolean;
    rowVersion: string;
    usefulLife?: number;
    salvageValue?: number;
    acquisitionDate: string;
    location: string;
    serialNumber: string;
    manufacturer: string;
    model: string;
    assignedTo: string;
    departmentId: string;
    categoryId: string;
}

export interface AccountFilters {
    searchTerm: string;
    filterType: string;
    filterStatus: string;
}

export interface UsageInfo {
    accountId: string;
    accountCode: string;
    accountName: string;
    transactionCount: number;
    journalEntryCount: number;
    journalLineCount: number;
    totalDebit: number;
    totalCredit: number;
    canDelete: boolean;
    canBeDeleted: boolean;
    hasChildren: boolean;
    reason: string | null;
    // For backward compatibility
    categoryName?: string;
    accountCount?: number;
}

export interface AccountUsageResponse {
    categoryName: string;
    accountCount: number;
    canDelete: boolean;
    reason?: string;
    categoryId?: string;
    accountId?: string;
}