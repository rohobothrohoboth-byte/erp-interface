import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calendar, DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import type { FixedAsset } from '@/modules/finance/components/assets/assetRegister/types';

interface AssetDisposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: FixedAsset | null;
  onSubmit: (data: any) => void;
}

const AssetDisposalModal: React.FC<AssetDisposalModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    disposal_date: new Date().toISOString().split('T')[0],
    disposal_method: '',
    sale_amount: '',
    notes: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateGainLoss = () => {
    if (!asset || !formData.sale_amount) return 0;
    const saleAmount = parseFloat(formData.sale_amount);
    return saleAmount - asset.net_book_value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    if (!formData.disposal_method) {
      showToast.error('Please select a disposal method');
      return;
    }

    if (formData.disposal_method === 'sale' && (!formData.sale_amount || parseFloat(formData.sale_amount) < 0)) {
      showToast.error('Please enter a valid sale amount');
      return;
    }

    setIsLoading(true);

    try {
      const saleAmount = formData.disposal_method === 'sale' ? parseFloat(formData.sale_amount) : 0;
      const gainLoss = saleAmount - asset.net_book_value;

      await onSubmit({
        asset_id: asset.id,
        disposal_date: formData.disposal_date,
        disposal_method: formData.disposal_method,
        sale_amount: saleAmount,
        net_book_value: asset.net_book_value,
        gain_loss: gainLoss,
        notes: formData.notes,
      });

      handleClose();
    } catch (error) {
      console.error('Error disposing asset:', error);
      showToast.error('Error disposing asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      disposal_date: new Date().toISOString().split('T')[0],
      disposal_method: '',
      sale_amount: '',
      notes: '',
    });
    onClose();
  };

  const gainLoss = calculateGainLoss();

  if (!isOpen || !asset) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Asset Disposal</h2>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disposal_date" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Disposal Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="disposal_date"
                    type="date"
                    value={formData.disposal_date}
                    onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disposal_method" className="flex items-center gap-2">
                    <FileText size={16} />
                    Disposal Method <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.disposal_method} onValueChange={(value) => setFormData({ ...formData, disposal_method: value, sale_amount: value === 'sale' ? formData.sale_amount : '0' })}>
                    <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-transparent">
                      <SelectValue placeholder="Select disposal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="scrap">Scrap</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="trade_in">Trade-in</SelectItem>
                      <SelectItem value="write_off">Write-off</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.disposal_method === 'sale' && (
                <div className="space-y-2">
                  <Label htmlFor="sale_amount" className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Sale Amount (ETB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sale_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sale_amount}
                    onChange={(e) => setFormData({ ...formData, sale_amount: e.target.value })}
                    className="border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter sale amount"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter any additional notes about the disposal..."
                  rows={3}
                />
              </div>

              {/* Gain/Loss Calculation */}
              {formData.disposal_method === 'sale' && formData.sale_amount && parseFloat(formData.sale_amount) >= 0 && (
                <div className={`border rounded-lg p-4 ${gainLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <h4 className={`text-sm font-semibold mb-2 ${gainLoss >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Disposal Impact
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className={gainLoss >= 0 ? 'text-green-700' : 'text-red-700'}>Net Book Value:</p>
                      <p className="font-semibold">{formatCurrency(asset.net_book_value)}</p>
                    </div>
                    <div>
                      <p className={gainLoss >= 0 ? 'text-green-700' : 'text-red-700'}>Sale Amount:</p>
                      <p className="font-semibold">{formatCurrency(parseFloat(formData.sale_amount))}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {gainLoss >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-semibold ${gainLoss >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {gainLoss >= 0 ? 'Gain on Disposal:' : 'Loss on Disposal:'}
                        </span>
                      </div>
                      <span className={`font-bold text-lg ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(gainLoss))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
                  className="bg-red-600 hover:bg-red-700 text-white px-6 flex items-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Dispose'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssetDisposalModal;