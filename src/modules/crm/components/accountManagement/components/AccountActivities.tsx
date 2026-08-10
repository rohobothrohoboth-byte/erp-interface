import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface AccountActivitiesProps {
  accountId: string;
}

export default function AccountActivities({ accountId }: AccountActivitiesProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Activities</h3>
          <p className="text-sm text-gray-600">Track all interactions with this account</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Placeholder */}
      <Card className="border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-500 mb-4">Start logging activities to track account interactions.</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Log First Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}