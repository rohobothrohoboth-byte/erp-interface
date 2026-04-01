import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Megaphone } from 'lucide-react';
import { Button } from '../../../ui/button';
import { showToast } from '../../../../layout/layout';
import JobRequisitionTable from './JobRequisitionTable';
import AddJobPostingModal from '../jobPosting/AddJobPostingModal';
import { useJobRequisitions } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import type { JobReqListDto } from '../../../../types/hr/recruit/jobRequisition';

// Dummy no-op handlers — approved items can't be edited/reviewed/deleted from this view
const noop = () => {};

const ApprovedJobRequisitionSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [postingItem, setPostingItem] = useState<JobReqListDto | null>(null);
  const [isBulkPostOpen, setIsBulkPostOpen] = useState(false);

  // Fetch all requisitions — we filter client-side for approved ones
  // Pass a dummy workforcePlanId of 'all' and handle in the API or filter here
  const { data: allItems = [], isLoading } = useJobRequisitions('all');

  const approvedItems = allItems.filter((i) =>
    i.statusStr === 'Approve' || i.statusStr === 'Approved' || String(i.status) === '0'
  );

  const filtered = approvedItems.filter((i) =>
    i.reqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.reqReason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Megaphone className="w-6 h-6 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Approved Job Requisitions
            </span>
          </h1>
        </div>
      </div>

      {/* Search filter — employee style */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by req number or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsBulkPostOpen(true)} size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer">
              <Megaphone className="w-4 h-4" /> Post All
            </Button>
          </div>
        </div>
      </motion.div>

      <JobRequisitionTable
        items={filtered} isLoading={isLoading}
        onEdit={noop} onDelete={noop} onReview={noop}
        onPost={setPostingItem}
      />

      {/* Single post modal */}
      <AddJobPostingModal
        isOpen={!!postingItem}
        reqId={postingItem?.id ?? ''}
        onClose={() => setPostingItem(null)}
        onSubmit={() => { showToast.success('Job posting created successfully'); setPostingItem(null); }}
      />

      {/* Bulk post modal — sends a special "all" signal or the first approved req's workforcePlanId */}
      <AddJobPostingModal
        isOpen={isBulkPostOpen}
        reqId={approvedItems[0]?.workforcePlanId ?? ''}
        onClose={() => setIsBulkPostOpen(false)}
        onSubmit={() => { showToast.success('All job postings created successfully'); setIsBulkPostOpen(false); }}
      />
    </motion.section>
  );
};

export default ApprovedJobRequisitionSection;
