import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/shared/components/ui/button';
import { Download } from 'lucide-react';

const data = [
  { name: 'Jan', enrolled: 12, completed: 10 },
  { name: 'Feb', enrolled: 19, completed: 13 },
  { name: 'Mar', enrolled: 15, completed: 12 },
  { name: 'Apr', enrolled: 18, completed: 16 },
  { name: 'May', enrolled: 22, completed: 19 },
  { name: 'Jun', enrolled: 25, completed: 22 },
];

const pieData = [
  { name: 'Completed', value: 78 },
  { name: 'In Progress', value: 15 },
  { name: 'Not Started', value: 7 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function TrainingAnalysis() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Analytics</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Training Participation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold">84%</div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold">4.7/5</div>
              <p className="text-sm text-gray-600">Average Satisfaction</p>
            </div>
            <div>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">JD</div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">Completed 12 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">98% avg</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">AS</div>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-gray-600">Completed 10 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">96% avg</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">RJ</div>
                  <div>
                    <p className="font-medium">Robert Johnson</p>
                    <p className="text-sm text-gray-600">Completed 9 trainings</p>
                  </div>
                </div>
                <div className="text-green-600 font-medium">94% avg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}