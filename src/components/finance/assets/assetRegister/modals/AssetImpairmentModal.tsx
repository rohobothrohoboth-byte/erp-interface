import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Calendar, DollarSign, FileText, Save } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { showToast } from '../../../../../layout/layout';
import type { FixedAsset } from '../types';

interface AssetImpairmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FixedAsset | null;
  onSubmit: (data: any) => void;
}

const AssetImpairmentModal: React.FC<AssetImpairmentModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    impairment_date: new Date().toISOString().split('T')[0],
    impairment_amount: '',
    reason: '',
    notes: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    const impairmentAmount = parseFloat(formData.impairment_amount);
    
    if (impairmentAmount <= 0) {
      showToast.error('Impairment amount must be greater than zero');
      return;
    }

    if (impairmentAmount > asset.net_book_value) {
      showToast.error('Impairment amount cannot exceed net book value');
      return;
    }

    if (!formData.reason.trim()) {
      showToast.error('Please provide a reason for impairment');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        asset_id: asset.id,
        impairment_date: formData.impairment_date,
        impairment_amount: impairmentAmount,
        reason: formData.reason,
        notes: formData.notes,
        old_net_book_value: asset.net_book_value,
        new_net_book_value: asset.net_book_value - impairmentAmount,
      });

      handleClose();
    } catch (error) {
      console.error('Error recording impairment:', error);
      showToast.error('Error recording asset impairment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      impairment_date: new Date().toISOString().split('T')[0],
      impairment_amount: '',
      reason: '',
      notes: '',
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Asset Impairment</h2>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="impairment_date" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Impairment Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="impairment_date"
                    type="date"
                    value={formData.impairment_date}
                    onChange={(e) => setFormData({ ...formData, impairment_date: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impairment_amount" className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Impairment Amount (ETB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="impairment_amount"
                    type="number"
                    min="0"
                    max={asset.net_book_value}
                    step="0.01"
                    value={formData.impairment_amount}
                    onChange={(e) => setFormData({ ...formData, impairment_amount: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter impairment amount"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText size={16} />
                  Reason for Impairment <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-yellow-500 focus:border-transparent">
                    <SelectValue placeholder="Select reason for impairment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obsolescence">Technological Obsolescence</SelectItem>
                    <SelectItem value="damage">Physical Damage</SelectItem>
                    <SelectItem value="market_decline">Market Value Decline</SelectItem>
                    <SelectItem value="regulatory">Regulatory Changes</SelectItem>
                    <SelectItem value="economic">Economic Factors</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter any additional notes about the impairment..."
                  rows={3}
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
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {isLoading ? 'Recording...' : 'Record Impairment'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssetImpairmentModal;