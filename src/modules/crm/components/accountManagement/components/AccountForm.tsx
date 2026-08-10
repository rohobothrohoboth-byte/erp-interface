import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Save, User, MapPin, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { Account } from '@/modules/crm/types/crm';

interface AccountFormProps {
  account?: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: Partial<Account>) => void;
  mode: 'add' | 'edit';
  initialData?: Partial<Account>;
}

export default function AccountForm({ 
  account, 
  isOpen, 
  onClose, 
  onSubmit, 
  mode,
  initialData 
}: AccountFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    accountType: 'Customer',
    owner: '',
    notes: '',
    tags: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && account) {
        setFormData(account);
      } else if (mode === 'add') {
        setFormData({
          name: initialData?.name || '',
          industry: initialData?.industry || '',
          website: initialData?.website || '',
          phone: initialData?.phone || '',
          email: initialData?.email || '',
          address: initialData?.address || '',
          city: initialData?.city || '',
          state: initialData?.state || '',
          zipCode: initialData?.zipCode || '',
          country: initialData?.country || 'USA',
          accountType: initialData?.accountType || 'Customer',
          owner: initialData?.owner || '',
          notes: initialData?.notes || '',
          tags: initialData?.tags || []
        });
      }
    }
  }, [isOpen, mode, account, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting account form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Account, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>{mode === 'add' ? 'Create Account' : 'Edit Account'}</span>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Contact & Address</span>
                </TabsTrigger>
                <TabsTrigger value="additional" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Additional</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Account Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter account name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Technology, Healthcare"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select 
                        value={formData.accountType} 
                        onValueChange={(value) => handleInputChange('accountType', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Prospect">Prospect</SelectItem>
                          <SelectItem value="Customer">Customer</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="owner">Account Owner</Label>
                      <Input
                        id="owner"
                        value={formData.owner}
                        onChange={(e) => handleInputChange('owner', e.target.value)}
                        placeholder="Assigned owner"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="contact@company.com"
                            type="email"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Address Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="123 Main Street"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="New York"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="NY"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                            <Input
                              id="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              placeholder="10001"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="w-1/3">
                          <Label htmlFor="country">Country</Label>
                          <Select 
                            value={formData.country} 
                            onValueChange={(value) => handleInputChange('country', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USA">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes about this account..."
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.form>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || !formData.name?.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Account' : 'Update Account'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}