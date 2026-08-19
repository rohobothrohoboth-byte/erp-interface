import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { FileText } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import EnrollmentManagement from '@/modules/hr/components/training/EnrollmentManagement';

const TrainingDetails = () => {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-500" />
          <span>Training Details</span>
        </CardTitle>
        <CardDescription>
          Detailed information about the selected training program
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className='cursor-pointer'>Details</TabsTrigger>
            <TabsTrigger value="enrollment" className='cursor-pointer'>Enrollment</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'details' ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold">Leadership Development Program</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">8 weeks</Badge>
                <Badge variant="outline">Hybrid</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive leadership training for managers and team leads focusing on strategic thinking, 
                  effective communication, and team management skills. The program includes workshops, case studies, 
                  and mentorship sessions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Schedule</h3>
                <p className="text-sm text-gray-600">
                  Every Tuesday & Thursday<br />
                  2:00 PM - 4:00 PM<br />
                  Starts: Jun 15, 2024<br />
                  Ends: Aug 10, 2024
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Details</h3>
                <p className="text-sm text-gray-600">
                  <strong>Location:</strong> Main Conference Room (Virtual option available)<br />
                  <strong>Instructor:</strong> Dr. Sarah Johnson<br />
                  <strong>Capacity:</strong> 25 participants<br />
                  <strong>CE Credits:</strong> 16 hours
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <h3 className="font-medium">Prerequisites</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  <li>Minimum 1 year in management role</li>
                  <li>Completed Basic Leadership Training</li>
                  <li>Manager approval required</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Materials</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  <li>Course workbook</li>
                  <li>Recommended reading list</li>
                  <li>Online resources</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Edit Details</Button>
              <Button>Manage Resources</Button>
            </div>
          </div>
        ) : (
          <EnrollmentManagement />
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingDetails;