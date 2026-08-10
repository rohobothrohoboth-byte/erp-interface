import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const events = [
  {
    title: 'Leadership Training',
    date: 'Jun 15, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Conference Room A',
    status: 'confirmed',
  },
  {
    title: 'Technical Workshop',
    date: 'Jun 18, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'Lab 3',
    status: 'confirmed',
  },
  {
    title: 'New Hire Orientation',
    date: 'Jun 20, 2024',
    time: 'All Day',
    location: 'Main Hall',
    status: 'scheduled',
  },
  {
    title: 'Safety Training',
    date: 'Jun 25, 2024',
    time: '9:00 AM - 11:00 AM',
    location: 'Training Room 2',
    status: 'pending',
  },
];

export default function TrainingCalendar() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Calendar</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Training Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 font-medium text-sm pb-2 border-b">
              <div className="text-center">Sun</div>
              <div className="text-center">Mon</div>
              <div className="text-center">Tue</div>
              <div className="text-center">Wed</div>
              <div className="text-center">Thu</div>
              <div className="text-center">Fri</div>
              <div className="text-center">Sat</div>
            </div>
            
            {/* Calendar grid would go here */}
            <div className="text-center py-8 text-gray-500">
              Calendar grid view would be implemented here
            </div>
            
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg text-xs font-medium">
                    {event.date.split(' ')[1]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {event.time} • {event.location}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}