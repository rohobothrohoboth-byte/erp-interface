// src/components/crm/salesManagement/components/opportunities/OpportunityDetails.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Target,
  DollarSign,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  FileText,
  Edit,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Badge } from '../../../../ui/badge';
import type { OpportunityDto } from '../../../../../types/crm/crm.types';

interface OpportunityDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateQuote?: () => void;
  onSendQuote?: () => void;
  opportunity: OpportunityDto | null;
  isSending?: boolean;
}

const OpportunityDetails: React.FC<OpportunityDetailsProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onEdit,
                                                                 onDelete,
                                                                 onCreateQuote,
                                                                 onSendQuote,
                                                                 opportunity,
                                                                 isSending = false,
                                                               }) => {
  if (!isOpen || !opportunity) return null;

  const getStageBadge = (stage: string) => {
    const variants: Record<string, string> = {
      'Discovery': 'bg-blue-100 text-blue-700 border-blue-200',
      'Qualification': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Proposal': 'bg-purple-100 text-purple-700 border-purple-200',
      'Negotiation': 'bg-orange-100 text-orange-700 border-orange-200',
      'ClosedWon': 'bg-green-100 text-green-700 border-green-200',
      'ClosedLost': 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[stage] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStageIcon = (stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Discovery': <Target className="h-4 w-4" />,
      'Qualification': <Users className="h-4 w-4" />,
      'Proposal': <FileText className="h-4 w-4" />,
      'Negotiation': <TrendingUp className="h-4 w-4" />,
      'ClosedWon': <CheckCircle className="h-4 w-4" />,
      'ClosedLost': <XCircle className="h-4 w-4" />,
    };
    return icons[stage] || <Target className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isClosed = opportunity.stage === 'ClosedWon' || opportunity.stage === 'ClosedLost';

  return (
      <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={onClose}
              />

              {/* Modal */}
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/20 rounded-lg p-2">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {opportunity.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStageBadge(opportunity.stage)}>
                            {getStageIcon(opportunity.stage)}
                            <span className="ml-1">{opportunity.stage}</span>
                          </Badge>
                          {opportunity.customerName && (
                              <span className="text-sm text-blue-200 flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                {opportunity.customerName}
                                                </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                    {!isClosed && onSendQuote && (
                        <Button
                            size="sm"
                            onClick={onSendQuote}
                            disabled={isSending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSending ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                          ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Quote
                              </>
                          )}
                        </Button>
                    )}
                    {!isClosed && onCreateQuote && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCreateQuote}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Quote
                        </Button>
                    )}
                    {!isClosed && onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                    )}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700 font-medium">Amount</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {formatCurrency(opportunity.amount || 0)}
                            </p>
                          </div>
                          <div className="p-2 bg-blue-200 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700 font-medium">Win Probability</p>
                            <p className="text-2xl font-bold text-green-900">
                              {opportunity.winProbability || 0}%
                            </p>
                          </div>
                          <div className="p-2 bg-green-200 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700 font-medium">Expected Close</p>
                            <p className="text-lg font-bold text-purple-900">
                              {formatDate(opportunity.expectedCloseDate)}
                            </p>
                          </div>
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <Calendar className="h-5 w-5 text-purple-700" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      {/* Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">
                            {opportunity.description || 'No description provided.'}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Timeline */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Created</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(opportunity.createdAt)}
                                </p>
                              </div>
                            </div>
                            {opportunity.updatedAt && (
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Last Updated</p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(opportunity.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      {/* Assigned To */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Assigned To</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {opportunity.assignedToUserName || 'Unassigned'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Related Records */}
                      {(opportunity.customerName || opportunity.leadName) && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Related Records</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {opportunity.customerName && (
                                  <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">
                                                            Customer: {opportunity.customerName}
                                                        </span>
                                  </div>
                              )}
                              {opportunity.leadName && (
                                  <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-700">
                                                            Lead: {opportunity.leadName}
                                                        </span>
                                  </div>
                              )}
                            </CardContent>
                          </Card>
                      )}

                      {/* Status Info */}
                      {isClosed && (
                          <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-yellow-700">
                                <AlertCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">
                                                                        This opportunity is {opportunity.stage === 'ClosedWon' ? 'won' : 'lost'} and closed.
                                                                    </span>
                              </div>
                            </CardContent>
                          </Card>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Badge className={getStageBadge(opportunity.stage)}>
                      {getStageIcon(opportunity.stage)}
                      <span className="ml-1">{opportunity.stage}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    {!isClosed && onEdit && (
                        <Button
                            onClick={onEdit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Opportunity
                        </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
  );
};

export default OpportunityDetails;