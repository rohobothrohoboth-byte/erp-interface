import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Phone, Mail, Globe, Building, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { showToast } from '@/shared/layout/layout';
import AccountOverview from '@/modules/crm/components/accountManagement/components/AccountOverview';
import AccountContacts from '@/modules/crm/components/accountManagement/components/AccountContacts';
import AccountOpportunities from '@/modules/crm/components/accountManagement/components/AccountOpportunities';
import AccountActivities from '@/modules/crm/components/accountManagement/components/AccountActivities';
import type { Account } from '@/modules/crm/types/crm';

// Mock data - in real app, this would come from API
const mockAccount: Account = {
  id: '1',
  name: 'Innovation Labs',
  industry: 'Technology',
  companySize: '50-100',
  website: 'https://innovationlabs.com',
  phone: '+1-555-0123',
  email: 'info@innovationlabs.com',
  address: '123 Business Ave',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  country: 'USA',
  description: 'Leading technology company specializing in AI and machine learning solutions.',
  tags: ['Enterprise', 'Technology', 'AI'],
  owner: 'Sarah Johnson',
  accountType: 'Customer',
  revenue: 2500000,
  employees: 75,
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-01-18T12:00:00Z',
  isActive: true,
  primaryContactId: '1',
  contactIds: ['1', '2', '3'],
  opportunityIds: ['1', '2']
};

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In a real app, fetch account from API
    if (id) {
      setAccount(mockAccount);
    } else {
      showToast.error('Account not found');
      navigate('/crm/accounts');
    }
  }, [id, navigate]);

  if (!account) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Prospect': return 'bg-yellow-100 text-yellow-800';
      case 'Partner': return 'bg-purple-100 text-purple-800';
      case 'Vendor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/crm/accounts')}
            className="hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-gray-600">{account.industry} • {account.companySize} employees</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`tel:${account.phone}`, '_self')}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`mailto:${account.email}`, '_self')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          {account.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(account.website, '_blank')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Website
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Account
          </Button>
        </div>
      </div>

      {/* Account Summary Card */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Company Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{account.name}</h3>
                <Badge className={getAccountTypeColor(account.accountType)}>
                  {account.accountType}
                </Badge>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{account.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{account.phone}</span>
              </div>
              {account.website && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              )}
            </div>

            {/* Business Metrics */}
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Annual Revenue</span>
                <div className="font-semibold text-green-600">{formatCurrency(account.revenue)}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Employees</span>
                <div className="font-semibold">{account.employees}</div>
              </div>
            </div>

            {/* Relationships */}
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Contacts</span>
                <div className="font-semibold text-blue-600">{account.contactIds.length}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Opportunities</span>
                <div className="font-semibold text-purple-600">{account.opportunityIds.length}</div>
              </div>
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-500">Account Owner</span>
                <div className="font-semibold">{account.owner}</div>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Created</span>
                <div className="text-xs text-gray-500">
                  {new Date(account.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {account.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {account.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center space-y-1"
          onClick={() => navigate(`/crm/contacts/add?accountId=${account.id}`)}
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center space-y-1"
          onClick={() => setActiveTab('opportunities')}
        >
          <Plus className="w-5 h-5" />
          <span>Add Opportunity</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex flex-col items-center justify-center space-y-1"
          onClick={() => setActiveTab('activities')}
        >
          <Plus className="w-5 h-5" />
          <span>Log Activity</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-blue-50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Contacts ({account.contactIds.length})
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Opportunities ({account.opportunityIds.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AccountOverview account={account} />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <AccountContacts accountId={account.id} />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <AccountOpportunities accountId={account.id} />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <AccountActivities accountId={account.id} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}