// CandidateTable.tsx
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { History } from 'lucide-react';
import type { Candidate } from '@/modules/hr/types/candidate';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const CandidateTable = ({ 
  candidates, 
  showFullHistory, 
  onViewDetails, 
  onStageChange, 
  onStatusChange, 
  onToggleHistory,
  stageOptions,
  statusOptions
}: { 
  candidates: Candidate[]; 
  showFullHistory: boolean; 
  onViewDetails: (candidate: Candidate) => void; 
  onStageChange: (id: string, stage: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onToggleHistory: () => void;
  stageOptions: string[];
  statusOptions: string[];
}) => {
  const [filters, setFilters] = React.useState({
    position: 'all',
    department: 'all',
    stage: 'all',
    status: 'all'
  });

  // Get unique values for filter dropdowns
  const positions = Array.from(new Set(candidates.map(c => c.position)));
  const departments = Array.from(new Set(candidates.map(c => c.department)));

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredCandidates = candidates
    .filter(c => !showFullHistory ? c.stage !== 'Hired' && c.stage !== 'Rejected' : true)
    .filter(c => 
      (filters.position === 'all' || c.position === filters.position) &&
      (filters.department === 'all' || c.department === filters.department) &&
      (filters.stage === 'all' || c.stage === filters.stage) &&
      (filters.status === 'all' || c.status === filters.status)
    );

  // Define color classes
  const getStageColorClass = (stage: string) => {
    switch(stage) {
      case 'Interview':
      case 'Hired':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'Rejected':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'Offer':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'Application':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'Screening':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusColorClass = (status: string) => {
    if (['Scheduled', 'Interviewed', 'Negotiating', 'Hired'].includes(status)) {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    if (['Rejected', 'Declined'].includes(status)) {
      return 'bg-red-500 text-white hover:bg-red-600';
    }
    if (['New', 'In Review', 'Offer Sent'].includes(status)) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <Select 
              value={filters.position}
              onValueChange={value => handleFilterChange('position', value)}
            >
              <SelectTrigger className='cursor-pointer'>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(pos => (
                  <SelectItem className='cursor-pointer' key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Select 
              value={filters.department}
              onValueChange={value => handleFilterChange('department', value)}
            >
              <SelectTrigger className='cursor-pointer'>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem  className='cursor-pointer' key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <Select 
              value={filters.stage}
              onValueChange={value => handleFilterChange('stage', value)}
            >
              <SelectTrigger className='cursor-pointer'>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stageOptions.map(stage => (
                  <SelectItem className='cursor-pointer' key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select 
              value={filters.status}
              onValueChange={value => handleFilterChange('status', value)}
            >
              <SelectTrigger className='cursor-pointer'>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem className='cursor-pointer' key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Days in Stage</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>{candidate.position}</TableCell>
                <TableCell>{candidate.department}</TableCell>
                <TableCell>
                  <Select
                    value={candidate.stage}
                    onValueChange={(value) => onStageChange(candidate.id, value)}
                  >
                    <SelectTrigger className="w-[150px] cursor-pointer">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map(option => (
                        <SelectItem  className='cursor-pointer' key={option} value={option}>
                          <Badge className={getStageColorClass(option)}>
                            {option}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={candidate.status}
                    onValueChange={(value) => onStatusChange(candidate.id, value)}
                  >
                    <SelectTrigger className="w-[150px] cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option} value={option}  className='cursor-pointer'>
                          <Badge className={getStatusColorClass(option)}>
                            {option}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{candidate.daysInStage}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewDetails(candidate)}
                     className='cursor-pointer'
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            onClick={onToggleHistory}
            className="flex items-center cursor-pointer"
          >
            <History className="w-4 h-4 mr-2" />
            {showFullHistory ? 'Hide Full History' : 'View Full History'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateTable;