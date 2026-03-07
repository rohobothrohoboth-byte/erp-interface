import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import type { Invoice } from '../types';
import ViewInvoiceModal from '../payment/ViewInvoiceModal';
import ApproveRejectModal from './ApproveRejectModal';

interface InvoiceApprovalListProps {
  invoices: Invoice[];
  onApprove: (invoiceId: string, comment: string) => void;
  onReject: (invoiceId: string, comment: string) => void;
}

const InvoiceApprovalList: React.FC<InvoiceApprovalListProps> = ({
  invoices,
  onApprove,
  onReject,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveRejectModalOpen, setApproveRejectModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In_Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending_Approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApproveClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActionType('approve');
    setApproveRejectModalOpen(true);
  };

  const handleRejectClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActionType('reject');
    setApproveRejectModalOpen(true);
  };

  const handleViewClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleConfirmAction = (comment: string) => {
    if (!selectedInvoice) return;
    
    if (actionType === 'approve') {
      onApprove(selectedInvoice.id, comment);
    } else {
      onReject(selectedInvoice.id, comment);
    }
    
    setApproveRejectModalOpen(false);
    setSelectedInvoice(null);
  };

  const getCurrentStepInfo = (invoice: Invoice) => {
    const currentStep = invoice.approval_history.find(
      (h) => h.step_order === invoice.current_approval_step
    );
    return currentStep;
  };

  return (
    <div className="space-y-3">
      {invoices.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No invoices pending approval</p>
        </div>
      ) : (
        invoices.map((invoice) => {
          const currentStep = getCurrentStepInfo(invoice);
          
          return (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invoice.invoice_no}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(invoice.approval_status)}`}
                      >
                        {invoice.approval_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{invoice.vendor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {formatDate(invoice.due_date)}
                    </p>
                  </div>
                </div>

                {/* Current Approval Step */}
                {currentStep && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-blue-300">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {currentStep.approver_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {currentStep.step_name} - Step {currentStep.step_order}
                        </p>
                        <p className="text-xs text-gray-600">
                          {currentStep.approver_name} ({currentStep.approver_role})
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        Pending
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Approval History */}
                {invoice.approval_history.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Approval Progress:</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {invoice.approval_history.map((step, index) => (
                        <React.Fragment key={step.step_order}>
                          <div className="flex flex-col items-center min-w-[80px]">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                step.action === 'Approved'
                                  ? 'bg-green-500 text-white'
                                  : step.action === 'Rejected'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              {step.step_order}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 text-center">
                              {step.approver_name.split(' ')[0]}
                            </p>
                            {step.action !== 'Pending' && (
                              <p className="text-xs text-gray-500">
                                {step.action === 'Approved' ? '✓' : '✗'}
                              </p>
                            )}
                          </div>
                          {index < invoice.approval_history.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {invoice.description}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClick(invoice)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  
                  {invoice.approval_status !== 'Approved' && invoice.approval_status !== 'Rejected' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproveClick(invoice)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(invoice)}
                        className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Modals */}
      {selectedInvoice && (
        <>
          <ViewInvoiceModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
          />
          <ApproveRejectModal
            isOpen={approveRejectModalOpen}
            onClose={() => {
              setApproveRejectModalOpen(false);
              setSelectedInvoice(null);
            }}
            onConfirm={handleConfirmAction}
            actionType={actionType}
            invoice={selectedInvoice}
          />
        </>
      )}
    </div>
  );
};

export default InvoiceApprovalList;
