import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
} from "@/shared/components/ui/card";
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { 
  Mail,
  Phone,
  FileText,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import type { Candidate } from '@/modules/hr/types/candidate';

const getStageColorClass = (stage: string) => {
  switch(stage) {
    case 'Interview':
    case 'Hired':
      return 'bg-green-500 text-white';
    case 'Rejected':
      return 'bg-red-500 text-white';
    case 'Offer':
      return 'bg-yellow-500 text-white';
    case 'Application':
      return 'bg-blue-500 text-white';
    case 'Screening':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColorClass = (status: string) => {
  if (['Scheduled', 'Interviewed', 'Negotiating', 'Hired'].includes(status)) {
    return 'bg-green-500 text-white';
  }
  if (['Rejected', 'Declined'].includes(status)) {
    return 'bg-red-500 text-white';
  }
  if (['New', 'In Review', 'Offer Sent'].includes(status)) {
    return 'bg-blue-500 text-white';
  }
  return 'bg-gray-100 text-gray-800';
};

const CandidateDetail = ({ 
  candidate,
  onStageChange,
  onStatusChange,
  stageOptions,
  statusOptions
}: { 
  candidate: Candidate;
  onBack: () => void;
  onStageChange: (stage: string) => void;
  onStatusChange: (status: string) => void;
  stageOptions: string[];
  statusOptions: string[];
}) => {
  // Generate initials for avatar
  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center space-x-4">

          <div>
            <CardTitle className="text-green-700 text-xl md:text-3xl font-bold">Candidate Details</CardTitle>
            <CardDescription>
              Detailed information for {candidate.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{candidate.name}</h3>
                  <p className="text-gray-600">{candidate.position}</p>
                  <p className="text-sm text-gray-500">{candidate.department} Department</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Experience: {candidate.experience}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Applied on {candidate.appliedDate}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    {candidate.resume}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Education</h4>
                <p className="text-gray-700">{candidate.education}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-gray-700">{candidate.location}</p>
              </div>
              

            </CardContent>
          </Card>
          
          {/* Status & Timeline */}
          <Card className="lg:col-span-2 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <Select
                    value={candidate.status}
                    onValueChange={onStatusChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          <Badge 
                            className={`${getStatusColorClass(option)} border-0 rounded-md px-2 py-1`}
                          >
                            {option}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Interview Date</h4>
                  <p className="text-gray-700">{candidate.interviewDate || 'Not scheduled yet'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Source</h4>
                  <p className="text-gray-700">{candidate.source}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Department</h4>
                  <p className="text-gray-700">{candidate.department}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Recruitment Pipeline</h4>
                <div className="flex items-center justify-between">
                  {stageOptions.map((stage, index) => (
                    <div key={stage} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        candidate.stage === stage 
                          ? getStageColorClass(stage)
                          : index <= stageOptions.indexOf(candidate.stage) 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`mt-2 text-xs ${
                        candidate.stage === stage 
                          ? 'font-bold text-blue-600' 
                          : 'text-gray-500'
                      }`}>
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Stage</h4>
                <Select
                  value={candidate.stage}
                  onValueChange={onStageChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        <Badge 
                          className={`${getStageColorClass(option)} border-0 rounded-md px-2 py-1`}
                        >
                          {option}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {candidate.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="border-gray-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{candidate.notes}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Candidate History</h4>
                <div className="space-y-4">
                  {candidate.history.map((entry, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {index < candidate.history.length - 1 && (
                          <div className="w-px h-full bg-gray-300"></div>
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{entry.stage} - 
                          <Badge 
                            className={`${getStatusColorClass(entry.status)} border-0 rounded-md px-2 py-0.5 ml-2`}
                          >
                            {entry.status}
                          </Badge>
                        </p>
                        <p className="text-sm text-gray-500">{entry.date}</p>
                        <p className="text-sm mt-1 text-gray-700">{entry.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateDetail;