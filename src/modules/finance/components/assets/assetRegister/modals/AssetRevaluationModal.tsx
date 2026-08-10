import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Calendar, DollarSign, FileText, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { showToast } from '@/shared/layout/layout';
import type { FixedAsset } from '@/modules/finance/components/assets/assetRegister/types';

interface AssetRevaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FixedAsset | null;
  onSubmit: (data: any) => void;
}

const AssetRevaluationModal: React.FC<AssetRevaluationModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    revaluation_date: new Date().toISOString().split('T')[0],
    current_value: '',
    new_value: '',
    reason: '',
  });

  // Update form data when asset changes
  useEffect(() => {
    if (asset) {
      setFormData(prev => ({
        ...prev,
        current_value: asset.net_book_value.toString(),
      }));
    }
  }, [asset]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateRevaluationGain = () => {
    if (!formData.current_value || !formData.new_value) return 0;
    return parseFloat(formData.new_value) - parseFloat(formData.current_value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    const newValue = parseFloat(formData.new_value);
    const currentValue = parseFloat(formData.current_value);
    
    if (newValue <= 0) {
      showToast.error('New value must be greater than zero');
      return;
    }

    if (newValue === currentValue) {
      showToast.error('New value must be different from current value');
      return;
    }

    if (!formData.reason.trim()) {
      showToast.error('Please provide a reason for revaluation');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        asset_id: asset.id,
        revaluation_date: formData.revaluation_date,
        old_value: currentValue,
        new_value: newValue,
        revaluation_gain: newValue - currentValue,
        reason: formData.reason,
      });

      handleClose();
    } catch (error) {
      console.error('Error revaluing asset:', error);
      showToast.error('Error revaluing asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      revaluation_date: new Date().toISOString().split('T')[0],
      current_value: asset?.net_book_value.toString() || '',
      new_value: '',
      reason: '',
    });
    onClose();
  };

  const revaluationGain = calculateRevaluationGain();

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
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Asset Revaluation</h2>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revaluation_date" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Revaluation Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="revaluation_date"
                    type="date"
                    value={formData.revaluation_date}
                    onChange={(e) => setFormData({ ...formData, revaluation_date: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_value" className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Current Value (ETB)
                  </Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    className="border-gray-300 bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new_value" className="flex items-center gap-2">
                    <DollarSign size={16} />
                    New Value (ETB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.new_value}
                    onChange={(e) => setFormData({ ...formData, new_value: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new asset value"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText size={16} />
                  Reason for Revaluation <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for revaluation..."
                  rows={3}
                  required
                />
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
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssetRevaluationModal;