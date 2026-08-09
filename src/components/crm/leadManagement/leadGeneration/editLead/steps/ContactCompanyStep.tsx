// src/components/crm/leadManagement/leadGeneration/editLead/steps/EditContactCompanyStep.tsx
import React from 'react';
import { MapPin, Briefcase, DollarSign, Calendar, FileText, ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import type { UpdateLeadDto } from '../../../../../types/crm/crm.types';

interface EditContactCompanyStepProps {
  formData: UpdateLeadDto;
  onChange: (data: Partial<UpdateLeadDto>) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

const EditContactCompanyStep: React.FC<EditContactCompanyStepProps> = ({
                                                                         formData,
                                                                         onChange,
                                                                         onBack,
                                                                         onSubmit,
                                                                         loading = false,
                                                                       }) => {
  return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          Company & Additional Details
        </h2>

        {/* Address */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Address</Label>
              <Input
                  value={formData.address || ''}
                  onChange={(e) => onChange({ address: e.target.value })}
                  className="mt-1"
                  placeholder="123 Main St"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">City</Label>
              <Input
                  value={formData.city || ''}
                  onChange={(e) => onChange({ city: e.target.value })}
                  className="mt-1"
                  placeholder="New York"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">State</Label>
              <Input
                  value={formData.state || ''}
                  onChange={(e) => onChange({ state: e.target.value })}
                  className="mt-1"
                  placeholder="NY"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Country</Label>
              <Input
                  value={formData.country || ''}
                  onChange={(e) => onChange({ country: e.target.value })}
                  className="mt-1"
                  placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Lead Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                  value={formData.status || 'New'}
                  onValueChange={(value) => onChange({ status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Source</Label>
              <Select
                  value={formData.source || 'Website'}
                  onValueChange={(value) => onChange({ source: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="SocialMedia">Social Media</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="ColdCall">Cold Call</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                  value={formData.priority || 'Medium'}
                  onValueChange={(value) => onChange({ priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Industry</Label>
              <Select
                  value={formData.industry || ''}
                  onValueChange={(value) => onChange({ industry: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RealEstate">Real Estate</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                  value={formData.title || ''}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="mt-1"
                  placeholder="Sales Manager"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <Input
                  value={formData.tags || ''}
                  onChange={(e) => onChange({ tags: e.target.value })}
                  className="mt-1"
                  placeholder="enterprise, high-value"
              />
            </div>
          </div>
        </div>

        {/* Financial */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            Financial Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Budget</Label>
              <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => onChange({ budget: parseFloat(e.target.value) || undefined })}
                  className="mt-1"
                  placeholder="100000"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Estimated Value</Label>
              <Input
                  type="number"
                  value={formData.estimatedValue || ''}
                  onChange={(e) => onChange({ estimatedValue: parseFloat(e.target.value) || undefined })}
                  className="mt-1"
                  placeholder="50000"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Expected Close Date</Label>
              <Input
                  type="date"
                  value={formData.expectedCloseDate || ''}
                  onChange={(e) => onChange({ expectedCloseDate: e.target.value })}
                  className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Description
          </Label>
          <Textarea
              value={formData.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              className="mt-1"
              placeholder="Enter lead description, requirements, or notes..."
              rows={4}
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Update Lead'}
          </Button>
        </div>
      </div>
  );
};

export default EditContactCompanyStep;