import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, Play, FileText } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { showToast } from '../../../../layout/layout';

interface DepreciationResult {
  asset_tag: string;
  asset_name: string;
  depreciation_amount: number;
  period: string;
  status: 'SUCCESS' | 'ERROR';
}

const DepreciationManagementPage: React.FC = () => {
  const [formData, setFormData] = useState({
    depreciation_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    run_date: new Date().toISOString().split('T')[0],
    asset_category: 'ALL',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DepreciationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const assetCategories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'IT_EQUIPMENT', label: 'IT Equipment' },
    { value: 'OFFICE_EQUIPMENT', label: 'Office Equipment' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'MACHINERY', label: 'Machinery' },
  ];

  const mockResults: DepreciationResult[] = [
    { asset_tag: 'FA-1001', asset_name: 'Dell Laptop OptiPlex 7090', depreciation_amount: 4000, period: '2024-01', status: 'SUCCESS' },
    { asset_tag: 'FA-1002', asset_name: 'Office Printer HP LaserJet', depreciation_amount: 1500, period: '2024-01', status: 'SUCCESS' },
    { asset_tag: 'FA-1003', asset_name: 'Toyota Hilux 2024', depreciation_amount: 25000, period: '2024-01', status: 'SUCCESS' },
    { asset_tag: 'FA-1004', asset_name: 'Conference Room Projector', depreciation_amount: 2200, period: '2024-01', status: 'SUCCESS' },
    { asset_tag: 'FA-1005', asset_name: 'Executive Office Desk', depreciation_amount: 560, period: '2024-01', status: 'SUCCESS' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRunDepreciation = async () => {
    if (!formData.depreciation_period || !formData.run_date) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsRunning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setResults(mockResults);
      setShowResults(true);
      
      showToast('Depreciation run completed successfully', 'success');
      
      // In a real application, this would also create journal entries
      console.log('Journal entries created for depreciation');
      
    } catch (error) {
      console.error('Error running depreciation:', error);
      showToast('Error running depreciation', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const totalDepreciation = results.reduce((sum, result) => sum + result.depreciation_amount, 0);

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Depreciation Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Run depreciation calculations and generate journal entries
              </p>
            </div>
          </div>

          {/* Run Depreciation Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600" />
              Run Depreciation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="depreciation_period" className="text-sm text-gray-500">
                  Depreciation Period <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="depreciation_period"
                  type="month"
                  value={formData.depreciation_period}
                  onChange={(e) => setFormData({ ...formData, depreciation_period: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="run_date" className="text-sm text-gray-500">
                  Run Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="run_date"
                  type="date"
                  value={formData.run_date}
                  onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                  className="border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_category" className="text-sm text-gray-500">
                  Asset Category (Optional)
                </Label>
                <Select 
                  value={formData.asset_category} 
                  onValueChange={(value) => setFormData({ ...formData, asset_category: value })}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleRunDepreciation}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Depreciation...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Depreciation
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Depreciation Results
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Depreciation</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(totalDepreciation)}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Depreciation Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <motion.tr
                        key={result.asset_tag}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-indigo-600">{result.asset_tag}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{result.asset_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(result.depreciation_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-900 flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {result.period}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'SUCCESS' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Journal Entry Notice */}
              <div className="px-6 py-4 bg-indigo-50 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-indigo-100 rounded-full">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-indigo-800">Journal Entries Created</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      Depreciation journal entries have been automatically posted to the general ledger. 
                      Total depreciation expense: <span className="font-semibold">{formatCurrency(totalDepreciation)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DepreciationManagementPage;