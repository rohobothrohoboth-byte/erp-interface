import { financeApi } from '@/modules/finance/services/finance.api';

export const createChartOfAccount = (data: any) => {
  return financeApi.post('/ChartOfAccounts', {
    code: data.code,
    name: data.name,
    nameAm: data.nameAm || '',
    accountType: data.accountType,
    normalBalance: data.normalBalance,
    accountSubType: data.accountSubType || '',
    description: data.description || '',
    level: data.level || 1,
    openingBalance: data.openingBalance || 0,
    parentId: data.parentId || null,
    categoryId: data.categoryId || null,
    isActive: data.isActive !== false,
    usefulLife: data.usefulLife || null,
    salvageValue: data.salvageValue || null,
    acquisitionDate: data.acquisitionDate || null,
    location: data.location || null,
    serialNumber: data.serialNumber || null,
    manufacturer: data.manufacturer || null,
    model: data.model || null,
    assignedTo: data.assignedTo || null,
    departmentId: data.departmentId || null,
  });
};

export const updateChartOfAccount = (data: any) => {
  return financeApi.put('/ChartOfAccounts', {
    id: data.id,
    code: data.code,
    name: data.name,
    nameAm: data.nameAm || '',
    accountType: data.accountType,
    normalBalance: data.normalBalance,
    accountSubType: data.accountSubType || '',
    description: data.description || '',
    level: data.level || 1,
    openingBalance: data.openingBalance || 0,
    parentId: data.parentId || null,
    categoryId: data.categoryId || null,
    isActive: data.isActive !== false,
    usefulLife: data.usefulLife || null,
    salvageValue: data.salvageValue || null,
    acquisitionDate: data.acquisitionDate || null,
    location: data.location || null,
    serialNumber: data.serialNumber || null,
    manufacturer: data.manufacturer || null,
    model: data.model || null,
    assignedTo: data.assignedTo || null,
    departmentId: data.departmentId || null,
    rowVersion: data.rowVersion || '',
  });
};
