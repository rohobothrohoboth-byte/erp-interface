// src/pages/hr/recruitmentpage/PostApplicantsPage.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  RefreshCw  // ✅ ADD THIS
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card'; // ✅ ADD THESE
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import ApplicantDetailModal from '@/modules/hr/components/recruitment/applicant/ApplicantDetailModal';
import { formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 10;

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Shortlisted: 'bg-blue-100 text-blue-700',
    Interviewed: 'bg-purple-100 text-purple-700',
    Hired: 'bg-emerald-100 text-emerald-700',
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

  const { data: allApplicants = [], isLoading, refetch } = useAllApplicants();

  // Filter applicants by job posting number
  const applicants = useMemo(() => {
    if (!displayPostNumber) return allApplicants;
    return allApplicants.filter(a => a.jobPostingNum === displayPostNumber);
  }, [allApplicants, displayPostNumber]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return applicants.filter(a =>
        a.applicant?.toLowerCase().includes(searchLower) ||
        a.position?.toLowerCase().includes(searchLower) ||
        a.department?.toLowerCase().includes(searchLower) ||
        a.statusStr?.toLowerCase().includes(searchLower)
    );
  }, [applicants, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.statusStr === 'Pending').length,
    shortlisted: applicants.filter(a => a.statusStr === 'Shortlisted').length,
    hired: applicants.filter(a => a.statusStr === 'Hired').length,
    rejected: applicants.filter(a => a.statusStr === 'Rejected').length,
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
  }

  return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Applicants
              </span>
              </h1>
              {displayPostNumber && <p className="text-sm text-gray-500">Job Posting: {displayPostNumber}</p>}
              <p className="text-xs text-gray-400">{stats.total} applicants</p>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Hired</p>
              <p className="text-xl font-bold text-green-600">{stats.hired}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              {['Applicant', 'Position', 'Department', 'Applied', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {paged.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No applicants found</td></tr>
            ) : paged.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{app.applicant}</td>
                  <td className="px-5 py-3 text-gray-600">{app.position}</td>
                  <td className="px-5 py-3 text-gray-600">{app.department}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={app.statusStr} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(app.id)}
                          className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                      <Button
                          size="sm"
                          onClick={() => navigate(`/hr/recruitment/applicant/${app.id}/evaluate`)} // ✅ Fixed path
                          className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
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
                  <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-7 w-7 p-0 cursor-pointer"
                  >
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