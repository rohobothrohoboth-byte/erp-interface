// src/components/hr/recruitment/applicant/ApplicantsSection.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, X, Eye, ChevronLeft, ChevronRight, ArrowLeft,
  RefreshCw, Loader2, Filter, Download, Printer,
  User, Briefcase, Calendar, Building2, MapPin,
  CheckCircle, XCircle, Clock, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAllApplicants } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import ApplicantDetailModal from '@/modules/hr/components/recruitment/applicant/ApplicantDetailModal';
import { formatDistanceToNow } from 'date-fns';
import type { JobAppListDto } from '@/modules/hr/types/recruit/jopApp';

const PAGE_SIZE = 10;

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: <Clock className="w-3 h-3" />
    },
    Approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: <CheckCircle className="w-3 h-3" />
    },
    Rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: <XCircle className="w-3 h-3" />
    },
    Shortlisted: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: <UserCheck className="w-3 h-3" />
    },
    Interviewed: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      icon: <User className="w-3 h-3" />
    },
    Hired: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      icon: <CheckCircle className="w-3 h-3" />
    },
  };

  const info = colors[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: <Clock className="w-3 h-3" />
  };

  return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.bg} ${info.text}`}>
      {info.icon}
        {status || 'Pending'}
    </span>
  );
};

// ── Posting-level table (all postings grouped) ──────────────────────────────
interface PostingRow {
  postNum: string;
  position: string;
  department: string;
  period: string;
  count: number;
  firstId: string;
  status?: string;
  deadline?: string;
}

const PostingsTable: React.FC<{
  rows: PostingRow[];
  onSelect: (postNum: string, firstId: string) => void;
  isLoading?: boolean;
}> = ({ rows, onSelect, isLoading }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
    );
  }

  return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Post Number', 'Position', 'Department', 'Period', 'Applicants', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No postings found</p>
                    <p className="text-sm text-gray-400">No job postings with applicants available</p>
                  </td>
                </tr>
            ) : paged.map((row) => (
                <tr key={row.postNum} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800 font-mono text-xs">{row.postNum}</td>
                  <td className="px-5 py-3 text-gray-600">{row.position}</td>
                  <td className="px-5 py-3 text-gray-600">{row.department}</td>
                  <td className="px-5 py-3 text-gray-500">{row.period}</td>
                  <td className="px-5 py-3">
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {row.count}
                  </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelect(row.postNum, row.firstId)}
                        className="flex items-center gap-1 cursor-pointer h-8 px-3 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Applicants
                    </Button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, rows.length)}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === '...' ? (
                        <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
                    ) : (
                        <Button
                            key={p}
                            size="sm"
                            variant={p === page ? 'default' : 'outline'}
                            onClick={() => setPage(p as number)}
                            className={`h-8 w-8 p-0 cursor-pointer text-xs ${p === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                        >
                          {p}
                        </Button>
                    ))}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
        )}
      </div>
  );
};

// ── Applicants-of-a-posting table ───────────────────────────────────────────
const PostApplicantsTable: React.FC<{
  postNum: string;
  onBack: () => void;
  onView: (id: string) => void;
}> = ({ postNum, onBack, onView }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: allApplicants = [], isLoading, refetch } = useAllApplicants();
  const applicants = allApplicants.filter(a => a.jobPostingNum === postNum);

  const filtered = applicants.filter(a =>
      a.applicant?.toLowerCase().includes(search.toLowerCase()) ||
      a.position?.toLowerCase().includes(search.toLowerCase()) ||
      a.department?.toLowerCase().includes(search.toLowerCase()) ||
      a.statusStr?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.statusStr === 'Pending').length,
    shortlisted: applicants.filter(a => a.statusStr === 'Shortlisted').length,
    hired: applicants.filter(a => a.statusStr === 'Hired').length,
    rejected: applicants.filter(a => a.statusStr === 'Rejected').length,
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <div>
              <h2 className="font-semibold text-gray-800">{postNum}</h2>
              <p className="text-xs text-gray-500">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500">Hired</p>
              <p className="text-lg font-bold text-green-600">{stats.hired}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-2">
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
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
              <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Applicant', 'Position', 'Department', 'Applied', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  </td></tr>
              ) : paged.length === 0 ? (
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
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(app.id)}
                          className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

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
      </div>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────
const ApplicantsSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allApplicants = [], isLoading, error, refetch } = useAllApplicants();

  const postingRows = useMemo<PostingRow[]>(() => {
    const map = new Map<string, JobAppListDto[]>();
    for (const a of allApplicants) {
      const key = a.jobPostingNum || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries())
        .map(([postNum, apps]) => ({
          postNum,
          position: apps[0]?.position ?? '',
          department: apps[0]?.department ?? '',
          period: apps[0]?.period ?? '',
          count: apps.length,
          firstId: apps[0]?.id ?? '',
        }))
        .filter(r =>
            r.postNum.toLowerCase().includes(search.toLowerCase()) ||
            r.position.toLowerCase().includes(search.toLowerCase()) ||
            r.department.toLowerCase().includes(search.toLowerCase())
        );
  }, [allApplicants, search]);

  // Calculate total stats
  const stats = {
    total: allApplicants.length,
    pending: allApplicants.filter(a => a.statusStr === 'Pending').length,
    shortlisted: allApplicants.filter(a => a.statusStr === 'Shortlisted').length,
    hired: allApplicants.filter(a => a.statusStr === 'Hired').length,
    rejected: allApplicants.filter(a => a.statusStr === 'Rejected').length,
  };

  if (error) return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error loading applicants</p>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
  );

  return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Job Applicants
              </span>
              </h1>
              <p className="text-sm text-gray-500">{stats.total} total applicants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              {stats.pending} pending
            </span>
              <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-500" />
                {stats.shortlisted} shortlisted
            </span>
              <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
                {stats.hired} hired
            </span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export
            </Button>
          </div>
        </div>

        {selectedPost ? (
            <PostApplicantsTable
                postNum={selectedPost}
                onBack={() => setSelectedPost(null)}
                onView={setSelectedId}
            />
        ) : (
            <>
              {/* Search */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search by posting, position, or department..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {search && (
                      <button
                          onClick={() => setSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                  )}
                </div>
              </div>

              <PostingsTable
                  rows={postingRows}
                  onSelect={(postNum) => setSelectedPost(postNum)}
                  isLoading={isLoading}
              />
            </>
        )}

        <ApplicantDetailModal applicantId={selectedId} onClose={() => setSelectedId(null)} />
      </motion.section>
  );
};

export default ApplicantsSection;