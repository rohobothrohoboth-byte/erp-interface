import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Calendar, Hash, FileDigit, ScrollText, BadgePlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import useToast from '@/shared/hooks/useToast';

interface JournalLine {
  id: number;
  accountId: string;
  accountName: string;
  debit: number | '';
  credit: number | '';
  description: string;
}

interface AddJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJournal: (journalData: any) => Promise<any>;
}

const AddJournalModal: React.FC<AddJournalModalProps> = ({ isOpen, onClose, onAddJournal }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    journalNumber: '',
    reference: '',
    description: '',
    status: 'draft' as 'draft' | 'pending' | 'approved'
  });

  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    { id: 1, accountId: '', accountName: '', debit: '', credit: '', description: '' },
    { id: 2, accountId: '', accountName: '', debit: '', credit: '', description: '' }
  ]);

  // Sample accounts for dropdown
  const sampleAccounts = [
    { id: '1000', name: 'Cash' },
    { id: '1100', name: 'Accounts Receivable' },
    { id: '2000', name: 'Accounts Payable' },
    { id: '3000', name: 'Equity' },
    { id: '4000', name: 'Revenue' },
    { id: '5000', name: 'Office Expenses' },
    { id: '5100', name: 'Salary Expense' },
    { id: '5200', name: 'Utilities Expense' },
    { id: '6000', name: 'Equipment' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJournalLineChange = (id: number, field: keyof JournalLine, value: any) => {
    setJournalLines(prev => 
      prev.map(line => 
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  };

  const handleAccountSelect = (id: number, accountId: string) => {
    const selectedAccount = sampleAccounts.find(acc => acc.id === accountId);
    setJournalLines(prev => 
      prev.map(line => 
        line.id === id ? { 
          ...line, 
          accountId, 
          accountName: selectedAccount?.name || '' 
        } : line
      )
    );
  };

  const addJournalLine = () => {
    const newId = Math.max(...journalLines.map(line => line.id)) + 1;
    setJournalLines(prev => [
      ...prev,
      { id: newId, accountId: '', accountName: '', debit: '', credit: '', description: '' }
    ]);
  };

  const removeJournalLine = (id: number) => {
    if (journalLines.length > 1) {
      setJournalLines(prev => prev.filter(line => line.id !== id));
    }
  };

  const calculateTotals = () => {
    const totalDebit = journalLines.reduce((sum, line) => 
      sum + (typeof line.debit === 'number' ? line.debit : parseFloat(line.debit.toString()) || 0), 0
    );
    
    const totalCredit = journalLines.reduce((sum, line) => 
      sum + (typeof line.credit === 'number' ? line.credit : parseFloat(line.credit.toString()) || 0), 0
    );

    return { totalDebit, totalCredit };
  };

  const validateForm = () => {
    // Check if all required fields are filled
    if (!formData.date || !formData.journalNumber.trim()) {
      setError('Date and Journal Number are required');
      return false;
    }

    // Validate journal lines
    for (const line of journalLines) {
      if (!line.accountId.trim()) {
        setError('All lines must have an account selected');
        return false;
      }

      const debit = typeof line.debit === 'number' ? line.debit : parseFloat(line.debit.toString());
      const credit = typeof line.credit === 'number' ? line.credit : parseFloat(line.credit.toString());

      if ((!debit && !credit) || (debit && credit)) {
        setError('Each line must have either debit OR credit amount (not both or none)');
        return false;
      }

      if (debit && debit < 0) {
        setError('Debit amount cannot be negative');
        return false;
      }

      if (credit && credit < 0) {
        setError('Credit amount cannot be negative');
        return false;
      }
    }

    // Check if debits equal credits
    const { totalDebit, totalCredit } = calculateTotals();
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError(`Debits (${totalDebit.toFixed(2)}) must equal Credits (${totalCredit.toFixed(2)})`);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    // Show loading toast
    const loadingToastId = toast.loading('Adding journal entry...');

    try {
      const journalEntry = {
        ...formData,
        lines: journalLines.map(line => ({
          accountId: line.accountId,
          accountName: line.accountName,
          debit: typeof line.debit === 'number' ? line.debit : parseFloat(line.debit.toString()) || 0,
          credit: typeof line.credit === 'number' ? line.credit : parseFloat(line.credit.toString()) || 0,
          description: line.description
        }))
      };

      const response = await onAddJournal(journalEntry);
      toast.dismiss(loadingToastId);

      // Extract success message from backend response
      const successMessage = 
        response?.data?.message || 
        response?.message || 
        'Journal entry added successfully!';
      
      toast.success(successMessage);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      
      const errorMessage = 
        error.response?.data?.message ||
        error.message || 
        'Failed to add journal entry. Please try again.';
      
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Error adding journal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      journalNumber: '',
      reference: '',
      description: '',
      status: 'draft'
    });
    
    setJournalLines([
      { id: 1, accountId: '', accountName: '', debit: '', credit: '', description: '' },
      { id: 2, accountId: '', accountName: '', debit: '', credit: '', description: '' }
    ]);
    
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 h-dvh">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <BadgePlus size={24} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Add New</h2>
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
        <div className="p-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={16} />
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journalNumber" className="text-sm text-gray-500 flex items-center gap-2">
                <Hash size={16} />
                Journal Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="journalNumber"
                name="journalNumber"
                value={formData.journalNumber}
                onChange={handleInputChange}
                placeholder="e.g., JV-001"
                required
                disabled={isLoading}
                className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm text-gray-500 flex items-center gap-2">
                <FileDigit size={16} />
                Reference
              </Label>
              <Input
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Optional reference"
                disabled={isLoading}
                className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm text-gray-500 flex items-center gap-2">
                <ScrollText size={16} />
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description" className="text-sm text-gray-500">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter journal description"
                rows={3}
                disabled={isLoading}
                className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Journal Lines */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Journal Lines</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addJournalLine}
                className="flex items-center gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                disabled={isLoading}
              >
                <Plus size={16} />
                Add Line
              </Button>
            </div>

            <div className="space-y-4">
              {journalLines.map((line) => (
                <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="md:col-span-4 space-y-2">
                    <Label className="text-xs text-gray-500">Account</Label>
                    <Select
                      value={line.accountId}
                      onValueChange={(value) => handleAccountSelect(line.id, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.id} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs text-gray-500">Debit</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={line.debit}
                      onChange={(e) => handleJournalLineChange(line.id, 'debit', e.target.value)}
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs text-gray-500">Credit</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={line.credit}
                      onChange={(e) => handleJournalLineChange(line.id, 'credit', e.target.value)}
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs text-gray-500">Description</Label>
                    <Input
                      type="text"
                      placeholder="Line description"
                      value={line.description}
                      onChange={(e) => handleJournalLineChange(line.id, 'description', e.target.value)}
                      disabled={isLoading}
                      className="w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-1 flex items-end justify-center">
                    {journalLines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeJournalLine(line.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Minus size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3 md:text-right">
                  <span className="font-semibold text-gray-700">Totals:</span>
                </div>
                <div className="md:col-span-3">
                  <div className={`p-3 rounded-lg ${totalDebit > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100'}`}>
                    <div className="text-sm text-gray-500">Total Debit</div>
                    <div className={`text-lg font-bold ${totalDebit > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                      ${totalDebit.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className={`p-3 rounded-lg ${totalCredit > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-100'}`}>
                    <div className="text-sm text-gray-500">Total Credit</div>
                    <div className={`text-lg font-bold ${totalCredit > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                      ${totalCredit.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className={`p-3 rounded-lg ${
                    isBalanced 
                      ? 'bg-indigo-50 border border-indigo-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-sm text-gray-500">Balance Status</div>
                    <div className={`text-lg font-bold ${
                      isBalanced ? 'text-indigo-700' : 'text-red-700'
                    }`}>
                      {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-center items-center gap-3">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white cursor-pointer px-8 shadow-lg shadow-indigo-200"
              onClick={handleSubmit}
              disabled={isLoading || !isBalanced}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-8 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
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

export default AddJournalModal;