import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Textarea } from '../../../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import type { Lead } from '../../../../../../types/crm';

const salesReps = ['Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Robert Chen', 'Lisa Anderson'];

interface LeadDetailsStepProps {
  formData: Partial<Lead>;
  errors: Record<string, string>;
  leadSourceNames: string[];
  leadStatusNames: string[];
  leadCategoryNames: string[];
  contactMethodNames: string[];
  settingsLoading: boolean;
  onChange: (field: keyof Lead, value: any) => void;
}

export default function LeadDetailsStep({
  formData,
  errors,
  leadSourceNames,
  leadStatusNames,
  leadCategoryNames,
  contactMethodNames,
  settingsLoading,
  onChange,
}: LeadDetailsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Lead Details</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Source</Label>
          <Select value={formData.source} onValueChange={(v) => onChange('source', v)}>
            <SelectTrigger className="w-full focus:ring-1 focus:ring-orange-500">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {settingsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                leadSourceNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Status</Label>
          <Select value={formData.status} onValueChange={(v) => onChange('status', v)}>
            <SelectTrigger className="w-full focus:ring-1 focus:ring-orange-500">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {settingsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                leadStatusNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Lead Quality</Label>
          <Select value={formData.leadQuality} onValueChange={(v) => onChange('leadQuality', v)}>
            <SelectTrigger className="w-full focus:ring-1 focus:ring-orange-500">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {settingsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                leadCategoryNames.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Preferred Contact Method</Label>
          <Select value={formData.preferredContactMethod} onValueChange={(v) => onChange('preferredContactMethod', v)}>
            <SelectTrigger className="w-full focus:ring-1 focus:ring-orange-500">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {settingsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                contactMethodNames.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Assigned To</Label>
          <Select value={formData.assignedTo} onValueChange={(v) => onChange('assignedTo', v)}>
            <SelectTrigger className="w-full focus:ring-1 focus:ring-orange-500">
              <SelectValue placeholder="Auto-assign or select sales rep" />
            </SelectTrigger>
            <SelectContent>
              {salesReps.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Lead Score (0-100)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.score || ''}
            onChange={(e) => onChange('score', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="w-full focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-gray-500">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={4}
          placeholder="Additional notes about this lead..."
          className="w-full focus:ring-1 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
