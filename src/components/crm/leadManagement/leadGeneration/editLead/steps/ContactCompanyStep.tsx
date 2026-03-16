import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import type { Lead } from '../../../../../../types/crm';

interface ContactCompanyStepProps {
  formData: Partial<Lead>;
  errors: Record<string, string>;
  industryNames: string[];
  settingsLoading: boolean;
  onChange: (field: keyof Lead, value: any) => void;
}

export default function ContactCompanyStep({
  formData,
  errors,
  industryNames,
  settingsLoading,
  onChange,
}: ContactCompanyStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact & Company Information</h2>

      <div className="border-b pb-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm text-gray-500">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className={`w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm text-gray-500">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              className={`w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-500">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm text-gray-500">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+1-555-0123"
              className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {errors.contact && <p className="text-sm text-red-500 mt-2">{errors.contact}</p>}

        <div className="mt-4 space-y-2">
          <Label htmlFor="jobTitle" className="text-sm text-gray-500">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm text-gray-500">
              Company <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => onChange('company', e.target.value)}
              className={`w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${errors.company ? 'border-red-500' : ''}`}
            />
            {errors.company && <p className="text-sm text-red-500 mt-1">{errors.company}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm text-gray-500">Industry</Label>
            <Select value={formData.industry} onValueChange={(v) => onChange('industry', v)}>
              <SelectTrigger className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {settingsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  industryNames.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm text-gray-500">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget || ''}
              onChange={(e) => onChange('budget', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm text-gray-500">Timeline</Label>
            <Input
              id="timeline"
              value={formData.timeline}
              onChange={(e) => onChange('timeline', e.target.value)}
              placeholder="e.g., Q2 2024, Immediate"
              className="w-full focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
