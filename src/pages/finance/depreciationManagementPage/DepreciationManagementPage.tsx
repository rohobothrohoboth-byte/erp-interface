import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, Play, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { showToast } from '../../../layout/layout';

const DepreciationManagementPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    depreciation_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    run_date: new Date().toISOString().split('T')[0],
    asset_category: 'ALL',
  });
  const [results, setResults] = useState<any[]>([]);

  const assetCategories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'IT', name: 'IT Equipment' },
    { id: 'OFFICE', name: 'Office Equipment' },
    { id: 'VEHICLES', name: 'Vehicles' },
    { id: 'FURNITURE', name: 'Furniture' },
    { id: 'MACHINERY', name: 'Machinery' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleRunDepreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock depreciation results
      const mockResults = [
        {
          asset_tag: 'FA-1001',
          asset_name: 'Dell Laptop OptiPlex 7090',
          category: 'IT Equipment',
          depreciation_amount: 1416.67,
          accumulated_depreciation: 13416.67,
          net_book_value: 71583.33,
        },
        {
          asset_tag: 'FA-1002',
          asset_name: 'Office Printer HP LaserJet',
          category: 'Office Equipment',
          depreciation_amount: 642.86,
          accumulated_depreciation: 6642.86,
          net_book_value: 38357.14,
        },
        {
          asset_tag: 'FA-1003',
          asset_name: 'Toyota Hilux 2024',
          category: 'Vehicles',
          depreciation_amount: 8333.33,
          accumulated_depreciation: 108333.33,
          net_book_value: 1141666.67,
        },
      ];

      setResults(mockResults);

      // Log journal entries that would be created
      console.log('Depreciation Journal Entries:', {
        date: formData.run_date,
        period: formData.depreciation_period,
        entries: mockResults.map(result => ({
          description: `Depreciation - ${result.asset_name}`,
          debit_account: 'Depreciation Expense',
          credit_account: `Accumulated Depreciation - ${result.category}`,
          amount: result.depreciation_amount,
        })),
      });

      showToast.success('Depreciation run completed successfully');
      
    } catch (error) {
      console.error('Error running depreciation:', error);
      showToast.error('Error running depreciation');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Depreciation Management</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Depreciation Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Run Depreciation</h3>
                
                <form onSubmit={handleRunDepreciation} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="depreciation_period" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Depreciation Period <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="depreciation_period"
                      type="month"
                      value={formData.depreciation_period}
                      onChange={(e) => setFormData({ ...formData, depreciation_period: e.target.value })}
                      className="border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="run_date" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Run Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="run_date"
                      type="date"
                      value={formData.run_date}
                      onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                      className="border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset_category" className="flex items-center gap-2">
                      <FileSpreadsheet size={16} />
                      Asset Category (Optional)
                    </Label>
                    <Select value={formData.asset_category} onValueChange={(value) => setFormData({ ...formData, asset_category: value })}>
                      <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-transparent">
                        <SelectValue placeholder="Select asset category" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Play size={16} />
                    )}
                    {isLoading ? 'Running Depreciation...' : 'Run Depreciation'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Depreciation Results</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {results.length > 0 ? `${results.length} assets processed` : 'No depreciation run yet'}
                  </p>
                </div>

                {results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Depreciation
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Accumulated
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Book Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{result.asset_tag}</div>
                                <div className="text-sm text-gray-500">{result.asset_name}</div>
                                <div className="text-xs text-gray-400">{result.category}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-orange-600">
                              {formatCurrency(result.depreciation_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(result.accumulated_depreciation)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                              {formatCurrency(result.net_book_value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Depreciation Run</h3>
                    <p className="text-gray-600">
                      Click "Run Depreciation" to calculate and post depreciation entries
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DepreciationManagementPage;