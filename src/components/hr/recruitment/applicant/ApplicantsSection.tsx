import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, X, Eye, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../../ui/button';
import { useAllApplicants, useApplicantsByPost } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import ApplicantDetailModal from './ApplicantDetailModal';
import type { JobAppListDto } from '../../../../types/hr/recruit/jopApp';

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

// ── Posting-level table (all postings grouped) ──────────────────────────────
interface PostingRow { postNum: string; position: string; department: string; period: string; count: number; firstId: string; }

const PostingsTable: React.FC<{
  rows: PostingRow[];
  onSelect: (postNum: string, firstId: string) => void;
}> = ({ rows, onSelect }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Post Number', 'Position', 'Department', 'Period', 'Applicants', ''].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {paged.length === 0 ? (
            <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No postings found</td></tr>
          ) : paged.map((row) => (
            <tr key={row.postNum} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-800">{row.postNum}</td>
              <td className="px-5 py-3 text-gray-600">{row.position}</td>
              <td className="px-5 py-3 text-gray-600">{row.department}</td>
              <td className="px-5 py-3 text-gray-500">{row.period}</td>
              <td className="px-5 py-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {row.count}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => onSelect(row.postNum, row.firstId)}
                  className="flex items-center gap-1 cursor-pointer h-7 px-3 text-xs">
                  <Eye className="w-3 h-3" /> View Applicants
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, rows.length)}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
        </p>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1} className="h-7 w-7 p-0 cursor-pointer">
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
              <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'}
                onClick={() => setPage(p as number)}
                className={`h-7 w-7 p-0 cursor-pointer text-xs ${p === page ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}>
                {p}
              </Button>
            ))}
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages} className="h-7 w-7 p-0 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
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

  // We already have all applicants from parent; filter by postNum
  const { data: allApplicants = [], isLoading } = useAllApplicants();
  const applicants = allApplicants.filter(a => a.jobPostingNum === postNum);

  const filtered = applicants.filter(a =>
    a.applicant?.toLowerCase().includes(search.toLowerCase()) ||
    a.statusStr?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        <div>
          <h2 className="font-semibold text-gray-800">{postNum}</h2>
          <p className="text-xs text-gray-500">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
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
                  <Button size="sm" variant="outline" onClick={() => onView(app.id)}
                    className="flex items-center gap-1 cursor-pointer h-7 px-2 text-xs">
                    <Eye className="w-3 h-3" /> View
                  </Button>
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
    </div>
  );
};

// ── Main section ─────────────────────────────────────────────────────────────
const ApplicantsSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allApplicants = [], isLoading, error } = useAllApplicants();

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

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Error loading applicants: {error.message}</p>
    </div>
  );

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Job Applicants
            </span>
          </h1>
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
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by posting, position, or department..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : (
            <PostingsTable rows={postingRows} onSelect={(postNum) => setSelectedPost(postNum)} />
          )}
        </>
      )}

      <ApplicantDetailModal applicantId={selectedId} onClose={() => setSelectedId(null)} />
    </motion.section>
  );
};

export default ApplicantsSection;
