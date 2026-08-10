import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/shared/layout/layout';

interface Opportunity {
  id: string;
  name: string;
  stage: 'Qualification' | 'Needs Analysis' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  source: string;
  description: string;
}

interface OpportunityFormProps {
  opportunity?: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  contactId: string;
  mode: 'add' | 'edit';
}

export default function OpportunityForm({ 
  opportunity, 
  isOpen, 
  onClose, 
  onSubmit, 
  contactId, 
  mode 
}: OpportunityFormProps) {
  type StageType = 'Qualification' | 'Needs Analysis' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

  const [formData, setFormData] = useState({
    name: '',
    stage: 'Qualification' as StageType,
    amount: '',
    probability: '50',
    expectedCloseDate: new Date(),
    source: '',
    description: ''
  });

  useEffect(() => {
    if (mode === 'edit' && opportunity) {
      setFormData({
        name: opportunity.name,
        stage: opportunity.stage,
        amount: opportunity.amount.toString(),
        probability: opportunity.probability.toString(),
        expectedCloseDate: new Date(opportunity.expectedCloseDate),
        source: opportunity.source,
        description: opportunity.description
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        stage: 'Qualification',
        amount: '',
        probability: '50',
        expectedCloseDate: new Date(),
        source: '',
        description: ''
      });
    }
  }, [mode, opportunity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.description) {
      showToast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    const probability = parseInt(formData.probability);

    if (isNaN(amount) || amount <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }

    if (isNaN(probability) || probability < 0 || probability > 100) {
      showToast.error('Probability must be between 0 and 100');
      return;
    }

    onSubmit({
      ...formData,
      amount,
      probability,
      expectedCloseDate: formData.expectedCloseDate.toISOString()
    });

    if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        name: '',
        stage: 'Qualification',
        amount: '',
        probability: '50',
        expectedCloseDate: new Date(),
        source: '',
        description: ''
      });
    }

    showToast.success(`Opportunity ${mode === 'add' ? 'added' : 'updated'} successfully`);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stageProbabilityMap = {
    'Qualification': 25,
    'Needs Analysis': 40,
    'Proposal': 60,
    'Negotiation': 80,
    'Closed Won': 100,
    'Closed Lost': 0
  };

  const handleStageChange = (stage: string) => {
    handleChange('stage', stage);
    // Auto-update probability based on stage
    const suggestedProbability = stageProbabilityMap[stage as keyof typeof stageProbabilityMap];
    handleChange('probability', suggestedProbability.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Opportunity" : "Edit Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Opportunity Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter opportunity name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the opportunity..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={handleStageChange}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleChange("source", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%) *</Label>
              <Input
                id="probability"
                type="number"
                value={formData.probability}
                onChange={(e) => handleChange("probability", e.target.value)}
                placeholder="50"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expected Close Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.expectedCloseDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expectedCloseDate}
                  onSelect={(date) =>
                    date && handleChange("expectedCloseDate", date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {mode === "add" ? "Add Opportunity" : "Update Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}