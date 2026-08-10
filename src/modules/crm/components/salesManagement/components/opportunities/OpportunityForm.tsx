import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, DollarSign, Calendar, User, Building, Tag, FileText, Target, Briefcase } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import type { Opportunity } from '@/modules/crm/types/crm';

interface OpportunityFormProps {
  opportunity?: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (opportunityData: Partial<Opportunity>) => void;
  mode: 'add' | 'edit';
}

const stageOptions = [
  'Qualification',
  'Needs Analysis',
  'Proposal', 
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

const sourceOptions = [
  'Website',
  'Referral',
  'Cold Call',
  'Email Campaign',
  'Social Media',
  'Trade Show',
  'Partner',
  'Advertisement'
];

const assigneeOptions = [
  'Sarah Johnson',
  'Mike Wilson',
  'Emily Davis', 
  'Robert Chen',
  'Lisa Anderson'
];

const productOptions = [
  'Enterprise Software License',
  'Professional Services',
  'Training Package',
  'Support Contract',
  'Custom Development',
  'Consulting Services'
];

const competitorOptions = [
  'Salesforce',
  'HubSpot',
  'Microsoft Dynamics',
  'Oracle CX',
  'SAP CRM',
  'Zoho CRM'
];

export default function OpportunityForm({
  opportunity,
  isOpen,
  onClose,
  onSubmit,
  mode
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    name: '',
    accountId: '',
    contactId: '',
    stage: 'Qualification',
    amount: 0,
    probability: 0,
    expectedCloseDate: '',
    assignedTo: '',
    source: '',
    description: '',
    products: [],
    competitors: [],
    nextStep: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && opportunity) {
        setFormData(opportunity);
      } else {
        setFormData({
          name: '',
          accountId: '',
          contactId: '',
          stage: 'Qualification',
          amount: 0,
          probability: 0,
          expectedCloseDate: '',
          assignedTo: '',
          source: '',
          description: '',
          products: [],
          competitors: [],
          nextStep: '',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, opportunity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Opportunity name is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Assigned to is required';
    }
    if (formData.probability === undefined || formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting opportunity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Opportunity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductToggle = (product: string) => {
    const currentProducts = formData.products || [];
    const updatedProducts = currentProducts.includes(product)
      ? currentProducts.filter(p => p !== product)
      : [...currentProducts, product];
    handleChange('products', updatedProducts);
  };

  const handleCompetitorToggle = (competitor: string) => {
    const currentCompetitors = formData.competitors || [];
    const updatedCompetitors = currentCompetitors.includes(competitor)
      ? currentCompetitors.filter(c => c !== competitor)
      : [...currentCompetitors, competitor];
    handleChange('competitors', updatedCompetitors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span>{mode === 'add' ? 'Create New Opportunity' : 'Edit Opportunity'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="basic" className="flex items-center justify-center space-x-1 py-2 px-3 text-xs">
                  <Briefcase className="w-3 h-3" />
                  <span className="hidden sm:inline">Basic Info</span>
                  <span className="sm:hidden">Basic</span>
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center justify-center space-x-1 py-2 px-3 text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span className="hidden sm:inline">Financial</span>
                  <span className="sm:hidden">Money</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center justify-center space-x-1 py-2 px-3 text-xs">
                  <Tag className="w-3 h-3" />
                  <span className="hidden sm:inline">Products</span>
                  <span className="sm:hidden">Items</span>
                </TabsTrigger>
                <TabsTrigger value="additional" className="flex items-center justify-center space-x-1 py-2 px-3 text-xs">
                  <FileText className="w-3 h-3" />
                  <span className="hidden sm:inline">Additional</span>
                  <span className="sm:hidden">More</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Opportunity Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter opportunity name"
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="stage">Stage</Label>
                      <Select value={formData.stage} onValueChange={(value) => handleChange('stage', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOptions.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountId">Account</Label>
                      <Input
                        id="accountId"
                        value={formData.accountId}
                        onChange={(e) => handleChange('accountId', e.target.value)}
                        className="mt-1"
                        placeholder="Account name or ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactId">Primary Contact</Label>
                      <Input
                        id="contactId"
                        value={formData.contactId}
                        onChange={(e) => handleChange('contactId', e.target.value)}
                        className="mt-1"
                        placeholder="Contact name or ID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignedTo">Assigned To *</Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                        <SelectTrigger className={`mt-1 ${errors.assignedTo ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {assigneeOptions.map(assignee => (
                            <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assignedTo && <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>}
                    </div>
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceOptions.map(source => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Describe the opportunity..."
                    />
                  </div>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount ($) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', Number(e.target.value))}
                        className={`mt-1 ${errors.amount ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                      <Label htmlFor="probability">Probability (%) *</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => handleChange('probability', Number(e.target.value))}
                        className={`mt-1 ${errors.probability ? 'border-red-500' : ''}`}
                        placeholder="0"
                      />
                      {errors.probability && <p className="text-sm text-red-500 mt-1">{errors.probability}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      value={formData.expectedCloseDate}
                      onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                      className={`mt-1 ${errors.expectedCloseDate ? 'border-red-500' : ''}`}
                    />
                    {errors.expectedCloseDate && <p className="text-sm text-red-500 mt-1">{errors.expectedCloseDate}</p>}
                  </div>

                  <div>
                    <Label>Weighted Value</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <div className="text-lg font-semibold text-gray-900">
                        ${((formData.amount || 0) * (formData.probability || 0) / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Amount × Probability = ${(formData.amount || 0).toLocaleString()} × {formData.probability || 0}%
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Products & Competition Tab */}
                <TabsContent value="products" className="space-y-6">
                  <div>
                    <Label>Products/Services</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {productOptions.map(product => (
                        <div key={product} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`product-${product}`}
                            checked={formData.products?.includes(product) || false}
                            onChange={() => handleProductToggle(product)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`product-${product}`} className="text-sm">
                            {product}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.products && formData.products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.products.map(product => (
                          <Badge key={product} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Competitors</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {competitorOptions.map(competitor => (
                        <div key={competitor} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`competitor-${competitor}`}
                            checked={formData.competitors?.includes(competitor) || false}
                            onChange={() => handleCompetitorToggle(competitor)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`competitor-${competitor}`} className="text-sm">
                            {competitor}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.competitors && formData.competitors.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.competitors.map(competitor => (
                          <Badge key={competitor} variant="outline" className="text-xs">
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Additional Tab */}
                <TabsContent value="additional" className="space-y-4">
                  <div>
                    <Label htmlFor="nextStep">Next Step</Label>
                    <Input
                      id="nextStep"
                      value={formData.nextStep}
                      onChange={(e) => handleChange('nextStep', e.target.value)}
                      className="mt-1"
                      placeholder="What's the next action to take?"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active Opportunity</Label>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Opportunity Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div>Name: {formData.name || 'Not specified'}</div>
                      <div>Amount: ${(formData.amount || 0).toLocaleString()}</div>
                      <div>Stage: {formData.stage}</div>
                      <div>Probability: {formData.probability || 0}%</div>
                      <div>Weighted Value: ${((formData.amount || 0) * (formData.probability || 0) / 100).toLocaleString()}</div>
                      <div>Expected Close: {formData.expectedCloseDate || 'Not set'}</div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.form>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Opportunity' : 'Update Opportunity'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}