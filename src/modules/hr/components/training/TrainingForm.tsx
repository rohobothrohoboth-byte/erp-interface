import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';

const TrainingForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-emerald-500" />
          <span>Create New Training</span>
        </CardTitle>
        <CardDescription>
          Add a new training program or course to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Training Title</label>
              <input className="w-full p-2 border rounded" placeholder="Enter title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select className="w-full p-2 border rounded">
                <option>Select category</option>
                <option>Leadership</option>
                <option>Technical</option>
                <option>Compliance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input type="date" className="w-full p-2 border rounded" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input type="date" className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea className="w-full p-2 border rounded" rows={3} placeholder="Enter description"></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Save Training</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrainingForm;