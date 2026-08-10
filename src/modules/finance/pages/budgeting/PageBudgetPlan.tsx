// src/pages/finance/budgeting/PageBudgetPlan.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Save, X,
  Calendar, DollarSign, Users, Building2,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createBudget, getBranches, getDepartments,
  getAccounts
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

interface BudgetLine {
  accountId: string;
  allocatedAmount: number;
  description: string;
}

const PageBudgetPlan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalAmount: 0,
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    branchId: '',
    departmentId: '',
    status: 'Draft',
  });

  const [lines, setLines] = useState<BudgetLine[]>([
    { accountId: '', allocatedAmount: 0, description: '' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesRes, departmentsRes, accountsRes] = await Promise.all([
        getBranches(),
        getDepartments(),
        getAccounts(),
      ]);

      setBranches(branchesRes.data.data || branchesRes.data || []);
      setDepartments(departmentsRes.data.data || departmentsRes.data || []);
      setAccounts(accountsRes.data.data || accountsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load required data');
      showToast.error('Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', allocatedAmount: 0, description: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index: number, field: keyof BudgetLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);

    // Update total amount
    const total = newLines.reduce((sum, line) => sum + line.allocatedAmount, 0);
    setFormData({ ...formData, totalAmount: total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate
    if (!formData.name.trim()) {
      setError('Budget name is required');
      showToast.error('Budget name is required');
      setSaving(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      showToast.error('Start and end dates are required');
      setSaving(false);
      return;
    }

    const validLines = lines.filter(line => line.accountId && line.allocatedAmount > 0);
    if (validLines.length === 0) {
      setError('At least one budget line with account and amount is required');
      showToast.error('At least one budget line with account and amount is required');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || '',
        totalAmount: validLines.reduce((sum, line) => sum + line.allocatedAmount, 0),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        branchId: formData.branchId || null,
        departmentId: formData.departmentId || null,
        status: formData.status || 'Draft',
        lines: validLines.map(line => ({
          accountId: line.accountId,
          allocatedAmount: line.allocatedAmount,
          description: line.description || '',
        })),
      };

      await createBudget(payload);
      setSuccess(true);
      showToast.success('Budget created successfully!');
      setTimeout(() => {
        navigate('/finance/budget');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating budget:', error);
      const msg = error.response?.data?.message || 'Failed to create budget';
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
                onClick={() => navigate('/finance/budget')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Budgets
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Budget</h1>
              <p className="text-gray-500">Plan your financial budget</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">Budget created successfully!</p>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Budget Name *
                </Label>
                <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Annual Operating Budget 2026"
                    className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the budget"
                    className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Start Date *
                </Label>
                <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  End Date *
                </Label>
                <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Branch</Label>
                <Select
                    value={formData.branchId}
                    onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Department</Label>
                <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                      type="number"
                      step="0.01"
                      readOnly
                      value={formData.totalAmount}
                      className="pl-10 bg-gray-50 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Budget Lines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Budget Lines</h2>
              <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLine}
                  className="flex items-center gap-2"
              >
                <Plus size={18} />
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Select
                          value={line.accountId}
                          onValueChange={(value) => handleLineChange(index, 'accountId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            type="number"
                            step="0.01"
                            value={line.allocatedAmount}
                            onChange={(e) => handleLineChange(index, 'allocatedAmount', parseFloat(e.target.value) || 0)}
                            className="pl-8"
                            placeholder="Amount"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                          placeholder="Description"
                      />
                    </div>
                    {lines.length > 1 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLine(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                    )}
                  </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Budget Amount:</span>
              <span className="text-2xl font-bold text-indigo-600">
              ${formData.totalAmount.toFixed(2)}
            </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/finance/budget')}
            >
              Cancel
            </Button>
            <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
              ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Create Budget
                  </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
  );
};

export default PageBudgetPlan;