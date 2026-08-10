import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface AccountOpportunitiesProps {
  accountId: string;
}

export default function AccountOpportunities({ accountId }: AccountOpportunitiesProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Opportunities</h3>
          <p className="text-sm text-gray-600">Track sales opportunities for this account</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Placeholder */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
            <p className="text-gray-500 mb-4">Create opportunities to track potential sales.</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}