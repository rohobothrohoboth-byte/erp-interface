import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, RefreshCw, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { useNavigate, useParams } from 'react-router-dom';
import type { FixedAsset } from '../../../components/finance/assets/assetRegister/types';

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [asset, setAsset] = useState<FixedAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('depreciation');
  
  // History data state
  const [historyData, setHistoryData] = useState({
    revaluations: [] as any[],
    impairments: [] as any[],
    transfers: [] as any[],
    disposals: [] as any[],
    depreciationSchedule: [] as any[],
  });

  // Mock asset data - in real app, this would come from API
  useEffect(() => {
    const fetchAsset = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAsset: FixedAsset = {
          id: assetId || '1',
          asset_id: 'FA-1001',
          asset_name: 'Dell Laptop OptiPlex 7090',
          category: 'IT Equipment',
          department: 'IT Department',
          location: 'Head Office - Floor 3',
          vendor_name: 'Dell Technologies',
          purchase_date: '2024-01-15',
          capitalization_date: '2024-01-20',
          cost: 85000,
          residual_value: 5000,
          useful_life_years: 5,
          depreciation_method: 'STRAIGHT_LINE',
          accumulated_depreciation: 12000,
          net_book_value: 73000,
          status: 'ACTIVE',
          created_at: '2024-01-20T08:30:00Z',
          updated_at: '2024-01-20T08:30:00Z',
        };
        
        // Mock history data
        const mockHistoryData = {
          revaluations: [
            {
              id: '1',
              date: '2024-02-15',
              old_value: 73000,
              new_value: 80000,
              revaluation_gain: 7000,
              reason: 'Market value increase',
              created_by: 'John Doe',
            }
          ],
          impairments: [
            {
              id: '1',
              date: '2024-01-30',
              impairment_amount: 5000,
              old_net_book_value: 78000,
              new_net_book_value: 73000,
              reason: 'obsolescence',
              notes: 'Technology upgrade required',
              created_by: 'Jane Smith',
            }
          ],
          transfers: [
            {
              id: '1',
              date: '2024-02-01',
              from_department: 'HR Department',
              to_department: 'IT Department',
              from_location: 'Head Office - Floor 2',
              to_location: 'Head Office - Floor 3',
              reason: 'departmental_restructure',
              created_by: 'Mike Johnson',
            }
          ],
          disposals: [],
          depreciationSchedule: [
            {
              id: '1',
              period: '2024-01',
              opening_balance: 85000,
              depreciation_amount: 1333.33,
              accumulated_depreciation: 1333.33,
              closing_balance: 83666.67,
              date: '2024-01-31',
            },
            {
              id: '2',
              period: '2024-02',
              opening_balance: 83666.67,
              depreciation_amount: 1333.33,
              accumulated_depreciation: 2666.66,
              closing_balance: 82333.34,
              date: '2024-02-29',
            },
          ],
        };
        
        setAsset(mockAsset);
        setHistoryData(mockHistoryData);
      } catch (error) {
        console.error('Error fetching asset:', error);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          <p className="text-gray-600 mt-2">The requested asset could not be found.</p>
          <Button onClick={() => navigate('/finance/asset-register')} className="mt-4">
            Back 
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/finance/asset-register")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back 
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {asset.asset_name}
                </h1>
                {/* <p className="text-gray-600">
                  {asset.asset_id} • {asset.category}
                </p> */}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-2">
            <nav className="flex space-x-2 overflow-x-auto">
          
              <button
                onClick={() => setActiveTab('depreciation')}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'depreciation'
                    ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <TrendingDown className={`h-5 w-5 ${activeTab === 'depreciation' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Depreciation Schedule
                {activeTab === 'depreciation' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('revaluation')}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'revaluation'
                    ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <RefreshCw className={`h-5 w-5 ${activeTab === 'revaluation' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Revaluation History
                {activeTab === 'revaluation' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('impairment')}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'impairment'
                    ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <AlertCircle className={`h-5 w-5 ${activeTab === 'impairment' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Impairment History
                {activeTab === 'impairment' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'transfers'
                    ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <ArrowRight className={`h-5 w-5 ${activeTab === 'transfers' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Transfers
                {activeTab === 'transfers' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('disposal')}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'disposal'
                    ? 'bg-indigo-50 border border-indigo-300 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <Trash2 className={`h-5 w-5 ${activeTab === 'disposal' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Disposal
                {activeTab === 'disposal' && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></div>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-6">

            {activeTab === 'depreciation' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Schedule</h3>
                {historyData.depreciationSchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Opening Balance</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Depreciation</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Accumulated</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Closing Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.depreciationSchedule.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{entry.period}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(entry.opening_balance)}</td>
                            <td className="py-3 px-4 text-right text-red-600">{formatCurrency(entry.depreciation_amount)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(entry.accumulated_depreciation)}</td>
                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.closing_balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No depreciation entries found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revaluation' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revaluation History</h3>
                {historyData.revaluations.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.revaluations.map((revaluation) => (
                      <div key={revaluation.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">Revaluation on {formatDate(revaluation.date)}</p>
                            <p className="text-sm text-gray-600">By {revaluation.created_by}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            revaluation.revaluation_gain >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {revaluation.revaluation_gain >= 0 ? 'Gain' : 'Loss'}: {formatCurrency(Math.abs(revaluation.revaluation_gain))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Old Value:</p>
                            <p className="font-medium">{formatCurrency(revaluation.old_value)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">New Value:</p>
                            <p className="font-medium">{formatCurrency(revaluation.new_value)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Reason: {revaluation.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No revaluation history found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'impairment' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impairment History</h3>
                {historyData.impairments.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.impairments.map((impairment) => (
                      <div key={impairment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">Impairment on {formatDate(impairment.date)}</p>
                            <p className="text-sm text-gray-600">By {impairment.created_by}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            Loss: {formatCurrency(impairment.impairment_amount)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Old Net Book Value:</p>
                            <p className="font-medium">{formatCurrency(impairment.old_net_book_value)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">New Net Book Value:</p>
                            <p className="font-medium">{formatCurrency(impairment.new_net_book_value)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Reason: {impairment.reason}</p>
                          {impairment.notes && (
                            <p className="text-sm text-gray-600 mt-1">Notes: {impairment.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No impairment history found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transfers' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer History</h3>
                {historyData.transfers.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.transfers.map((transfer) => (
                      <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">Transfer on {formatDate(transfer.date)}</p>
                            <p className="text-sm text-gray-600">By {transfer.created_by}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">From:</p>
                            <p className="font-medium">{transfer.from_department}</p>
                            <p className="text-xs text-gray-500">{transfer.from_location}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">To:</p>
                            <p className="font-medium">{transfer.to_department}</p>
                            <p className="text-xs text-gray-500">{transfer.to_location}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Reason: {transfer.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transfer history found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'disposal' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Disposal Records</h3>
                {historyData.disposals.length > 0 ? (
                  <div className="space-y-4">
                    {historyData.disposals.map((disposal) => (
                      <div key={disposal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900">Disposal on {formatDate(disposal.date)}</p>
                            <p className="text-sm text-gray-600">By {disposal.created_by}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            disposal.gain_loss >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {disposal.gain_loss >= 0 ? 'Gain' : 'Loss'}: {formatCurrency(Math.abs(disposal.gain_loss))}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Method:</p>
                            <p className="font-medium capitalize">{disposal.disposal_method}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Sale Amount:</p>
                            <p className="font-medium">{formatCurrency(disposal.sale_amount || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Net Book Value:</p>
                            <p className="font-medium">{formatCurrency(disposal.net_book_value)}</p>
                          </div>
                        </div>
                        {disposal.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">Notes: {disposal.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No disposal records found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssetDetailPage;