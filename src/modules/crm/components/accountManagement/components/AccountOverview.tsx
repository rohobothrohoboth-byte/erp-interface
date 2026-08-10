import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Building, MapPin, Calendar, DollarSign, Users, Globe } from 'lucide-react';
import type { Account } from '@/modules/crm/types/crm';

interface AccountOverviewProps {
  account: Account;
}

export default function AccountOverview({ account }: AccountOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Prospect': return 'bg-yellow-100 text-yellow-800';
      case 'Partner': return 'bg-purple-100 text-purple-800';
      case 'Vendor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Information */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>Company Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Company Name</label>
            <p className="text-gray-900 font-semibold">{account.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Industry</label>
              <p className="text-gray-900">{account.industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Company Size</label>
              <p className="text-gray-900">{account.companySize}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Account Type</label>
            <div className="mt-1">
              <Badge className={getAccountTypeColor(account.accountType)}>
                {account.accountType}
              </Badge>
            </div>
          </div>

          {account.website && (
            <div>
              <label className="text-sm font-medium text-gray-500">Website</label>
              <div className="flex items-center space-x-2 mt-1">
                <Globe className="w-4 h-4 text-gray-400" />
                <a 
                  href={account.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {account.website}
                </a>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-700 mt-1">{account.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{account.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{account.phone}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <div className="text-gray-900">
              <p>{account.address}</p>
              <p>{account.city}, {account.state} {account.zipCode}</p>
              <p>{account.country}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Account Owner</label>
            <p className="text-gray-900">{account.owner}</p>
          </div>
        </CardContent>
      </Card>

      {/* Business Metrics */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>Business Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Annual Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(account.revenue)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Employees</div>
              <div className="text-2xl font-bold text-blue-600">
                {account.employees}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Contacts</div>
              <div className="text-2xl font-bold text-purple-600">
                {account.contactIds.length}
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Opportunities</div>
              <div className="text-2xl font-bold text-orange-600">
                {account.opportunityIds.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Timeline Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Account Created</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(account.createdAt)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Last Updated</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(account.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {account.tags.length > 0 && (
        <Card className="border-blue-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {account.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}