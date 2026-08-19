import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PenBox, Building2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { amharicRegex } from '@/shared/utils/amharic-regex';
import type { EditBranchDto, BranchListDto, UUID } from '@/modules/core/types/branch';
import { BranchType, BranchStat } from '@/modules/core/types/enum';
import { Button } from '@/shared/components/ui/button';
import toast from 'react-hot-toast';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branchData: EditBranchDto) => Promise<any>;
  branch: BranchListDto | null;
  defaultCompanyId?: string;
  companyName?: string;
}

interface FormErrors {
  name?: string;
  nameAm?: string;
  location?: string;
  dateOpened?: string;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  onSave,
                                                                  branch,
                                                                  companyName = '',
                                                                }) => {
  const [formData, setFormData] = useState<EditBranchDto>({
    id: '' as UUID,
    name: '',
    nameAm: '',
    code: '',
    location: '',
    dateOpened: new Date().toISOString().split('T')[0],
    branchType: BranchType["0"],
    branchStat: BranchStat["0"],
    compId: '' as UUID,
    rowVersion: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    managerName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (branch) {
      setFormData({
        id: branch.id,
        name: branch.name || '',
        nameAm: branch.nameAm || '',
        code: branch.code || '',
        location: branch.location || '',
        dateOpened: formatDateForInput(branch.openDate),
        branchType: branch.branchType || BranchType["0"],
        branchStat: branch.branchStat || BranchStat["0"],
        compId: branch.compId || '' as UUID,
        rowVersion: branch.rowVersion || '',
        phone: branch.phone || '',
        email: branch.email || '',
        address: branch.address || '',
        city: branch.city || '',
        managerName: branch.managerName || '',
      });
    }
  }, [branch]);

  const handleAmharicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || amharicRegex.test(value)) {
      setFormData((prev) => ({ ...prev, nameAm: value }));
    }
    if (errors.nameAm) setErrors((prev) => ({ ...prev, nameAm: undefined }));
  };

  const handleInputChange = (field: keyof EditBranchDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Branch name is required';
    if (!formData.nameAm.trim()) newErrors.nameAm = 'Amharic branch name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.dateOpened) newErrors.dateOpened = 'Date opened is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const submitData: EditBranchDto = {
        ...formData,
        dateOpened: new Date(formData.dateOpened).toISOString(),
      };
      await onSave(submitData);
      toast.success('Branch updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update branch');
      console.error('Error updating branch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const branchTypeOptions = Object.entries(BranchType).map(([key, value]) => ({ key, value }));
  const branchStatOptions = Object.entries(BranchStat).map(([key, value]) => ({ key, value }));

  if (!isOpen || !branch) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <PenBox className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Edit Branch
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>

          {/* Company Info Banner */}
          {companyName && (
              <div className="mx-5 mt-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Editing branch for: <span className="font-medium">{companyName}</span>
                  </p>
                </div>
              </div>
          )}

          {/* Form Body */}
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Branch Name (Amharic) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  የቅርንጫፍ ስም (አማርኛ) <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={formData.nameAm}
                    onChange={handleAmharicChange}
                    placeholder="ምሳሌ፡ ቅርንጫፍ 1"
                    className="h-9 text-sm"
                    disabled={isLoading}
                />
                {errors.nameAm && <p className="text-red-500 text-xs">{errors.nameAm}</p>}
              </div>

              {/* Branch Name (English) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Branch Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Eg. Branch 1"
                    className="h-9 text-sm"
                    disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Branch Code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Branch Code
                </Label>
                <Input
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Eg. BR-001"
                    className="h-9 text-sm"
                    disabled={isLoading}
                />
              </div>

              {/* Date Opened and Location - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Date Opened <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      type="date"
                      value={formData.dateOpened}
                      onChange={(e) => handleInputChange('dateOpened', e.target.value)}
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                  {errors.dateOpened && <p className="text-red-500 text-xs">{errors.dateOpened}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Eg. Addis Ababa"
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                  {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
                </div>
              </div>

              {/* Branch Type and Status - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Branch Type
                  </Label>
                  <Select
                      value={formData.branchType}
                      onValueChange={(value: BranchType) => handleInputChange('branchType', value)}
                      disabled={isLoading}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchTypeOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.value}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </Label>
                  <Select
                      value={formData.branchStat}
                      onValueChange={(value: BranchStat) => handleInputChange('branchStat', value)}
                      disabled={isLoading}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchStatOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.value}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Person (Manager) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Contact Person
                </Label>
                <Input
                    value={formData.managerName || ''}
                    onChange={(e) => handleInputChange('managerName', e.target.value)}
                    placeholder="Eg. John Doe"
                    className="h-9 text-sm"
                    disabled={isLoading}
                />
              </div>

              {/* Phone and Email - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Phone
                  </Label>
                  <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Eg. +251 911 000000"
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </Label>
                  <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Eg. branch@example.com"
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                </div>
              </div>

              {/* Address and City - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Address
                  </Label>
                  <Input
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Eg. Bole, Street 5"
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    City
                  </Label>
                  <Input
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Eg. Addis Ababa"
                      className="h-9 text-sm"
                      disabled={isLoading}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-center gap-2">
              <Button
                  onClick={handleSubmit}
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm"
                  disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 h-8 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};