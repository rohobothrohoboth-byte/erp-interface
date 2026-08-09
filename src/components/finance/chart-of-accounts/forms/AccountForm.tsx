// components/finance/chart-of-accounts/forms/AccountForm.tsx

import React, { useState, useMemo } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Label } from '../../../ui/label.tsx';
import { Input } from '../../../ui/input.tsx';
import { Textarea } from '../../../ui/textarea.tsx';
import { Button } from '../../../ui/button.tsx';
import { Badge } from '../../../ui/badge.tsx';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../ui/select.tsx';
import type { Account, AccountFormData, AccountCategory, Department } from '../../../../types/finance/account.types.ts';

// ============================================================
// TYPES
// ============================================================

interface Props {
    formData: AccountFormData;
    onFormChange: <K extends keyof AccountFormData>(field: K, value: AccountFormData[K]) => void;
    accounts: Account[];
    accountCategories: AccountCategory[];
    departments: Department[];
    isSubmitting: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    mode: 'add' | 'edit' | 'view';
    selectedAccount?: Account | null;
    readOnly?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

// ✅ Get color based on account type
const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'Asset': 'bg-blue-100 text-blue-700 border-blue-200',
        'Liability': 'bg-red-100 text-red-700 border-red-200',
        'Equity': 'bg-purple-100 text-purple-700 border-purple-200',
        'Revenue': 'bg-green-100 text-green-700 border-green-200',
        'Expense': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// ✅ Get color based on category
const getCategoryColor = (categoryName: string, accountCategories: AccountCategory[] = []) => {
    const category = accountCategories.find(c => c.name === categoryName || c.id === categoryName);
    return category?.color || 'bg-gray-100 text-gray-700';
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AccountForm: React.FC<Props> = ({
                                                 formData,
                                                 onFormChange,
                                                 accounts = [],
                                                 accountCategories = [],
                                                 departments = [],
                                                 isSubmitting,
                                                 onSubmit,
                                                 onCancel,
                                                 mode,
                                                 selectedAccount,
                                                 readOnly = false,
                                             }) => {
    const [showAssetDetails, setShowAssetDetails] = useState(false);
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const isAddMode = mode === 'add';
    const disabled = readOnly || isViewMode || isSubmitting;

    // ============================================================
    // ✅ ACCOUNT TYPES - Hardcoded (built-in)
    // ============================================================

    const accountTypes = [
        { value: 'Asset', label: 'Asset', description: 'Resources owned by the company' },
        { value: 'Liability', label: 'Liability', description: 'Obligations owed to others' },
        { value: 'Equity', label: 'Equity', description: 'Owner\'s claim on assets' },
        { value: 'Revenue', label: 'Revenue', description: 'Income from operations' },
        { value: 'Expense', label: 'Expense', description: 'Costs incurred to generate revenue' },
    ];

    // ============================================================
    // ✅ SUB-TYPES - Based on selected account type
    // ============================================================

    const availableSubTypes = useMemo(() => {
        const typeMap: Record<string, string[]> = {
            'Asset': [
                'Current Asset',
                'Fixed Asset',
                'Intangible Asset',
                'Investment',
                'Other Asset'
            ],
            'Liability': [
                'Current Liability',
                'Long-term Liability',
                'Other Liability'
            ],
            'Equity': [
                'Owner\'s Equity',
                'Retained Earnings',
                'Share Capital',
                'Reserves',
                'Other Equity'
            ],
            'Revenue': [
                'Operating Revenue',
                'Non-operating Revenue',
                'Other Revenue'
            ],
            'Expense': [
                'Cost of Goods Sold',
                'Operating Expense',
                'Administrative Expense',
                'Selling Expense',
                'Depreciation',
                'Other Expense'
            ],
        };
        return typeMap[formData?.accountType] || [];
    }, [formData?.accountType]);

    // ============================================================
    // ✅ CHECK IF ASSET DETAILS HAVE DATA
    // ============================================================

    const hasAssetDetails = useMemo(() => {
        return !!(formData?.usefulLife || formData?.salvageValue || formData?.acquisitionDate ||
            formData?.location || formData?.serialNumber || formData?.assignedTo ||
            formData?.manufacturer || formData?.model || formData?.departmentId);
    }, [formData]);

    // ============================================================
    // ✅ RENDER HELPERS
    // ============================================================

    const renderField = (label: string, children: React.ReactNode, required: boolean = false) => (
        <div className="space-y-1">
            <Label className="text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {children}
        </div>
    );

    const renderViewField = (label: string, value: any) => (
        <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">{label}</Label>
            <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
        </div>
    );

    // ============================================================
    // ✅ RENDER
    // ============================================================

    return (
        <div className="space-y-4 py-2">
            {/* ========================================================== */}
            {/* BASIC INFORMATION */}
            {/* ========================================================== */}

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-1.5">
                    Basic Information
                </h3>

                {isViewMode ? (
                    <div className="grid grid-cols-2 gap-3">
                        {renderViewField('Code', formData?.code)}
                        {renderViewField('Name', formData?.name)}
                        {renderViewField('Name (Amharic)', formData?.nameAm)}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            {renderField('Code',
                                <Input
                                    value={formData?.code || ''}
                                    onChange={(e) => onFormChange('code', e.target.value)}
                                    placeholder="e.g., 1000"
                                    disabled={disabled || isEditMode}
                                    className="font-mono"
                                />,
                                true
                            )}
                            {renderField('Name',
                                <Input
                                    value={formData?.name || ''}
                                    onChange={(e) => onFormChange('name', e.target.value)}
                                    placeholder="e.g., Bank - Checking"
                                    disabled={disabled}
                                />,
                                true
                            )}
                        </div>

                        {renderField('Name (Amharic)',
                            <Input
                                value={formData?.nameAm || ''}
                                onChange={(e) => onFormChange('nameAm', e.target.value)}
                                placeholder="የሂሳብ ስም"
                                disabled={disabled}
                                className="font-amharic"
                            />
                        )}
                    </>
                )}
            </div>

            {/* ========================================================== */}
            {/* CLASSIFICATION */}
            {/* ========================================================== */}

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-1.5">
                    Classification
                </h3>

                {isViewMode ? (
                    <div className="grid grid-cols-2 gap-3">
                        {renderViewField('Category',
                            accountCategories.find(c => c.id === formData?.categoryId)?.name || 'None'
                        )}
                        {renderViewField('Account Type',
                            <Badge className={getTypeColor(formData?.accountType || '')}>
                                {formData?.accountType || 'N/A'}
                            </Badge>
                        )}
                        {renderViewField('Sub Type', formData?.accountSubType)}
                        {renderViewField('Level', formData?.level)}
                        {renderViewField('Opening Balance',
                            formData?.openingBalance ? `$${formData.openingBalance.toFixed(2)}` : '$0.00'
                        )}
                        {renderViewField('Parent Account',
                            accounts.find(a => a.id === formData?.parentId)?.name || 'None'
                        )}
                    </div>
                ) : (
                    <>
                        {/* ========================================================== */}
                        {/* ✅ CATEGORY - User-defined from AccountCategories table */}
                        {/* ========================================================== */}
                        {renderField('Category',
                            <Select
                                value={formData?.categoryId || 'no-category'}
                                onValueChange={(value) => {
                                    console.log('📤 [FORM] Category selected - raw value:', value);

                                    // ✅ Set the categoryId
                                    const categoryValue = value === 'no-category' ? '' : value;
                                    console.log('📤 [FORM] Setting categoryId to:', categoryValue);

                                    onFormChange('categoryId', categoryValue);

                                    // Also update account type based on selected category
                                    const selectedCategory = accountCategories.find(c => c.id === value);
                                    if (selectedCategory) {
                                        console.log('📤 [FORM] Selected category:', selectedCategory);
                                        onFormChange('accountType', selectedCategory.type || selectedCategory.name);
                                    }
                                }}
                                disabled={disabled}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-category">None</SelectItem>
                                    {accountCategories
                                        .filter(cat => cat.isActive !== false)
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={category.color || 'bg-gray-100 text-gray-700'}>
                                                        {category.type || category.name}
                                                    </Badge>
                                                    <span>{category.name}</span>
                                                    <span className="text-xs text-gray-400">({category.id.substring(0, 8)})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {/* ========================================================== */}
                            {/* ✅ ACCOUNT TYPE - Hardcoded (built-in) */}
                            {/* ========================================================== */}
                            {renderField('Account Type',
                                <Select
                                    value={formData?.accountType || ''}
                                    onValueChange={(value) => {
                                        onFormChange('accountType', value);
                                        onFormChange('accountSubType', '');
                                    }}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className={getTypeColor(formData?.accountType || '')}>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getTypeColor(type.value)}>
                                                        {type.label}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">{type.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>,
                                true
                            )}

                            {/* ========================================================== */}
                            {/* ✅ SUB TYPE - Based on selected account type */}
                            {/* ========================================================== */}
                            {renderField('Sub Type',
                                <Select
                                    value={formData?.accountSubType || ''}
                                    onValueChange={(value) => onFormChange('accountSubType', value)}
                                    disabled={disabled || !formData?.accountType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={availableSubTypes.length > 0 ? "Select sub type" : "No sub types available"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubTypes.map((subType) => (
                                            <SelectItem key={subType} value={subType}>
                                                {subType}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="other">Other (custom)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {renderField('Level',
                                <Input
                                    type="number"
                                    value={formData?.level || 1}
                                    onChange={(e) => onFormChange('level', parseInt(e.target.value) || 1)}
                                    min={1}
                                    disabled={disabled}
                                />
                            )}
                            {renderField('Opening Balance',
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData?.openingBalance || ''}
                                    onChange={(e) => onFormChange('openingBalance', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    disabled={disabled}
                                    className="text-right font-mono"
                                />
                            )}
                        </div>

                        {renderField('Parent Account',
                            <Select
                                value={formData?.parentId || 'no-parent'}
                                onValueChange={(value) => {
                                    onFormChange('parentId', value === 'no-parent' ? '' : value);
                                }}
                                disabled={disabled}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-parent">None (Root Level)</SelectItem>
                                    {accounts
                                        .filter(a => a.id !== selectedAccount?.id)
                                        .sort((a, b) => a.code.localeCompare(b.code))
                                        .map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.code} - {acc.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}
                    </>
                )}
            </div>

            {/* ========================================================== */}
            {/* ASSET DETAILS - Only for Asset accounts */}
            {/* ========================================================== */}

            {(formData?.accountType === 'Asset' || hasAssetDetails) && (
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Asset Details
                            </h4>
                            {formData?.accountType === 'Asset' && (
                                <Badge className="bg-blue-100 text-blue-700 text-[10px]">Active</Badge>
                            )}
                            {hasAssetDetails && !showAssetDetails && (
                                <Badge className="bg-green-100 text-green-700 text-[10px]">Has Data</Badge>
                            )}
                        </div>
                        {!isViewMode && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAssetDetails(!showAssetDetails)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {showAssetDetails ? (
                                    <>
                                        <EyeOff className="h-4 w-4 mr-1.5" />
                                        Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4 mr-1.5" />
                                        Show
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {(showAssetDetails || isViewMode) && (
                        <div className="space-y-3 pt-1">
                            {isViewMode ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {renderViewField('Useful Life (Years)', formData?.usefulLife || '-')}
                                    {renderViewField('Salvage Value', formData?.salvageValue ? `$${formData.salvageValue.toFixed(2)}` : '$0.00')}
                                    {renderViewField('Acquisition Date', formData?.acquisitionDate ? new Date(formData.acquisitionDate).toLocaleDateString() : '-')}
                                    {renderViewField('Location', formData?.location || '-')}
                                    {renderViewField('Serial Number', formData?.serialNumber || '-')}
                                    {renderViewField('Assigned To', formData?.assignedTo || '-')}
                                    {renderViewField('Manufacturer', formData?.manufacturer || '-')}
                                    {renderViewField('Model', formData?.model || '-')}
                                    {renderViewField('Department', departments.find(d => d.id === formData?.departmentId)?.name || '-')}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {renderField('Useful Life (Years)',
                                            <Input
                                                type="number"
                                                value={formData?.usefulLife || ''}
                                                onChange={(e) => onFormChange('usefulLife', parseInt(e.target.value) || undefined)}
                                                placeholder="e.g., 5"
                                                disabled={disabled}
                                                min={1}
                                                max={100}
                                            />
                                        )}
                                        {renderField('Salvage Value',
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData?.salvageValue || ''}
                                                onChange={(e) => onFormChange('salvageValue', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                disabled={disabled}
                                                className="text-right font-mono"
                                            />
                                        )}
                                    </div>

                                    {renderField('Acquisition Date',
                                        <Input
                                            type="date"
                                            value={formData?.acquisitionDate || ''}
                                            onChange={(e) => onFormChange('acquisitionDate', e.target.value)}
                                            disabled={disabled}
                                        />
                                    )}

                                    {renderField('Location',
                                        <Input
                                            value={formData?.location || ''}
                                            onChange={(e) => onFormChange('location', e.target.value)}
                                            placeholder="e.g., Warehouse A"
                                            disabled={disabled}
                                        />
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {renderField('Serial Number',
                                            <Input
                                                value={formData?.serialNumber || ''}
                                                onChange={(e) => onFormChange('serialNumber', e.target.value)}
                                                placeholder="e.g., SN-001"
                                                disabled={disabled}
                                                className="font-mono"
                                            />
                                        )}
                                        {renderField('Assigned To',
                                            <Input
                                                value={formData?.assignedTo || ''}
                                                onChange={(e) => onFormChange('assignedTo', e.target.value)}
                                                placeholder="e.g., John Doe"
                                                disabled={disabled}
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {renderField('Manufacturer',
                                            <Input
                                                value={formData?.manufacturer || ''}
                                                onChange={(e) => onFormChange('manufacturer', e.target.value)}
                                                placeholder="e.g., Dell"
                                                disabled={disabled}
                                            />
                                        )}
                                        {renderField('Model',
                                            <Input
                                                value={formData?.model || ''}
                                                onChange={(e) => onFormChange('model', e.target.value)}
                                                placeholder="e.g., XPS 15"
                                                disabled={disabled}
                                            />
                                        )}
                                    </div>

                                    {renderField('Department',
                                        <Select
                                            value={formData?.departmentId || 'no-department'}
                                            onValueChange={(value) => {
                                                onFormChange('departmentId', value === 'no-department' ? '' : value);
                                            }}
                                            disabled={disabled}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no-department">None</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================== */}
            {/* DESCRIPTION */}
            {/* ========================================================== */}

            {isViewMode ? (
                renderViewField('Description', formData?.description)
            ) : (
                renderField('Description',
                    <Textarea
                        value={formData?.description || ''}
                        onChange={(e) => onFormChange('description', e.target.value)}
                        placeholder="Detailed account description..."
                        rows={2}
                        disabled={disabled}
                    />
                )
            )}

            {/* ========================================================== */}
            {/* STATUS (Edit mode only) */}
            {/* ========================================================== */}

            {isEditMode && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p className="text-xs text-gray-500">Active accounts can be used in transactions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={formData?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {formData?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onFormChange('isActive', !formData?.isActive)}
                            disabled={disabled}
                        >
                            Toggle
                        </Button>
                    </div>
                </div>
            )}

            {/* ========================================================== */}
            {/* FORM ACTIONS */}
            {/* ========================================================== */}

            <div className="flex gap-3 pt-3 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                {!isViewMode && (
                    <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={onSubmit}
                        disabled={isSubmitting || isViewMode}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isAddMode ? 'Creating...' : 'Updating...'}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isAddMode ? 'Create Account' : 'Update Account'}
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AccountForm;