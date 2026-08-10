import React, { useState, useEffect } from 'react';
import { X, BadgePlus, Tag, Building, MapPin, Calendar, DollarSign, Hash } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import useToast from '@/shared/hooks/useToast';

export interface AssetFormData {
  name: string;
  category: string;
  department: string;
  location: string;
  acquisitionDate: string;
  acquisitionCost: number;
  depreciationMethod: string;
  usefulLife: number;
  status: 'Active' | 'In Use' | 'Idle' | 'Under Maintenance' | 'Disposed';
  serialNumber: string;
  nextMaintenance?: string;
  notes?: string;
}

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (assetData: AssetFormData) => Promise<{ data: { message: string; asset: any } }>;
}

const CATEGORIES = [
  'Computers',
  'Equipment',
  'Vehicles',
  'Machinery',
  'Furniture',
  'Software',
  'Electronics',
  'Tools',
  'Office Supplies',
  'Other'
];

const DEPARTMENTS = [
  'IT',
  'Administration',
  'Sales',
  'Manufacturing',
  'HR',
  'Finance',
  'Operations',
  'Security',
  'Marketing',
  'R&D'
];

const DEPRECIATION_METHODS = [
  'Straight-line',
  'Declining Balance',
  'Units of Production',
  'Sum-of-the-Years Digits'
];

const STATUS_OPTIONS = [
  'Active',
  'In Use',
  'Idle',
  'Under Maintenance',
  'Disposed'
];

function AddAssetModal({ isOpen, onClose, onAddAsset }: AddAssetModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: '',
    department: '',
    location: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: 0,
    depreciationMethod: 'Straight-line',
    usefulLife: 3,
    status: 'Active',
    serialNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        category: '',
        department: '',
        location: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: 0,
        depreciationMethod: 'Straight-line',
        usefulLife: 3,
        status: 'Active',
        serialNumber: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.acquisitionCost || formData.acquisitionCost <= 0) {
      newErrors.acquisitionCost = 'Acquisition cost must be greater than 0';
    }

    if (!formData.usefulLife || formData.usefulLife <= 0) {
      newErrors.usefulLife = 'Useful life must be greater than 0';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToastId = toast.loading('Adding asset...');

    try {
      const result = await onAddAsset(formData);
      
      toast.dismiss(loadingToastId);
      
      // Extract success message from backend response
      const successMessage = 
        result?.data?.message || 
        'Asset added successfully!';
      
      toast.success(successMessage);
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      
      const errorMessage = 
        error.response?.data?.message ||
        error.message || 
        'Failed to add asset. Please try again.';
      
      toast.error(errorMessage);
      console.error('Error adding asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-dvh">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Add New Asset</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-gray-500">
                    Asset Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter asset name"
                      className={`pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.name ? 'border-rose-500' : ''}`}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm text-gray-500">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger 
                      className={`w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.category ? 'border-rose-500' : ''}`}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm text-gray-500">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange('department', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger 
                        className={`pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.department ? 'border-rose-500' : ''}`}
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.department && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm text-gray-500">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Floor 3, Room 302"
                      className={`pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.location ? 'border-rose-500' : ''}`}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber" className="text-sm text-gray-500">
                    Serial Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                      placeholder="Enter serial number"
                      className={`pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.serialNumber ? 'border-rose-500' : ''}`}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.serialNumber && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.serialNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate" className="text-sm text-gray-500">
                    Acquisition Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="acquisitionDate"
                      type="date"
                      className="pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.acquisitionDate}
                      onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acquisitionCost" className="text-sm text-gray-500">
                    Acquisition Cost <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="acquisitionCost"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.acquisitionCost || ''}
                      onChange={(e) => handleInputChange('acquisitionCost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.acquisitionCost && (
                    <p className="text-sm text-rose-600 flex items-center gap-1">
                      {errors.acquisitionCost}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depreciationMethod" className="text-sm text-gray-500">
                      Depreciation Method <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.depreciationMethod}
                      onValueChange={(value) => handleInputChange('depreciationMethod', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPRECIATION_METHODS.map(method => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usefulLife" className="text-sm text-gray-500">
                      Useful Life (Years) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="usefulLife"
                      type="number"
                      min="1"
                      max="50"
                      className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.usefulLife}
                      onChange={(e) => handleInputChange('usefulLife', parseInt(e.target.value) || 1)}
                      placeholder="3"
                      required
                      disabled={isSubmitting}
                    />
                    {errors.usefulLife && (
                      <p className="text-sm text-rose-600 flex items-center gap-1">
                        {errors.usefulLife}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm text-gray-500">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => handleInputChange('status', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextMaintenance" className="text-sm text-gray-500">
                    Next Maintenance Date
                  </Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.nextMaintenance || ''}
                    onChange={(e) => handleInputChange('nextMaintenance', e.target.value)}
                    min={formData.acquisitionDate}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            {/* <div className="mt-6 space-y-2">
              <Label htmlFor="notes" className="text-sm text-gray-500">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this asset..."
                rows={3}
                className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div> */}

            {/* Footer */}
            <div className="border-t px-6 py-4 mt-6">
              <div className="flex justify-center items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white cursor-pointer px-8"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer px-6 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAssetModal;