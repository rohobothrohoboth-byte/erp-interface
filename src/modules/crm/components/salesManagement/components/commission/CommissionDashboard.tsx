import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Award, Calendar, User, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';

interface CommissionData {
  salesRep: string;
  totalSales: number;
  commissionRate: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
  deals: number;
  quota: number;
  quotaAchievement: number;
}

interface CommissionDashboardProps {
  opportunities: any[];
}

export default function CommissionDashboard({ opportunities }: CommissionDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedRep, setSelectedRep] = useState('all');

  // Mock commission data - in real app, this would come from API
  const commissionData: CommissionData[] = [
    {
      salesRep: 'Sarah Johnson',
      totalSales: 450000,
      commissionRate: 8,
      commissionEarned: 36000,
      commissionPaid: 28000,
      commissionPending: 8000,
      deals: 12,
      quota: 400000,
      quotaAchievement: 112.5
    },
    {
      salesRep: 'Mike Wilson',
      totalSales: 320000,
      commissionRate: 7,
      commissionEarned: 22400,
      commissionPaid: 18000,
      commissionPending: 4400,
      deals: 8,
      quota: 350000,
      quotaAchievement: 91.4
    },
    {
      salesRep: 'Emily Davis',
      totalSales: 280000,
      commissionRate: 7.5,
      commissionEarned: 21000,
      commissionPaid: 21000,
      commissionPending: 0,
      deals: 6,
      quota: 300000,
      quotaAchievement: 93.3
    },
    {
      salesRep: 'Robert Chen',
      totalSales: 380000,
      commissionRate: 8.5,
      commissionEarned: 32300,
      commissionPaid: 25000,
      commissionPending: 7300,
      deals: 10,
      quota: 350000,
      quotaAchievement: 108.6
    },
    {
      salesRep: 'Lisa Anderson',
      totalSales: 195000,
      commissionRate: 6.5,
      commissionEarned: 12675,
      commissionPaid: 12675,
      commissionPending: 0,
      deals: 5,
      quota: 250000,
      quotaAchievement: 78.0
    }
  ];

  const filteredData = selectedRep === 'all' 
    ? commissionData 
    : commissionData.filter(data => data.salesRep === selectedRep);

  const totalCommissionEarned = commissionData.reduce((sum, data) => sum + data.commissionEarned, 0);
  const totalCommissionPaid = commissionData.reduce((sum, data) => sum + data.commissionPaid, 0);
  const totalCommissionPending = commissionData.reduce((sum, data) => sum + data.commissionPending, 0);
  const totalSales = commissionData.reduce((sum, data) => sum + data.totalSales, 0);
  const avgCommissionRate = commissionData.reduce((sum, data) => sum + data.commissionRate, 0) / commissionData.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600">Track sales performance and commission calculations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedRep} onValueChange={setSelectedRep}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales Reps</SelectItem>
              {commissionData.map(data => (
                <SelectItem key={data.salesRep} value={data.salesRep}>
                  {data.salesRep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Sales</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSales)}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Commission Earned</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalCommissionEarned)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Commission Paid</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalCommissionPaid)}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pending Payout</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCommissionPending)}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Avg Commission Rate</p>
                <p className="text-lg font-bold text-gray-900">{avgCommissionRate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Commission Earned</TableHead>
                <TableHead>Commission Paid</TableHead>
                <TableHead>Pending Payout</TableHead>
                <TableHead>Deals Closed</TableHead>
                <TableHead>Quota Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((data, index) => (
                <motion.tr
                  key={data.salesRep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{data.salesRep}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(data.totalSales)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{data.commissionRate}%</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      {formatCurrency(data.commissionEarned)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-purple-600">
                      {formatCurrency(data.commissionPaid)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      data.commissionPending > 0 ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {formatCurrency(data.commissionPending)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span>{data.deals}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={Math.min(data.quotaAchievement, 100)} 
                        className="w-16 h-2" 
                      />
                      <span className={`text-sm font-medium ${
                        data.quotaAchievement >= 100 ? 'text-green-600' : 
                        data.quotaAchievement >= 80 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {data.quotaAchievement.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commission Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">Base Commission</div>
                  <div className="text-sm text-gray-600">Standard rate for all sales</div>
                </div>
                <div className="text-lg font-bold text-blue-600">6-8%</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium">Quota Bonus</div>
                  <div className="text-sm text-gray-600">Additional 2% when quota exceeded</div>
                </div>
                <div className="text-lg font-bold text-green-600">+2%</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium">Team Bonus</div>
                  <div className="text-sm text-gray-600">Team achievement bonus</div>
                </div>
                <div className="text-lg font-bold text-purple-600">+1%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissionData
                .sort((a, b) => b.quotaAchievement - a.quotaAchievement)
                .slice(0, 3)
                .map((data, index) => (
                  <div key={data.salesRep} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{data.salesRep}</div>
                        <div className="text-sm text-gray-600">{data.deals} deals closed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(data.commissionEarned)}</div>
                      <div className="text-sm text-gray-600">{data.quotaAchievement.toFixed(1)}% quota</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}