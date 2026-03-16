import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
  prefilledOpportunity?: {
    id: string;
    name: string;
    accountName: string;
    contactName: string;
    amount: number;
  } | null;
  editingQuotation?: any;
}

const statusOptions = ['Draft', 'Pending Approval', 'Approved', 'Rejected'];
const productOptions = [
  'Enterprise Software License', 'Professional Services Package', 'Training Package',
  'Custom Development', 'Support Contract', 'Cloud Hosting Service',
  'Data Analytics Platform', 'Security Audit Service', 'Consulting Services', 'Maintenance Package'
];

export default function AddQuotationModal({
  isOpen,
  onClose,
  onSubmit,
  prefilledOpportunity,
  editingQuotation
}: AddQuotationModalProps) {
  const [formData, setFormData] = useState({
    product: '',
    amount: '',
    status: 'Draft',
    validUntil: '',
    description: '',
    createdBy: 'Current User'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuotation) {
      setFormData({
        product: editingQuotation.product || '',
        amount: editingQuotation.amount?.toString() || '',
        status: editingQuotation.status || 'Draft',
        validUntil: editingQuotation.validUntil || '',
        description: editingQuotation.description || '',
        createdBy: editingQuotation.createdBy || 'Current User'
      });
    } else if (prefilledOpportunity) {
      setFormData({ product: '', amount: prefilledOpportunity.amount.toString(), status: 'Draft', validUntil: '', description: '', createdBy: 'Current User' });
    } else {
      setFormData({ product: '', amount: '', status: 'Draft', validUntil: '', description: '', createdBy: 'Current User' });
    }
  }, [prefilledOpportunity, editingQuotation, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.product.trim()) newErrors.product = 'Product is required';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.validUntil) newErrors.validUntil = 'Valid until date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, amount: Number(formData.amount) });
      if (!editingQuotation) {
        setFormData({ product: '', amount: '', status: 'Draft', validUntil: '', description: '', createdBy: 'Current User' });
      }
      setErrors({});
    } catch (error) {
      console.error('Error creating quotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <FileText className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">
            {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
          </h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>Product <span className="text-red-500">*</span></Label>
              <Select value={formData.product} onValueChange={(value) => handleChange('product', value)}>
                <SelectTrigger className={errors.product ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.product && <p className="text-sm text-red-500">{errors.product}</p>}
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Amount ($) <span className="text-red-500">*</span></Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className={errors.amount ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>
              <div className="space-y-1">
                <Label>Valid Until <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={errors.validUntil ? 'border-red-500' : ''}
                />
                {errors.validUntil && <p className="text-sm text-red-500">{errors.validUntil}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Describe the quotation..."
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" />{editingQuotation ? 'Update Quotation' : 'Create Quotation'}</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
