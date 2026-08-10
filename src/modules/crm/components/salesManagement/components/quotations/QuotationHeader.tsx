import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface QuotationHeaderProps {
  onAddQuotation: () => void;
  metrics: {
    totalQuotations: number;
    pendingQuotations: number;
    approvedQuotations: number;
    totalValue: number;
  };
}

export default function QuotationHeader({ onAddQuotation, metrics }: QuotationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
          <p className="text-gray-600">Create, manage, and track sales quotations and proposals</p>
        </div>
        <Button onClick={onAddQuotation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Quotations</p>
                <p className="text-lg font-bold text-gray-900">{metrics.totalQuotations}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pending Approval</p>
                <p className="text-lg font-bold text-orange-600">{metrics.pendingQuotations}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Approved</p>
                <p className="text-lg font-bold text-green-600">{metrics.approvedQuotations}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-gray-900">${metrics.totalValue.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}