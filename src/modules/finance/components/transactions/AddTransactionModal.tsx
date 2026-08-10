import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, DollarSign, Tag, AlertCircle, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import useToast from '@/shared/hooks/useToast';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transactionData: TransactionFormData) => Promise<{ data: { message: string; transaction: TransactionItem } }>;
}

interface TransactionItem {
  id: number;
  date: string;
  reference: string;
  description: string;
  type: 'Income' | 'Expense' | 'Transfer' | 'Refund';
  amount: number;
  account: string;
  category: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Reconciled';
  balance: number;
}

export interface TransactionFormData {
  date: string;
  type: 'Income' | 'Expense' | 'Transfer' | 'Refund';
  amount: number;
  account: string;
  toAccount?: string;
  category: string;
  description: string;
  reference: string;
  attachments?: File[];
  notes?: string;
  recurring?: {
    isRecurring: boolean;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    endDate?: string;
  };
}

// Sample data for dropdowns
const ACCOUNTS = [
  { id: 'checking', name: 'Checking Account', balance: 14560.01, type: 'Bank' },
  { id: 'savings', name: 'Savings Account', balance: 10150.25, type: 'Bank' },
  { id: 'credit-card', name: 'Business Credit Card', balance: -12500, type: 'Credit' },
  { id: 'paypal', name: 'PayPal', balance: 3200.50, type: 'Digital' },
  { id: 'cash', name: 'Petty Cash', balance: 500, type: 'Cash' },
];

const CATEGORIES = {
  Income: [
    'Client Payments',
    'Consulting Fees',
    'Product Sales',
    'Interest Income',
    'Revenue Share',
    'Investment Returns',
    'Refunds',
    'Other Income'
  ],
  Expense: [
    'Rent & Utilities',
    'Payroll',
    'Software & Tools',
    'Marketing',
    'Supplier Payments',
    'Contractor Payments',
    'Travel & Entertainment',
    'Office Supplies',
    'Professional Fees',
    'Insurance',
    'Taxes',
    'Other Expenses'
  ],
  Transfer: [
    'Between Accounts',
    'To Investment',
    'Loan Payment'
  ],
  Refund: [
    'Customer Refunds',
    'Vendor Refunds',
    'Tax Refunds'
  ]
};

const RECURRING_OPTIONS = [
  { value: 'none', label: 'No' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

function AddTransactionModal({ isOpen, onClose, onAddTransaction }: AddTransactionModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense',
    amount: 0,
    account: 'checking',
    category: '',
    description: '',
    reference: `TXN-${Date.now().toString().slice(-6)}`,
    notes: '',
    recurring: {
      isRecurring: false,
      frequency: 'Monthly',
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        amount: 0,
        account: 'checking',
        category: '',
        description: '',
        reference: `TXN-${Date.now().toString().slice(-6)}`,
        notes: '',
        recurring: {
          isRecurring: false,
          frequency: 'Monthly',
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        }
      });
      setSelectedFiles([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.account) {
      newErrors.account = 'Please select an account';
    }

    if (formData.type === 'Transfer' && !formData.toAccount) {
      newErrors.toAccount = 'Please select a destination account';
    }

    if (formData.type === 'Transfer' && formData.account === formData.toAccount) {
      newErrors.toAccount = 'Cannot transfer to the same account';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
    const loadingToastId = toast.loading('Adding transaction...');

    try {
      const result = await onAddTransaction({
        ...formData,
        attachments: selectedFiles,
      });
      
      toast.dismiss(loadingToastId);
      
      // Extract success message from backend response
      const successMessage = 
        result?.data?.message || 
        'Transaction added successfully!';
      
      toast.success(successMessage);
      
      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      
      const errorMessage = 
        error.response?.data?.message ||
        error.message || 
        'Failed to add transaction. Please try again.';
      
      toast.error(errorMessage);
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountBalance = (accountId: string) => {
    const account = ACCOUNTS.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  const renderAmountField = () => {
    const getColor = () => {
      switch (formData.type) {
        case 'Income': return 'text-emerald-600 border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500';
        case 'Expense': return 'text-rose-600 border-rose-500 focus:ring-rose-500 focus:border-rose-500';
        case 'Transfer': return 'text-blue-600 border-blue-500 focus:ring-blue-500 focus:border-blue-500';
        case 'Refund': return 'text-amber-600 border-amber-500 focus:ring-amber-500 focus:border-amber-500';
        default: return 'text-gray-600 border-gray-500 focus:ring-indigo-500 focus:border-indigo-500';
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm text-gray-500">
          Amount <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-500">
            ({formData.type === 'Expense' ? 'Debit' : formData.type === 'Income' ? 'Credit' : 'Neutral'})
          </span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            className={`pl-10 text-lg font-medium ${getColor()}`}
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.amount}
          </p>
        )}
      </div>
    );
  };

  const renderAccountSelector = (field: 'account' | 'toAccount', label: string) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="text-sm text-gray-500">
          {label} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData[field] || ''}
          onValueChange={(value) => handleInputChange(field, value)}
          disabled={isSubmitting}
        >
          <SelectTrigger 
            id={field} 
            className={`w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors[field] ? 'border-rose-500' : ''}`}
          >
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNTS.map(account => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex justify-between items-center w-full">
                  <span>{account.name}</span>
                  <span className={`text-sm ${account.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    {account.balance < 0 && ' (Credit)'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[field] && (
          <p className="text-sm text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-dvh">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <BadgePlus size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Add New Transaction</h2>
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
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger 
                value="quick"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-500"
              >
                Quick Add
              </TabsTrigger>
              <TabsTrigger 
                value="detailed"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-500"
              >
                Detailed
              </TabsTrigger>
              <TabsTrigger 
                value="recurring"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-500"
              >
                Recurring
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="quick" className="space-y-6">
                {/* Quick Add Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm text-gray-500">
                        Transaction Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) => handleInputChange('type', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Income">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              Income
                            </div>
                          </SelectItem>
                          <SelectItem value="Expense">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                              Expense
                            </div>
                          </SelectItem>
                          <SelectItem value="Transfer">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              Transfer
                            </div>
                          </SelectItem>
                          <SelectItem value="Refund">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                              Refund
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {renderAmountField()}

                    {renderAccountSelector('account', 'Account')}

                    {formData.type === 'Transfer' && (
                      renderAccountSelector('toAccount', 'To Account')
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm text-gray-500">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="date"
                          type="date"
                          className="pl-10 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
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
                          id="category" 
                          className={`w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.category ? 'border-rose-500' : ''}`}
                        >
                          <SelectValue placeholder="Select category">
                            {formData.category || "Select category"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(CATEGORIES[formData.type] || []).map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm text-gray-500">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter transaction description"
                        className={`w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${errors.description ? 'border-rose-500' : ''}`}
                        required
                        disabled={isSubmitting}
                      />
                      {errors.description && (
                        <p className="text-sm text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                {/* Detailed Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference" className="text-sm text-gray-500">
                        Reference Number
                      </Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => handleInputChange('reference', e.target.value)}
                        placeholder="Auto-generated or custom"
                        className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm text-gray-500">
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add any additional notes about this transaction"
                        rows={3}
                        className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">Attachments</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag & drop files or click to upload
                        </p>
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isSubmitting}
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                        >
                          Select Files
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Supports: PDF, JPG, PNG (Max 10MB each)
                        </p>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                          <div className="space-y-1">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                  disabled={isSubmitting}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">
                          Transaction Type <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['Income', 'Expense', 'Transfer', 'Refund'] as const).map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleInputChange('type', type)}
                              disabled={isSubmitting}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                formData.type === type 
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${
                                  type === 'Income' ? 'bg-emerald-500' :
                                  type === 'Expense' ? 'bg-rose-500' :
                                  type === 'Transfer' ? 'bg-blue-500' :
                                  'bg-amber-500'
                                }`} />
                                <span className="font-medium">{type}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {renderAmountField()}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderAccountSelector('account', 'From Account')}
                        {formData.type === 'Transfer' && (
                          renderAccountSelector('toAccount', 'To Account')
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recurring" className="space-y-6">
                {/* Recurring Transaction Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">
                        Set as Recurring Transaction
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={formData.recurring?.isRecurring}
                          onChange={(e) => handleInputChange('recurring', {
                            ...formData.recurring!,
                            isRecurring: e.target.checked
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="recurring" className="font-normal cursor-pointer text-gray-700">
                          This is a recurring transaction
                        </Label>
                      </div>
                    </div>

                    {formData.recurring?.isRecurring && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="frequency" className="text-sm text-gray-500">
                            Frequency
                          </Label>
                          <Select
                            value={formData.recurring?.frequency}
                            onValueChange={(value: any) => handleInputChange('recurring', {
                              ...formData.recurring!,
                              frequency: value
                            })}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RECURRING_OPTIONS.slice(1).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-sm text-gray-500">
                            End Date (Optional)
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.recurring?.endDate || ''}
                            onChange={(e) => handleInputChange('recurring', {
                              ...formData.recurring!,
                              endDate: e.target.value
                            })}
                            min={formData.date}
                            className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <p className="text-sm font-medium text-indigo-800 mb-1">
                            Recurring Transaction Summary
                          </p>
                          <p className="text-sm text-indigo-600">
                            {formData.amount > 0 && (
                              <>
                                ${formData.amount.toFixed(2)} will be {formData.type === 'Income' ? 'received' : 'paid'} {formData.recurring?.frequency.toLowerCase()}, 
                                starting {new Date(formData.date).toLocaleDateString()}
                                {formData.recurring?.endDate && (
                                  <> until {new Date(formData.recurring.endDate).toLocaleDateString()}</>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Preview Card */}
                    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                      <h4 className="font-medium text-indigo-900 mb-3">Transaction Preview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-indigo-700">Type:</span>
                          <Badge className={
                            formData.type === 'Income' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            formData.type === 'Expense' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            formData.type === 'Transfer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }>
                            {formData.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-indigo-700">Amount:</span>
                          <span className={`font-medium ${
                            formData.type === 'Income' ? 'text-emerald-600' :
                            formData.type === 'Expense' ? 'text-rose-600' :
                            'text-indigo-900'
                          }`}>
                            ${formData.amount.toFixed(2)}
                          </span>
                        </div>
                        {formData.category && (
                          <div className="flex justify-between">
                            <span className="text-sm text-indigo-700">Category:</span>
                            <span className="text-sm font-medium text-indigo-900">{formData.category}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-indigo-700">Account Balance:</span>
                          <span className="text-sm text-indigo-900">
                            ${getAccountBalance(formData.account).toFixed(2)} → 
                            <span className="font-medium ml-1">
                              ${(getAccountBalance(formData.account) + 
                                (formData.type === 'Income' ? formData.amount : 
                                 formData.type === 'Expense' ? -formData.amount : 0)).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Common Form Fields for All Tabs */}
              <div className="border-t pt-6 mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm text-gray-500">
                        Transaction Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={isSubmitting}
                      />
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
                        <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(CATEGORIES[formData.type] || []).map(category => (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3 text-gray-400" />
                                {category}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm text-gray-500">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe this transaction..."
                      rows={2}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4">
                <div className="flex justify-center items-center gap-3">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white cursor-pointer px-8"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Transaction'}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AddTransactionModal;