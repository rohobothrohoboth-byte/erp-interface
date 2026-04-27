import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Eye, Search, X, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { useAllApplicants } from '../../../services/hr/recruitment/applicant/applicant.queries';
import ApplicantDetailModal from '../../../components/hr/recruitment/applicant/ApplicantDetailModal';

const PAGE_SIZE = 10;

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Shortlisted: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status || 'Pending'}
    </span>
  );
};

const PostApplicantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId, postNumber } = useParams<{ postId: string; postNumber?: string }>();
  const displayPostNumber = postNumber ? decodeURIComponent(postNumber) : '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allApplicants = [], isLoading } = useAllApplicants();

  // Filter by postId — match via jobPostingNum or by checking the post's applicants
  // We use postNumber to match since that's what the list DTO has
  const applicants = allApplicants.filter(a =>
    displayPostNumber ? a.jobPostingNum === displayPostNumber : true
  );

  const filtered = applicants.filter(a =>
    a.applicant?.toLowerCase().includes(search.toLowerCase()) ||
    a.statusStr?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Applicants
              </span>
            </h1>
            {displayPostNumber && <p className="text-sm text-gray-500">Job Posting: {displayPostNumber}</p>}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search applicants..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Applicant', 'Position', 'Department', 'Applied Date', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto" />
              </td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No applicants found</td></tr>
            ) : paged.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{app.applicant}</td>
                <td className="px-5 py-3 text-gray-600">{app.position}</td>
                <td className="px-5 py-3 text-gray-600">{app.department}</td>
                <td className="px-5 py-3 text-gray-500">{app.appliedDateStr || app.appliedDate?.split('T')[0]}</td>
                <td className="px-5 py-3"><StatusBadge status={app.statusStr} /></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setSelectedId(app.id)}
                      className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/hr/recruitment/applicant/${app.id}/evaluate`)}
                      className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white">
                      <ClipboardCheck className="w-3 h-3" /> Evaluate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1} className="h-7 w-7 p-0 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages} className="h-7 w-7 p-0 cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ApplicantDetailModal applicantId={selectedId} onClose={() => setSelectedId(null)} />
    </motion.section>
  );
};

export default PostApplicantsPage;
