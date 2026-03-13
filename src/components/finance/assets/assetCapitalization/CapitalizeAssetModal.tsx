import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { AssetPendingCapitalization, CapitalizeAssetDTO } from './types';

interface CapitalizeAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetPendingCapitalization | null;
  onSubmit: (data: CapitalizeAssetDTO) => void;
}

const CapitalizeAssetModal: React.FC<CapitalizeAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    capitalization_date: new Date().toISOString().split('T')[0],
    asset_category_id: '',
    asset_account_id: '',
    depreciation_method: 'STRAIGHT_LINE' as 'STRAIGHT_LINE' | 'DECLINING_BALANCE',
    useful_life_years: 5,
    residual_value: 0,
  });

  const assetCategories = [
    { id: 'cat-001', name: 'IT Equipment', code: 'IT' },
    { id: 'cat-002', name: 'Office Equipment', code: 'OE' },
    { id: 'cat-003', name: 'Vehicles', code: 'VH' },
    { id: 'cat-004', name: 'Buildings', code: 'BD' },
    { id: 'cat-005', name: 'Machinery', code: 'MC' },
  ];

  const assetAccounts = [
    { id: 'acc-001', name: 'Computer Equipment', code: '1510' },
    { id: 'acc-002', name: 'Office Furniture & Equipment', code: '1520' },
    { id: 'acc-003', name: 'Motor Vehicles', code: '1530' },
    { id: 'acc-004', name: 'Buildings & Improvements', code: '1540' },
    { id: 'acc-005', name: 'Machinery & Equipment', code: '1550' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    if (!formData.asset_category_id || !formData.asset_account_id) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedCategory = assetCategories.find(cat => cat.id === formData.asset_category_id);
    const selectedAccount = assetAccounts.find(acc => acc.id === formData.asset_account_id);

    onSubmit({
      asset_reference_id: asset.asset_reference_id,
      capitalization_date: formData.capitalization_date,
      asset_category_id: formData.asset_category_id,
      asset_category_name: selectedCategory?.name,
      asset_account_id: formData.asset_account_id,
      asset_account_name: selectedAccount?.name,
      depreciation_method: formData.depreciation_method,
      useful_life_years: formData.useful_life_years,
      residual_value: formData.residual_value,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      capitalization_date: new Date().toISOString().split('T')[0],
      asset_category_id: '',
      asset_account_id: '',
      depreciation_method: 'STRAIGHT_LINE',
      useful_life_years: 5,
      residual_value: 0,
    });
    onClose();
  };

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Capitalize Asset</h2>
              </div>
            </div>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capitalization_date" className="text-sm text-gray-500">
                    Capitalization Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="capitalization_date"
                    type="date"
                    value={formData.capitalization_date}
                    onChange={(e) => setFormData({ ...formData, capitalization_date: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_category" className="text-sm text-gray-500">
                    Asset Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.asset_category_id} onValueChange={(value) => setFormData({ ...formData, asset_category_id: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset_account" className="text-sm text-gray-500">
                    Asset Account <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.asset_account_id} onValueChange={(value) => setFormData({ ...formData, asset_account_id: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depreciation_method" className="text-sm text-gray-500">
                    Depreciation Method <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.depreciation_method} onValueChange={(value: any) => setFormData({ ...formData, depreciation_method: value })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRAIGHT_LINE">Straight Line</SelectItem>
                      <SelectItem value="DECLINING_BALANCE">Declining Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useful_life" className="text-sm text-gray-500">
                    Useful Life (Years) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="useful_life"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.useful_life_years}
                    onChange={(e) => setFormData({ ...formData, useful_life_years: parseInt(e.target.value) || 0 })}
                    className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residual_value" className="text-sm text-gray-500">
                    Residual Value (ETB)
                  </Label>
                  <Input
                    id="residual_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.residual_value}
                    onChange={(e) => setFormData({ ...formData, residual_value: parseFloat(e.target.value) || 0 })}
                    className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                >
                  Capitalize Asset
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CapitalizeAssetModal;