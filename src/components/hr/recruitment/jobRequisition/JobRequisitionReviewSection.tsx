import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import { showToast } from '../../../../layout/layout';
import { useJobRequisition, useReviewJobRequisition } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import { ReviewStat } from '../../../../types/hr/enum';

interface JobRequisitionReviewSectionProps {
  reqId: string;
}

const JobRequisitionReviewSection: React.FC<JobRequisitionReviewSectionProps> = ({ reqId }) => {
  const navigate = useNavigate();
  const { data: req, isLoading: reqLoading } = useJobRequisition(reqId);

  const [form, setForm] = useState({ reviewById: '', status: '', comment: '' });

  const reviewMutation = useReviewJobRequisition({
    onSuccess: () => {
      showToast.success('Review submitted successfully');
      setForm({ reviewById: '', status: '', comment: '' });
    },
    onError: (e) => showToast.error(e.message || 'Failed to submit review'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      id: reqId,
      reviewById: form.reviewById,
      status: form.status as any,
      comment: form.comment || null,
    });
  };

  if (reqLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Job requisition not found.</p>
      </div>
    );
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 space-y-6 min-h-screen">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Review Job Requisition
              </span>
            </h1>
            <p className="text-sm text-gray-500">{req.reqNumber}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Req Number</p>
          <p className="font-mono text-sm font-medium">{req.reqNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{req.statusStr}</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quantity</p>
          <p className="text-sm font-medium">{req.reqQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Position</p>
          <p className="text-sm text-gray-700">{req.position}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">JG Step</p>
          <p className="text-sm text-gray-700">{req.jgStep}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
          <p className="text-sm text-gray-600">{req.startDateStr || new Date(req.startDate).toLocaleDateString()}</p>
        </div>
        <div className="md:col-span-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason</p>
          <p className="text-sm text-gray-700">{req.reqReason}</p>
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-green-600" /> Submit Review
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Reviewer (Employee ID) <span className="text-red-500">*</span></Label>
            <Input required value={form.reviewById}
              onChange={(e) => setForm(f => ({ ...f, reviewById: e.target.value }))}
              placeholder="Employee UUID" disabled={reviewMutation.isPending} />
          </div>
          <div className="space-y-2">
            <Label>Review Decision <span className="text-red-500">*</span></Label>
            <EnumSelect
              enumObject={ReviewStat}
              value={form.status}
              onChange={(v) => setForm(f => ({ ...f, status: v }))}
              placeholder="— Select decision —"
              disabled={reviewMutation.isPending}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Comment</Label>
            <textarea rows={3} value={form.comment}
              onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Add review notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              disabled={reviewMutation.isPending} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={reviewMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white px-8 cursor-pointer">
              {reviewMutation.isPending
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Submitting...</>
                : <><Send className="w-4 h-4 mr-2" />Submit Review</>}
            </Button>
          </div>
        </form>
      </div>
    </motion.section>
  );
};

export default JobRequisitionReviewSection;
