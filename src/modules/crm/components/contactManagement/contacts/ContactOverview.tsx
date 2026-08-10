import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { MapPin, Calendar, User, Building, Globe, Shield, Users, Edit } from 'lucide-react';
import type { Contact } from '@/modules/crm/types/crm';

interface ContactOverviewProps {
  contact: Contact;
  onEdit?: () => void;
}

export default function ContactOverview({ contact, onEdit }: ContactOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'bg-orange-100 text-orange-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-orange-100 text-orange-800';
      case 'team': return 'bg-purple-100 text-purple-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Personal Information */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <User className="w-4 h-4 text-orange-600" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">First Name</label>
              <p className="text-sm text-gray-900">{contact.firstName}</p>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Last Name</label>
              <p className="text-sm text-gray-900">{contact.lastName}</p>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500">Email Address</label>
            <p className="text-sm text-gray-900">{contact.email}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500">Phone Number</label>
            <p className="text-sm text-gray-900">{contact.phone}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {contact.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Building className="w-4 h-4 text-orange-600" />
            <span>Company Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <label className="text-xs font-medium text-gray-500">Company</label>
            <p className="text-sm text-gray-900">{contact.company}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500">Job Title</label>
            <p className="text-sm text-gray-900">{contact.jobTitle}</p>
          </div>

          {contact.customFields?.industry && (
            <div>
              <label className="text-xs font-medium text-gray-500">Industry</label>
              <p className="text-sm text-gray-900">{contact.customFields.industry}</p>
            </div>
          )}

          {contact.customFields?.companySize && (
            <div>
              <label className="text-xs font-medium text-gray-500">Company Size</label>
              <p className="text-sm text-gray-900">{contact.customFields.companySize}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Address Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <label className="text-xs font-medium text-gray-500">Street Address</label>
            <p className="text-sm text-gray-900">{contact.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">City</label>
              <p className="text-sm text-gray-900">{contact.city}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">State</label>
              <p className="text-sm text-gray-900">{contact.state}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">ZIP Code</label>
              <p className="text-sm text-gray-900">{contact.zipCode}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Country</label>
              <p className="text-sm text-gray-900">{contact.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRM Information */}
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Globe className="w-4 h-4 text-orange-600" />
            <span>CRM Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Stage</label>
              <Badge className={`mt-1 ${
                contact.stage === 'Lead' ? 'bg-orange-100 text-orange-800' :
                contact.stage === 'Prospect' ? 'bg-yellow-100 text-yellow-800' :
                contact.stage === 'Customer' ? 'bg-orange-100 text-orange-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {contact.stage}
              </Badge>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Owner</label>
              <p className="text-sm text-gray-900">{contact.owner}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Relationship Score</label>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-orange-600 h-1.5 rounded-full" 
                  style={{ width: `${contact.relationshipScore}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{contact.relationshipScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Team Visibility</label>
              <Badge className={`mt-1 ${getVisibilityColor(contact.teamVisibility)}`}>
                <Users className="w-3 h-3 mr-1" />
                {contact.teamVisibility}
              </Badge>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Consent Status</label>
              <Badge className={`mt-1 ${getConsentStatusColor(contact.consentStatus)}`}>
                <Shield className="w-3 h-3 mr-1" />
                {contact.consentStatus}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Last Interaction</label>
            <p className="text-sm text-gray-900 capitalize">{contact.lastInteractionType || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card className="border-orange-200 md:col-span-2 lg:col-span-3 xl:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>Timeline Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-gray-500">Created</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(contact.createdAt)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-gray-500">Last Updated</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(contact.updatedAt)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-gray-500">Last Contact</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(contact.lastContactDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {contact.notes && (
        <Card className="border-orange-200 md:col-span-2 lg:col-span-3 xl:col-span-4">
          <CardHeader >
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent >
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}