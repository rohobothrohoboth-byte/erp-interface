// src/pages/settings/finance/PageAccountDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Save, X, Trash2,
  DollarSign, Tag, Building2, Calendar,
  User, FileText, CheckCircle, XCircle
} from 'lucide-react';
import { getAccountById, updateAccount } from '../../../../services/finance/finance.api';
import { showToast } from '../../../../layout/layout';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../../components/ui/dialog';

interface AccountDetail {
  id: string;
  code: string;
  name: string;
  nameAm?: string;
  accountType: string;
  accountSubType?: string;
  isActive: boolean;
  description?: string;
  openingBalance?: number;
  parentId?: string;
  parentName?: string;
  level: number;
  dateAdd: string;
  dateMod?: string;
  createdBy?: string;
  modifiedBy?: string;
}

const PageAccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    description: '',
    openingBalance: 0,
    accountSubType: '',
    isActive: true,
  });

  useEffect(() => {
    if (accountId) {
      fetchAccount(accountId);
    }
  }, [accountId]);

  const fetchAccount = async (id: string) => {
    setLoading(true);
    try {
      const response = await getAccountById(id);
      const data = response.data.data || response.data;
      setAccount(data);
      setFormData({
        name: data.name,
        nameAm: data.nameAm || '',
        description: data.description || '',
        openingBalance: data.openingBalance || 0,
        accountSubType: data.accountSubType || '',
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Error fetching account:', error);
      showToast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!account) return;
    try {
      await updateAccount({
        id: account.id,
        code: account.code,
        name: formData.name,
        nameAm: formData.nameAm,
        accountType: account.accountType,
        accountSubType: formData.accountSubType,
        description: formData.description,
        openingBalance: formData.openingBalance,
        isActive: formData.isActive,
        level: account.level,
        parentId: account.parentId || null,
        rowVersion: account.rowVersion || '',
      });
      showToast.success('Account updated successfully');
      setIsEditing(false);
      fetchAccount(account.id);
    } catch (error) {
      console.error('Error updating account:', error);
      showToast.error('Failed to update account');
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    try {
      await deleteAccount(account.id);
      showToast.success('Account deleted successfully');
      navigate('/settings/finance/accounts');
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast.error('Failed to delete account');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Asset: 'text-blue-600 bg-blue-50',
      Liability: 'text-red-600 bg-red-50',
      Equity: 'text-purple-600 bg-purple-50',
      Revenue: 'text-green-600 bg-green-50',
      Expense: 'text-orange-600 bg-orange-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!account) {
    return (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Account Not Found</h3>
          <p className="text-gray-500">The account you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/settings/finance/accounts')} className="mt-4">
            Back to Accounts
          </Button>
        </div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {account.code} - {account.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Account Details • {account.accountType}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {account.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </Button>
            <Button
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Name *</label>
                          <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Name (Amharic)</label>
                          <Input
                              value={formData.nameAm}
                              onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Opening Balance</label>
                          <Input
                              type="number"
                              step="0.01"
                              value={formData.openingBalance}
                              onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Sub Type</label>
                          <Input
                              value={formData.accountSubType}
                              onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">Active</label>
                      </div>
                      <div className="flex gap-3 pt-4 border-t">
                        <Button onClick={handleSave} className="flex items-center gap-2">
                          <Save size={16} />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                ) : (
                    // View Mode
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Account Code</p>
                          <p className="font-mono text-sm font-medium">{account.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Name</p>
                          <p className="text-sm font-medium">{account.name}</p>
                        </div>
                        {account.nameAm && (
                            <div>
                              <p className="text-sm text-gray-500">Name (Amharic)</p>
                              <p className="text-sm font-medium">{account.nameAm}</p>
                            </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Account Type</p>
                          <Badge className={getTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sub Type</p>
                          <p className="text-sm">{account.accountSubType || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Level</p>
                          <p className="text-sm">{account.level}</p>
                        </div>
                        {account.parentName && (
                            <div>
                              <p className="text-sm text-gray-500">Parent Account</p>
                              <p className="text-sm">{account.parentName}</p>
                            </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Opening Balance</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(account.openingBalance || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <Badge className={account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      {account.description && (
                          <div>
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-sm">{account.description}</p>
                          </div>
                      )}
                    </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Side Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(account.dateAdd)}
                  </p>
                </div>
                {account.dateMod && (
                    <div>
                      <p className="text-sm text-gray-500">Last Modified</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(account.dateMod)}
                      </p>
                    </div>
                )}
                {account.createdBy && (
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {account.createdBy}
                      </p>
                    </div>
                )}
                {account.modifiedBy && (
                    <div>
                      <p className="text-sm text-gray-500">Modified By</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {account.modifiedBy}
                      </p>
                    </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Account Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{account.accountType}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 size={20} />
                Delete Account
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{account.name}</strong>?
              </p>
              <p className="text-sm text-red-500 mt-2">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
              {(account.openingBalance || 0) > 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ This account has an opening balance of {formatCurrency(account.openingBalance || 0)}.
                  </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
};

export default PageAccountDetail;