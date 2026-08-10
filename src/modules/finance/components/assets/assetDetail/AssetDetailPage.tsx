import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, DollarSign, Calendar, MapPin, User, Building, TrendingDown, RefreshCw, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { showToast } from '@/shared/layout/layout';
import type { FixedAsset } from '@/modules/finance/components/assets/assetRegister/types';

interface DepreciationScheduleEntry {
  period: string;
  opening_balance: number;
  depreciation_amount: number;
  accumulated_depreciation: number;
  closing_balance: number;
}

interface RevaluationEntry {
  id: string;
  date: string;
  old_value: number;
  new_value: number;
  revaluation_amount: number;
  reason: string;
  created_by: string;
}

interface TransferEntry {
  id: string;
  date: string;
  from_department: string;
  to_department: string;
  reason: string;
  created_by: string;
}

interface AuditLogEntry {
  id: string;
  date: string;
  action: string;
  details: string;
  user: string;
}

const AssetDetailPage: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<FixedAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('depreciation');

  // Mock data for demonstration
  const mockAsset: FixedAsset = {
    id: '1',
    asset_tag: 'FA-1001',
    asset_name: 'Dell Laptop OptiPlex 7090',
    asset_category: 'IT Equipment',
    department: 'IT Department',
    location: 'Head Office - Floor 3',
    vendor_name: 'Dell Technologies',
    purchase_date: '2024-01-15',
    capitalization_date: '2024-01-20',
    purchase_cost: 85000,
    residual_value: 5000,
    useful_life_years: 5,
    depreciation_method: 'STRAIGHT_LINE',
    accumulated_depreciation: 12000,
    net_book_value: 73000,
    status: 'ACTIVE',
    created_at: '2024-01-20T08:30:00Z',
    created_by: 'John Doe',
  };

  const mockDepreciationSchedule: DepreciationScheduleEntry[] = [
    { period: '2024-Q1', opening_balance: 85000, depreciation_amount: 4000, accumulated_depreciation: 4000, closing_balance: 81000 },
    { period: '2024-Q2', opening_balance: 81000, depreciation_amount: 4000, accumulated_depreciation: 8000, closing_balance: 77000 },
    { period: '2024-Q3', opening_balance: 77000, depreciation_amount: 4000, accumulated_depreciation: 12000, closing_balance: 73000 },
    { period: '2024-Q4', opening_balance: 73000, depreciation_amount: 4000, accumulated_depreciation: 16000, closing_balance: 69000 },
  ];

  const mockRevaluations: RevaluationEntry[] = [
    {
      id: '1',
      date: '2024-06-15',
      old_value: 73000,
      new_value: 78000,
      revaluation_amount: 5000,
      reason: 'Market value increase',
      created_by: 'Jane Smith'
    }
  ];

  const mockTransfers: TransferEntry[] = [
    {
      id: '1',
      date: '2024-03-10',
      from_department: 'IT Department',
      to_department: 'Finance Department',
      reason: 'Department restructuring',
      created_by: 'Mike Johnson'
    }
  ];

  const mockAuditLogs: AuditLogEntry[] = [
    { id: '1', date: '2024-01-20', action: 'Asset Capitalized', details: 'Asset capitalized and added to register', user: 'John Doe' },
    { id: '2', date: '2024-03-10', action: 'Asset Transferred', details: 'Transferred from IT to Finance Department', user: 'Mike Johnson' },
    { id: '3', date: '2024-06-15', action: 'Asset Revalued', details: 'Revaluation increase of ETB 5,000', user: 'Jane Smith' },
  ];

  useEffect(() => {
    const fetchAsset = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAsset(mockAsset);
      } catch (error) {
        console.error('Error fetching asset:', error);
        showToast('Error loading asset details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAction = (action: string) => {
    showToast(`${action} functionality will be implemented`, 'info');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Asset not found</h2>
          <Button onClick={() => navigate('/finance/asset-register')} className="mt-4">
            Back to Asset Register
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/finance/asset-register')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Register
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{asset.asset_name}</h1>
                  <p className="text-sm text-gray-600">{asset.asset_tag}</p>
                </div>
              </div>
            </div>
            
            {asset.status === 'ACTIVE' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleAction('Revalue')} className="flex items-center gap-2">
                  <RefreshCw size={16} />
                  Revalue
                </Button>
                <Button variant="outline" onClick={() => handleAction('Impair')} className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  Impair
                </Button>
                <Button variant="outline" onClick={() => handleAction('Transfer')} className="flex items-center gap-2">
                  <ArrowRight size={16} />
                  Transfer
                </Button>
                <Button variant="outline" onClick={() => handleAction('Dispose')} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <Trash2 size={16} />
                  Dispose
                </Button>
              </div>
            )}
          </div>

          {/* General Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                General Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Asset ID</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{asset.asset_tag}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Category</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{asset.asset_category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Department</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                      <Building className="w-4 h-4 text-gray-500" />
                      {asset.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Location</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {asset.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Vendor</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-500" />
                      {asset.vendor_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Purchase Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {formatDate(asset.purchase_date)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Capitalization Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(asset.capitalization_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Cost</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(asset.purchase_cost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Residual Value</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(asset.residual_value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Useful Life</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{asset.useful_life_years} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Depreciation Method</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{asset.depreciation_method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Accumulated Depreciation</p>
                    <p className="text-sm font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(asset.accumulated_depreciation)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Net Book Value</p>
                    <p className="text-lg font-bold text-indigo-600 mt-1">{formatCurrency(asset.net_book_value)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 rounded-t-xl">
                <TabsTrigger value="depreciation">Depreciation Schedule</TabsTrigger>
                <TabsTrigger value="revaluation">Revaluation History</TabsTrigger>
                <TabsTrigger value="impairment">Impairment History</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="disposal">Disposal</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="depreciation" className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Opening Balance</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depreciation</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Accumulated</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockDepreciationSchedule.map((entry, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.period}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(entry.opening_balance)}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(entry.depreciation_amount)}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right">{formatCurrency(entry.accumulated_depreciation)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-indigo-600 text-right">{formatCurrency(entry.closing_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="revaluation" className="p-6">
                {mockRevaluations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Old Value</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">New Value</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revaluation</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockRevaluations.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(entry.old_value)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(entry.new_value)}</td>
                            <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">+{formatCurrency(entry.revaluation_amount)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.reason}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.created_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No revaluation history</div>
                )}
              </TabsContent>

              <TabsContent value="impairment" className="p-6">
                <div className="text-center py-8 text-gray-500">No impairment history</div>
              </TabsContent>

              <TabsContent value="transfers" className="p-6">
                {mockTransfers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Department</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {mockTransfers.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.from_department}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.to_department}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.reason}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.created_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No transfer history</div>
                )}
              </TabsContent>

              <TabsContent value="disposal" className="p-6">
                <div className="text-center py-8 text-gray-500">Asset not disposed</div>
              </TabsContent>

              <TabsContent value="audit" className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockAuditLogs.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.action}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{entry.details}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{entry.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssetDetailPage;