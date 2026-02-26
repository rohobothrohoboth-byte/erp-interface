import { useState } from 'react';
import type { UUID } from 'crypto';
import { motion } from 'framer-motion';
import { X, BadgePlus, Calculator } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import useToast from '../../../../hooks/useToast';

interface AccountFormData {
  code: string;
  name: string;
  accountCategoryId: UUID | undefined;
  isGroup: boolean;
  accountType?: 'Asset' | 'Liability' | 'Capital' | 'Income' | 'Expenditure';
  currencyId: UUID | undefined;
  companyId: UUID | undefined;
  isActive: boolean;
}

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: AccountFormData) => Promise<any>;
  accountCategories?: Array<{
    id: UUID;
    name: string;
  }>;
  currencies?: Array<{
    id: UUID;
    name: string;
    code: string;
  }>;
  companies?: Array<{
    id: UUID;
    name: string;
  }>;
  parentAccount?: {
    id: UUID;
    code: string;
    name: string;
  } | null;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddAccount,
  accountCategories = [],
  currencies = [],
  companies = [],
  parentAccount = null
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<AccountFormData>({
    code: '',
    name: '',
    accountCategoryId: undefined,
    isGroup: false,
    accountType: undefined,
    currencyId: undefined,
    companyId: undefined,
    isActive: true
  });

  const accountTypes: Array<'Asset' | 'Liability' | 'Capital' | 'Income' | 'Expenditure'> = [
    'Asset',
    'Liability',
    'Capital',
    'Income',
    'Expenditure'
  ];

  const handleSubmit = async () => {
    // Validation
    if (!formData.code.trim()) {
      toast.error('Please enter an account code');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    if (!formData.accountCategoryId) {
      toast.error('Please select an account category');
      return;
    }

    if (formData.isGroup && !formData.accountType) {
      toast.error('Please select an account type for group accounts');
      return;
    }

    if (!formData.currencyId) {
      toast.error('Please select a currency');
      return;
    }

    if (!formData.companyId) {
      toast.error('Please select a company');
      return;
    }

    // Validate account code format (e.g., should be numeric)
    if (!/^\d+$/.test(formData.code)) {
      toast.error('Account code should contain only numbers');
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToastId = toast.loading('Creating account...');

    try {
      const response = await onAddAccount(formData);
      toast.dismiss(loadingToastId);

      // Extract success message from backend response
      const successMessage = 
        response?.data?.message || 
        response?.message || 
        'Account created successfully!';
      
      toast.success(successMessage);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      
      const errorMessage = 
        error.response?.data?.message ||
        error.message || 
        'Failed to create account. Please try again.';
      
      toast.error(errorMessage);
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      accountCategoryId: undefined,
      isGroup: false,
      accountType: undefined,
      currencyId: undefined,
      companyId: undefined,
      isActive: true
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = 
    formData.code.trim() && 
    formData.name.trim() && 
    formData.accountCategoryId &&
    formData.currencyId &&
    formData.companyId &&
    (!formData.isGroup || formData.accountType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-dvh">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-1/2 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} />
            <h2 className="text-lg font-bold text-gray-800">
              {parentAccount ? `Add Child Account to ${parentAccount.name}` : 'Add New Account'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Account Code */}
              <div className="space-y-2">
                <Label htmlFor="accountCode" className="text-sm text-gray-500">
                  Account Code <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" size={18} />
                  <input
                    id="accountCode"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., 1000, 1100"
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-sm text-gray-500">
                  Account Name <span className="text-red-500">*</span>
                </Label>
                <input
                  id="accountName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cash & Bank, Accounts Receivable"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {/* Account Category */}
              <div className="space-y-2">
                <Label htmlFor="accountCategory" className="text-sm text-gray-500">
                  Account Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="accountCategory"
                  value={formData.accountCategoryId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountCategoryId: e.target.value as UUID }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select category</option>
                  {accountCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm text-gray-500">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <select
                  id="currency"
                  value={formData.currencyId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value as UUID }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select currency</option>
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm text-gray-500">
                  Company <span className="text-red-500">*</span>
                </Label>
                <select
                  id="company"
                  value={formData.companyId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value as UUID }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Active Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isActive: e.target.checked
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="isActive" className="text-sm text-gray-500">
                  Is Active
                </Label>
              </div>

              {/* Is Group Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  id="isGroup"
                  type="checkbox"
                  checked={formData.isGroup}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isGroup: e.target.checked,
                    accountType: e.target.checked ? prev.accountType : undefined
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="isGroup" className="text-sm text-gray-500">
                  Is Group
                </Label>
              </div>

              {/* Account Type (only shown if Is Group is checked) */}
              {formData.isGroup && (
                <div className="space-y-2">
                  <Label htmlFor="accountType" className="text-sm text-gray-500">
                    Account Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="accountType"
                    value={formData.accountType || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      accountType: e.target.value as 'Asset' | 'Liability' | 'Capital' | 'Income' | 'Expenditure'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select account type</option>
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddAccountModal;
