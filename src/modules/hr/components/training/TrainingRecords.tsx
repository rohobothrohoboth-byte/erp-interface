import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Download, Search, Filter } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

const trainingRecords = [
  {
    id: 'TR-001',
    name: 'Leadership Development',
    participant: 'John Smith',
    date: '2024-05-15',
    status: 'Completed',
    score: '92%',
    certificate: 'Available',
  },
  {
    id: 'TR-002',
    name: 'Technical Skills Workshop',
    participant: 'Sarah Johnson',
    date: '2024-05-18',
    status: 'Completed',
    score: '88%',
    certificate: 'Available',
  },
  {
    id: 'TR-003',
    name: 'Project Management',
    participant: 'Michael Chen',
    date: '2024-05-20',
    status: 'In Progress',
    score: '-',
    certificate: 'Pending',
  },
  {
    id: 'TR-004',
    name: 'Communication Skills',
    participant: 'Emily Davis',
    date: '2024-05-22',
    status: 'Completed',
    score: '95%',
    certificate: 'Available',
  },
  {
    id: 'TR-005',
    name: 'Data Analysis',
    participant: 'Robert Wilson',
    date: '2024-05-25',
    status: 'Not Started',
    score: '-',
    certificate: '-',
  },
];

export default function TrainingRecords() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Records</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search records..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Training Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Training ID</TableHead>
                <TableHead>Training Name</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.participant}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === 'Completed'
                          ? 'default'
                          : record.status === 'In Progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.score}</TableCell>
                  <TableCell>
                    {record.certificate === 'Available' ? (
                      <Button variant="link" size="sm">
                        Download
                      </Button>
                    ) : (
                      record.certificate
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}