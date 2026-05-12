import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import CandidateMetrics from "../../../components/hr/recrutement/CandidateMetrics";
import CandidateDetail from "../../../components/hr/recrutement/CandidateDetail";
import CandidateStageChart from "../../../components/hr/recrutement/CandidateStageChart";
import DepartmentApplicationChart from "../../../components/hr/recrutement/DepartmentApplicationChart";
import CandidateTable from "../../../components/hr/recrutement/CandidateTable";
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useModuleStore } from "../../../stores/module.store";
import type { Candidate } from '../../../types/candidate';

const CandidatePipeline = () => {
    // All hooks at the top
  const setActiveModule = useModuleStore((s) => s.setActiveModule);
  const storedModule = sessionStorage.getItem('currentModule');
  
  useEffect(() => {
    if (storedModule) {
      setActiveModule(storedModule);
    }
  }, [setActiveModule, storedModule]);

  const { candidateId } = useParams();
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Initialize candidates from sessionStorage or default data
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const savedCandidates = sessionStorage.getItem('candidates');
    return savedCandidates ? JSON.parse(savedCandidates) : [
    {
      id: 'CAN-1001',
      name: 'John Smith',
      position: 'Software Engineer',
      source: 'LinkedIn',
      stage: 'Interview',
      status: 'Scheduled',
      department: 'Engineering',
      appliedDate: '2023-07-01',
      daysInStage: 5,
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      resume: 'john_smith_resume.pdf',
      interviewDate: '2023-07-15',
      experience: '5 years',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      notes: 'Strong technical skills, excellent communication',
      education: 'BSc Computer Science, MIT',
      location: 'San Francisco, CA',
      salaryExpectation: '$120,000',
      history: [
        { date: '2023-07-01', stage: 'Application', status: 'New', note: 'Applied via LinkedIn' },
        { date: '2023-07-03', stage: 'Screening', status: 'In Review', note: 'Resume screened by HR' },
        { date: '2023-07-10', stage: 'Interview', status: 'Scheduled', note: 'Technical interview scheduled' }
      ]
    },
    {
      id: 'CAN-1002',
      name: 'Sarah Johnson',
      position: 'UX Designer',
      source: 'Company Website',
      stage: 'Application',
      status: 'New',
      department: 'Design',
      appliedDate: '2023-07-10',
      daysInStage: 2,
      email: 'sarah.johnson@example.com',
      phone: '(555) 987-6543',
      resume: 'sarah_johnson_resume.pdf',
      experience: '3 years',
      skills: ['Figma', 'UI/UX Design', 'User Research', 'Prototyping'],
      notes: 'Impressive portfolio with diverse projects',
      education: 'BA Design, Stanford University',
      location: 'New York, NY',
      salaryExpectation: '$95,000',
      history: [
        { date: '2023-07-10', stage: 'Application', status: 'New', note: 'Applied via company website' }
      ]
    },
    {
      id: 'CAN-1003',
      name: 'Michael Chen',
      position: 'Data Analyst',
      source: 'Referral',
      stage: 'Offer',
      status: 'Negotiating',
      department: 'Data',
      appliedDate: '2023-07-05',
      daysInStage: 8,
      email: 'michael.chen@example.com',
      phone: '(555) 456-7890',
      resume: 'michael_chen_resume.pdf',
      interviewDate: '2023-07-18',
      experience: '4 years',
      skills: ['Python', 'SQL', 'Data Visualization', 'Machine Learning'],
      notes: 'Strong analytical skills, needs visa sponsorship',
      education: 'MSc Data Science, Harvard University',
      location: 'Boston, MA',
      salaryExpectation: '$110,000',
      history: [
        { date: '2023-07-05', stage: 'Application', status: 'New', note: 'Referred by employee' },
        { date: '2023-07-08', stage: 'Screening', status: 'Approved', note: 'Passed initial screening' },
        { date: '2023-07-12', stage: 'Interview', status: 'Completed', note: 'Technical interview passed' },
        { date: '2023-07-15', stage: 'Offer', status: 'Negotiating', note: 'Salary negotiation in progress' }
      ]
    },
    {
      id: 'CAN-1004',
      name: 'Emily Davis',
      position: 'Product Manager',
      source: 'Job Board',
      stage: 'Screening',
      status: 'In Review',
      department: 'Product',
      appliedDate: '2023-07-03',
      daysInStage: 4,
      email: 'emily.davis@example.com',
      phone: '(555) 234-5678',
      resume: 'emily_davis_resume.pdf',
      experience: '6 years',
      skills: ['Product Strategy', 'Agile', 'Market Research', 'Roadmapping'],
      notes: 'Previous experience at FAANG companies',
      education: 'MBA, Wharton School',
      location: 'Seattle, WA',
      salaryExpectation: '$140,000',
      history: [
        { date: '2023-07-03', stage: 'Application', status: 'New', note: 'Applied via job board' },
        { date: '2023-07-05', stage: 'Screening', status: 'In Review', note: 'Resume under review' }
      ]
    },
    {
      id: 'CAN-1005',
      name: 'David Wilson',
      position: 'DevOps Engineer',
      source: 'LinkedIn',
      stage: 'Hired',
      status: 'Completed',
      department: 'Engineering',
      appliedDate: '2023-06-20',
      daysInStage: 0,
      email: 'david.wilson@example.com',
      phone: '(555) 876-5432',
      resume: 'david_wilson_resume.pdf',
      experience: '7 years',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      notes: 'Extensive cloud infrastructure experience',
      education: 'MSc Computer Engineering, Caltech',
      location: 'Austin, TX',
      salaryExpectation: '$135,000',
      history: [
        { date: '2023-06-20', stage: 'Application', status: 'New', note: 'Applied via LinkedIn' },
        { date: '2023-06-25', stage: 'Screening', status: 'Approved', note: 'Passed initial screening' },
        { date: '2023-06-30', stage: 'Interview', status: 'Completed', note: 'Technical interview passed' },
        { date: '2023-07-05', stage: 'Offer', status: 'Accepted', note: 'Offer accepted' },
        { date: '2023-07-10', stage: 'Hired', status: 'Completed', note: 'Onboarding completed' }
      ]
    },
    {
      id: 'CAN-1006',
      name: 'Lisa Thompson',
      position: 'Marketing Specialist',
      source: 'Company Website',
      stage: 'Rejected',
      status: 'Declined',
      department: 'Marketing',
      appliedDate: '2023-07-02',
      daysInStage: 3,
      email: 'lisa.thompson@example.com',
      phone: '(555) 345-6789',
      resume: 'lisa_thompson_resume.pdf',
      experience: '4 years',
      skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media'],
      notes: 'Good skills but not the right cultural fit',
      education: 'BA Marketing, NYU',
      location: 'Chicago, IL',
      salaryExpectation: '$85,000',
      history: [
        { date: '2023-07-02', stage: 'Application', status: 'New', note: 'Applied via company website' },
        { date: '2023-07-05', stage: 'Screening', status: 'Approved', note: 'Resume approved' },
        { date: '2023-07-08', stage: 'Interview', status: 'Completed', note: 'Interview completed' },
        { date: '2023-07-12', stage: 'Rejected', status: 'Declined', note: 'Not selected after interview' }
      ]
    }
    ];
  });

  // Stage and status options
  

    // Save candidates to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('candidates', JSON.stringify(candidates));
  }, [candidates]);

  // Stage and status options
  const stageOptions = ['Application', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const statusOptions = ['New', 'Scheduled', 'In Review', 'Completed', 'Approved', 'Negotiating', 'Accepted', 'Declined', 'Hired', 'Rejected'];

  // Metrics data
  const metrics = [
    { id: 1, title: 'Total Applicants', value: 124, change: '+12%', icon: <Users className="w-6 h-6" /> },
    { id: 2, title: 'Hired Candidates', value: 24, change: '+5%', icon: <CheckCircle className="w-6 h-6" /> },
    { id: 3, title: 'Time to Hire (Avg)', value: '24 days', change: '-3 days', icon: <Clock className="w-6 h-6" /> },
    { id: 4, title: 'Rejected Candidates', value: 86, change: '+8%', icon: <XCircle className="w-6 h-6" /> },
  ];

  // Charts data
  const stageData = [
    { name: 'Application', candidates: 45 },
    { name: 'Screening', candidates: 28 },
    { name: 'Interview', candidates: 18 },
    { name: 'Offer', candidates: 12 },
    { name: 'Hired', candidates: 24 },
  ];

  const departmentData = [
    { name: 'Engineering', applicants: 42 },
    { name: 'Marketing', applicants: 28 },
    { name: 'Sales', applicants: 32 },
    { name: 'HR', applicants: 12 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleViewDetails = (candidate: Candidate) => {
    // Store candidate data and module context before opening new tab
    sessionStorage.setItem('selectedCandidate', JSON.stringify(candidate));
    sessionStorage.setItem('currentModule', 'HR');
    window.open(`/hr/recruitment/candidates/${candidate.id}`, '_blank');
  };

  const handleStageChange = (candidateId: string, newStage: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              stage: newStage,
              history: [
                ...candidate.history,
                { 
                  date: new Date().toISOString().split('T')[0], 
                  stage: newStage, 
                  status: candidate.status,
                  note: `Stage changed to ${newStage}`
                }
              ]
            } 
          : candidate
      )
    );
  };

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              status: newStatus,
              history: [
                ...candidate.history,
                { 
                  date: new Date().toISOString().split('T')[0], 
                  stage: candidate.stage, 
                  status: newStatus,
                  note: `Status changed to ${newStatus}`
                }
              ]
            } 
          : candidate
      )
    );
  };



  // If we're in a candidate detail tab
  if (candidateId) {
    const storedCandidate = sessionStorage.getItem('selectedCandidate');
    const storedModule = sessionStorage.getItem('currentModule');
    
    if (storedCandidate && storedModule === 'HR') {
      const selectedCandidate = JSON.parse(storedCandidate);
      
      return (
        <div className="space-y-6">
          <CandidateDetail 
            candidate={selectedCandidate}
            onBack={() => window.close()}
            onStageChange={(newStage) => handleStageChange(selectedCandidate.id, newStage)}
            onStatusChange={(newStatus) => handleStatusChange(selectedCandidate.id, newStatus)}
            
            stageOptions={stageOptions}
            statusOptions={statusOptions}
          />
        </div>
      );
    }
    return <div className="p-8 text-center">Candidate data not found. Please reopen from the candidate list.</div>;
  }

  return (
    <div className='space-y-6'>
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-2xl md:text-3xl font-bold mt-6">Candidate <span className='text-gray-900'>Pipeline</span> </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <CandidateMetrics metrics={metrics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CandidateStageChart data={stageData} />
          <DepartmentApplicationChart data={departmentData} colors={COLORS} />
        </div>

        <CandidateTable 
          candidates={candidates}
          showFullHistory={showFullHistory}
          onViewDetails={handleViewDetails}
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
          onToggleHistory={() => setShowFullHistory(!showFullHistory)}
          stageOptions={stageOptions}
          statusOptions={statusOptions}
        />
      </CardContent>
    </div>
  );
};

export default CandidatePipeline;
