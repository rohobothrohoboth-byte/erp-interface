import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, Building, Target, Percent, Plus, FileText, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { showToast } from '@/shared/layout/layout';
import AccountForm from '@/modules/crm/components/accountManagement/components/AccountForm';
import type { Opportunity, Account } from '@/modules/crm/types/crm';

interface OpportunityFormProps {
  opportunity?: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opportunityData: Partial<Opportunity>) => void;
  mode: 'add' | 'edit';
}

export default function OpportunityForm({ opportunity, isOpen, onClose, onSubmit, mode }: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    stage: 'Qualification' as Opportunity['stage'],
    amount: '',
    probability: '',
    expectedCloseDate: '',
    assignedTo: '',
    accountId: '',
    contactId: '',
    source: '',
    description: '',
    nextStep: '',
    products: [] as string[],
    competitors: [] as string[],
    newProduct: '',
    newCompetitor: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountMode, setAccountMode] = useState<'existing' | 'new'>('existing');
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState<Partial<Account>>({});

  // Load accounts from localStorage
  useEffect(() => {
    const loadAccounts = () => {
      const storedAccounts = localStorage.getItem('accounts');
      if (storedAccounts) {
        try {
          const accountsData = JSON.parse(storedAccounts);
          setAccounts(accountsData);
        } catch (error) {
          console.error('Error loading accounts:', error);
        }
      }
    };

    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (opportunity && mode === 'edit') {
      setFormData({
        name: opportunity.name,
        stage: opportunity.stage,
        amount: opportunity.amount.toString(),
        probability: opportunity.probability.toString(),
        expectedCloseDate: opportunity.expectedCloseDate,
        assignedTo: opportunity.assignedTo,
        accountId: opportunity.accountId,
        contactId: opportunity.contactId,
        source: opportunity.source,
        description: opportunity.description,
        nextStep: opportunity.nextStep,
        products: opportunity.products || [],
        competitors: opportunity.competitors || [],
        newProduct: '',
        newCompetitor: ''
      });
    } else {
      // Reset form for add mode
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        name: '',
        stage: 'Qualification',
        amount: '',
        probability: '50',
        expectedCloseDate: nextMonth.toISOString().split('T')[0],
        assignedTo: '',
        accountId: '',
        contactId: '',
        source: '',
        description: '',
        nextStep: '',
        products: [],
        competitors: [],
        newProduct: '',
        newCompetitor: ''
      });
    }
    setErrors({});
  }, [opportunity, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.probability || parseFloat(formData.probability) < 0 || parseFloat(formData.probability) > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this opportunity to someone';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Account validation
    if (accountMode === 'existing' && !formData.accountId) {
      newErrors.accountId = 'Please select an account';
    }

    if (accountMode === 'new' && !newAccountData.name?.trim()) {
      newErrors.accountName = 'Account name is required for new account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountCreate = (accountData: Partial<Account>) => {
    // Create new account
    const newAccountId = Date.now().toString();
    const newAccount: Account = {
      id: newAccountId,
      name: accountData.name || '',
      industry: accountData.industry || '',
      website: accountData.website || '',
      phone: accountData.phone || '',
      email: accountData.email || '',
      address: accountData.address || '',
      city: accountData.city || '',
      state: accountData.state || '',
      zipCode: accountData.zipCode || '',
      country: accountData.country || 'USA',
      tags: accountData.tags || [],
      owner: formData.assignedTo,
      accountType: accountData.accountType || 'Prospect',
      isActive: true,
      notes: accountData.notes || '',
      customFields: accountData.customFields || {},
      primaryContactId: undefined,
      contactIds: [],
      opportunityIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const storedAccounts = localStorage.getItem('accounts');
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
    accounts.push(newAccount);
    localStorage.setItem('accounts', JSON.stringify(accounts));

    // Update local state
    setAccounts(prev => [...prev, newAccount]);
    setFormData(prev => ({ ...prev, accountId: newAccountId }));
    setNewAccountData({});
    setIsAccountFormOpen(false);
    
    showToast.success('Account created successfully');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    let finalAccountId = formData.accountId;

    // If creating new account, use the account data
    if (accountMode === 'new' && newAccountData.name) {
      // Create account first
      const newAccountId = Date.now().toString();
      const newAccount: Account = {
        id: newAccountId,
        name: newAccountData.name,
        industry: newAccountData.industry || '',
        website: newAccountData.website || '',
        phone: newAccountData.phone || '',
        email: newAccountData.email || '',
        address: newAccountData.address || '',
        city: newAccountData.city || '',
        state: newAccountData.state || '',
        zipCode: newAccountData.zipCode || '',
        country: newAccountData.country || 'USA',
        tags: newAccountData.tags || [],
        owner: formData.assignedTo,
        accountType: newAccountData.accountType || 'Prospect',
        isActive: true,
        notes: newAccountData.notes || '',
        customFields: newAccountData.customFields || {},
        primaryContactId: undefined,
        contactIds: [],
        opportunityIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const storedAccounts = localStorage.getItem('accounts');
      const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
      accounts.push(newAccount);
      localStorage.setItem('accounts', JSON.stringify(accounts));

      finalAccountId = newAccountId;
    }

    const opportunityData: Partial<Opportunity> = {
      name: formData.name.trim(),
      stage: formData.stage,
      amount: parseFloat(formData.amount),
      probability: parseFloat(formData.probability),
      expectedCloseDate: formData.expectedCloseDate,
      assignedTo: formData.assignedTo,
      accountId: finalAccountId,
      contactId: formData.contactId || '',
      source: formData.source || 'Direct',
      description: formData.description.trim(),
      nextStep: formData.nextStep.trim(),
      products: formData.products,
      competitors: formData.competitors
    };

    onSubmit(opportunityData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addProduct = () => {
    if (formData.newProduct.trim() && !formData.products.includes(formData.newProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, prev.newProduct.trim()],
        newProduct: ''
      }));
    }
  };

  const removeProduct = (productToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product !== productToRemove)
    }));
  };

  const addCompetitor = () => {
    if (formData.newCompetitor.trim() && !formData.competitors.includes(formData.newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, prev.newCompetitor.trim()],
        newCompetitor: ''
      }));
    }
  };

  const removeCompetitor = (competitorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(competitor => competitor !== competitorToRemove)
    }));
  };

  const salesReps = [
    'Sarah Johnson',
    'Mike Wilson',
    'Emily Davis',
    'John Smith',
    'Lisa Chen',
    'David Brown'
  ];

  const opportunitySources = [
    'Inbound Lead',
    'Outbound Prospecting',
    'Referral',
    'Website',
    'Trade Show',
    'Cold Call',
    'Email Campaign',
    'Social Media',
    'Partner',
    'Existing Customer'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>{mode === 'add' ? 'Create New Opportunity' : 'Edit Opportunity'}</span>
            {mode === 'edit' && opportunity && (
              <Badge variant="outline">#{opportunity.id}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Financial</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Details</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 min-h-[450px]">
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <Label htmlFor="name">Opportunity Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter opportunity name"
                      className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="stage">Sales Stage *</Label>
                    <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Qualification">Qualification</SelectItem>
                        <SelectItem value="Needs Analysis">Needs Analysis</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="source">Lead Source</Label>
                    <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {opportunitySources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignedTo" className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Assigned To *</span>
                    </Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                      <SelectTrigger className={`mt-1 ${errors.assignedTo ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select sales rep" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesReps.map((rep) => (
                          <SelectItem key={rep} value={rep}>
                            {rep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedTo && <p className="text-sm text-red-600 mt-1">{errors.assignedTo}</p>}
                  </div>

                  <div>
                    <Label htmlFor="nextStep">Next Step</Label>
                    <Input
                      id="nextStep"
                      value={formData.nextStep}
                      onChange={(e) => handleInputChange('nextStep', e.target.value)}
                      placeholder="e.g., Schedule demo, Send proposal"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the opportunity, customer needs, and solution"
                    rows={4}
                    className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                </div>
              </TabsContent>

              {/* Account Selection Tab */}
              <TabsContent value="account" className="space-y-6">
                <Tabs value={accountMode} onValueChange={(value) => setAccountMode(value as 'existing' | 'new')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Select Existing Account</TabsTrigger>
                    <TabsTrigger value="new">Create New Account</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="accountId" className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>Select Account *</span>
                      </Label>
                      <Select 
                        value={formData.accountId} 
                        onValueChange={(value) => handleInputChange('accountId', value)}
                      >
                        <SelectTrigger className={`mt-1 ${errors.accountId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Choose an existing account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.length === 0 ? (
                            <SelectItem value="" disabled>No accounts available</SelectItem>
                          ) : (
                            accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{account.name}</span>
                                  <span className="text-sm text-gray-500">{account.industry}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.accountId && <p className="text-sm text-red-600 mt-1">{errors.accountId}</p>}
                      
                      {accounts.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          No accounts found. Switch to "Create New Account" tab to create one.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="new" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newAccountName">Account Name *</Label>
                        <Input
                          id="newAccountName"
                          value={newAccountData.name || ''}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter account name"
                          className={`mt-1 ${errors.accountName ? 'border-red-500' : ''}`}
                        />
                        {errors.accountName && <p className="text-sm text-red-600 mt-1">{errors.accountName}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="newAccountIndustry">Industry</Label>
                        <Input
                          id="newAccountIndustry"
                          value={newAccountData.industry || ''}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, industry: e.target.value }))}
                          placeholder="e.g., Technology, Healthcare"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newAccountPhone">Phone</Label>
                        <Input
                          id="newAccountPhone"
                          value={newAccountData.phone || ''}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="newAccountWebsite">Website</Label>
                        <Input
                          id="newAccountWebsite"
                          value={newAccountData.website || ''}
                          onChange={(e) => setNewAccountData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAccountFormOpen(true)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Advanced Account Setup</span>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Financial Information Tab */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="amount" className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Amount *</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="0.00"
                      className={`mt-1 ${errors.amount ? 'border-red-500' : ''}`}
                    />
                    {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <Label htmlFor="probability" className="flex items-center space-x-1">
                      <Percent className="w-4 h-4" />
                      <span>Win Probability *</span>
                    </Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => handleInputChange('probability', e.target.value)}
                      placeholder="50"
                      className={`mt-1 ${errors.probability ? 'border-red-500' : ''}`}
                    />
                    {errors.probability && <p className="text-sm text-red-600 mt-1">{errors.probability}</p>}
                  </div>

                  <div>
                    <Label htmlFor="expectedCloseDate" className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Expected Close Date *</span>
                    </Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                      className={`mt-1 ${errors.expectedCloseDate ? 'border-red-500' : ''}`}
                    />
                    {errors.expectedCloseDate && <p className="text-sm text-red-600 mt-1">{errors.expectedCloseDate}</p>}
                  </div>
                </div>

                {/* Calculated Values Display */}
                {formData.amount && formData.probability && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Calculated Values
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          ${(parseFloat(formData.amount || '0') * (parseFloat(formData.probability || '0') / 100)).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Weighted Amount</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {parseFloat(formData.probability || '0') >= 70 ? 'Commit' : 
                           parseFloat(formData.probability || '0') >= 40 ? 'Best Case' : 'Pipeline'}
                        </div>
                        <div className="text-sm text-blue-700">Forecast Category</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          ${(parseFloat(formData.amount || '0') * 0.2).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Upsell Potential</div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Products */}
                  <div className="space-y-3">
                    <Label className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Products/Services</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        value={formData.newProduct}
                        onChange={(e) => setFormData(prev => ({ ...prev, newProduct: e.target.value }))}
                        placeholder="Add product/service"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addProduct} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.products.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.products.map((product, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{product}</span>
                            <button 
                              type="button"
                              className="ml-1 hover:text-red-600" 
                              onClick={() => removeProduct(product)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Competitors */}
                  <div className="space-y-3">
                    <Label>Competitors</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={formData.newCompetitor}
                        onChange={(e) => setFormData(prev => ({ ...prev, newCompetitor: e.target.value }))}
                        placeholder="Add competitor"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addCompetitor} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.competitors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.competitors.map((competitor, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <span>{competitor}</span>
                            <button 
                              type="button"
                              className="ml-1 hover:text-red-600" 
                              onClick={() => removeCompetitor(competitor)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === 'add' ? 'Create Opportunity' : 'Update Opportunity'}
            </Button>
          </div>
        </form>

        {/* Account Form Dialog */}
        <AccountForm
          isOpen={isAccountFormOpen}
          onClose={() => setIsAccountFormOpen(false)}
          onSubmit={handleAccountCreate}
          mode="add"
          initialData={newAccountData}
        />
      </DialogContent>
    </Dialog>
  );
}