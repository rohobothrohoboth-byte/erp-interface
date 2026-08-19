import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Search, PlusCircle, Download, Mail, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const EnrollmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample enrollment data
  const [enrollments, setEnrollments] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      department: 'Marketing',
      status: 'confirmed',
      registeredDate: 'Jun 1, 2024',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 's.williams@example.com',
      department: 'Engineering',
      status: 'pending',
      registeredDate: 'Jun 3, 2024',
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      department: 'Sales',
      status: 'confirmed',
      registeredDate: 'May 28, 2024',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      department: 'HR',
      status: 'waitlisted',
      registeredDate: 'Jun 5, 2024',
    },
  ]);

  const handleStatusChange = (id: number, newStatus: string) => {
    setEnrollments(enrollments.map(enrollment => 
      enrollment.id === id ? { ...enrollment, status: newStatus } : enrollment
    ));
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusVariants = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    waitlisted: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search enrollments..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Reminder
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{enrollment.name}</TableCell>
                  <TableCell>{enrollment.email}</TableCell>
                  <TableCell>{enrollment.department}</TableCell>
                  <TableCell>
                    <Badge className={statusVariants[enrollment.status as keyof typeof statusVariants]}>
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{enrollment.registeredDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, 'confirmed')}
                        >
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, 'pending')}
                        >
                          Set as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, 'waitlisted')}
                        >
                          Waitlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, 'cancelled')}
                          className="text-red-600"
                        >
                          Cancel Enrollment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Enrollment Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Waitlisted</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total</span>
                <span className="font-medium">4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Mail className="h-6 w-6" />
                <span>Send Welcome Email</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <span>Generate Roster</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <PlusCircle className="h-6 w-6" />
                <span>Bulk Add</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Download className="h-6 w-6" />
                <span>Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentManagement;