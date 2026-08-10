import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  RefreshCw,
  Plus,
  Sun,
  Moon,
  Activity,
  Shield,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Package,
  Truck,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
  BarChart3,
  Eye,
  Loader2,
  ShoppingCart,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/shared/layout/layout';
import { getDashboardData } from '@/modules/procurement/services/dashboard.api';
import type {  DashboardData } from '@/modules/procurement/services/dashboard.api';
// ============================================================
// DARK MODE HOOK
// ============================================================

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleDarkMode };
};

// ============================================================
// STAT CARD COMPONENT
// ============================================================

const StatCard = ({ title, value, change, icon: Icon, color, trend, loading }: any) => {
  const isPositive = trend === 'up';

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
              {loading ? (
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
              ) : (
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
              )}
              {change !== undefined && !loading && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(change)}% vs last month</span>
                  </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

// ============================================================
// VENDOR PERFORMANCE COMPONENT
// ============================================================

const VendorPerformance = ({ vendors, loading }: { vendors: any[]; loading: boolean }) => {
  const getPerformanceColor = (performance: string) => {
    switch(performance) {
      case 'Excellent': return 'text-emerald-600 dark:text-emerald-400';
      case 'Good': return 'text-blue-600 dark:text-blue-400';
      case 'Average': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  const averageRating = vendors.length > 0
      ? (vendors.reduce((acc, v) => acc + (v.rating || 0), 0) / vendors.length).toFixed(1)
      : 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
        <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-500">Loading vendors...</p>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Vendor Performance
              </CardTitle>
              <CardDescription>Top vendors by performance metrics</CardDescription>
            </div>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Avg Rating: ★ {averageRating}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No vendors available</p>
          ) : (
              <div className="space-y-4">
                {vendors.map((vendor, idx) => (
                    <div key={idx} className="pb-3 border-b border-purple-100 dark:border-purple-800 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{vendor.name}</span>
                        <span className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-sm">
                    ★ {vendor.rating?.toFixed(1) || 'N/A'}
                  </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Orders: {vendor.orders || 0}</span>
                        <span className="text-slate-500 dark:text-slate-400">Spend: {formatCurrency(vendor.spend || 0)}</span>
                        <span className={`font-medium ${getPerformanceColor(vendor.performance)}`}>
                    {vendor.performance}
                  </span>
                      </div>
                      <Progress value={((vendor.rating || 0) / 5) * 100} className="h-1.5" />
                    </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
  );
};

// ============================================================
// ACTIVE PURCHASE ORDERS COMPONENT
// ============================================================

const ActivePurchaseOrders = ({ orders, loading }: { orders: any[]; loading: boolean }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      'Sent': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Confirmed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Shipped': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const totalAmount = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  if (loading) {
    return (
        <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-500">Loading orders...</p>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Active Purchase Orders
              </CardTitle>
              <CardDescription>Total value: {formatCurrency(totalAmount)}</CardDescription>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate('/procurement/po')}
            >
              <Eye className="w-4 h-4" />
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No active purchase orders</p>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-purple-100 dark:border-purple-800">
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">PO Number</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Vendor</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Amount</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                  </thead>
                  <tbody>
                  {orders.map((order, idx) => (
                      <tr
                          key={idx}
                          className="border-b border-purple-100 dark:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                          onClick={() => navigate(`/procurement/po/${order.id}`)}
                      >
                        <td className="py-3 px-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {order.purchaseOrderNumber}
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400">
                          {order.vendorName || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-right text-slate-800 dark:text-slate-200">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </CardContent>
      </Card>
  );
};

// ============================================================
// SPEND BY CATEGORY COMPONENT
// ============================================================

const SpendByCategory = ({ categories, loading }: { categories: any[]; loading: boolean }) => {
  const totalSpend = categories.reduce((acc, c) => acc + c.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
        <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-500">Loading spend data...</p>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Spend by Category
              </CardTitle>
              <CardDescription>Total: {formatCurrency(totalSpend)}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No spend data available</p>
          ) : (
              <div className="space-y-4">
                {categories.map((category, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{category.name}</span>
                        <span className="text-slate-600 dark:text-slate-400">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={category.percentage} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{category.percentage}%</span>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
  );
};

// ============================================================
// QUICK ACTIONS COMPONENT
// ============================================================

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'New Requisition', icon: ShoppingCart, path: '/procurement/requisitions/create', color: 'purple' },
    { label: 'Create PO', icon: Package, path: '/procurement/po/create', color: 'emerald' },
    { label: 'Add Vendor', icon: Building2, path: '/procurement/vendors/create', color: 'blue' },
    { label: 'Create Contract', icon: FileText, path: '/procurement/vendors/contracts/create', color: 'amber' },
  ];

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common procurement tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action, idx) => (
                <Button
                    key={idx}
                    variant="outline"
                    className={`justify-start gap-2 border-${action.color}-200 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20`}
                    onClick={() => navigate(action.path)}
                >
                  <action.icon className={`w-4 h-4 text-${action.color}-500`} />
                  <span>{action.label}</span>
                </Button>
            ))}
          </div>
        </CardContent>
      </Card>
  );
};

// ============================================================
// RECENT ACTIVITY COMPONENT
// ============================================================

const RecentActivity = ({ activities, loading }: { activities: any[]; loading: boolean }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-700',
      'Submitted': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-green-100 text-green-700',
      'Completed': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Sent': 'bg-blue-100 text-blue-700',
      'Paid': 'bg-purple-100 text-purple-700',
      'Verified': 'bg-yellow-100 text-yellow-700',
      'Active': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'Requisition': return <ShoppingCart className="w-4 h-4" />;
      case 'Invoice': return <Receipt className="w-4 h-4" />;
      case 'GRN': return <FileCheck className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
        <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
            <p className="mt-2 text-sm text-slate-500">Loading activity...</p>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className="border-purple-200 dark:border-purple-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest procurement actions</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No recent activity</p>
          ) : (
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
  );
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================

export default function ProcurementDashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch dashboard data from single API endpoint
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardData({
        recentActivitiesCount: 5,
        topVendorsCount: 5
      });
      setDashboardData(data);
      console.log('✅ Dashboard data loaded:', data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  const buttonVariants = useMemo(() => ({
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  }), [prefersReducedMotion]);

  // Extract data from dashboard response
  const stats = dashboardData?.stats;
  const vendors = dashboardData?.vendors || [];
  const activeOrders = dashboardData?.activeOrders || [];
  const spendCategories = dashboardData?.spendByCategory || [];
  const activities = dashboardData?.recentActivities || [];

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

        {/* Decorative Elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 dark:from-purple-400/5 dark:to-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Procurement Module</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Procurement Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Streamlined purchasing, vendor management, and procurement analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Activity size={14} />
                <span className="font-mono">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
              </div>

              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="gap-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
                  onClick={() => navigate('/procurement/requisitions/create')}
              >
                <Plus size={16} />
                <span>New Requisition</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatCard
                title="Monthly Spend"
                value={formatCurrency(stats?.monthlySpend || 0)}
                change={stats?.monthlyChange || 0}
                icon={Wallet}
                color="from-purple-500 to-purple-600"
                trend={stats?.monthlyChange > 0 ? 'up' : 'down'}
                loading={loading}
            />
            <StatCard
                title="Cost Savings"
                value={formatCurrency(stats?.costSavings || 0)}
                change={stats?.savingsChange || 0}
                icon={TrendingUp}
                color="from-emerald-500 to-emerald-600"
                trend={stats?.savingsChange > 0 ? 'up' : 'down'}
                loading={loading}
            />
            <StatCard
                title="Active Vendors"
                value={stats?.activeVendors || 0}
                change={stats?.vendorsChange || 0}
                icon={Building2}
                color="from-blue-500 to-blue-600"
                trend={stats?.vendorsChange > 0 ? 'up' : 'down'}
                loading={loading}
            />
            <StatCard
                title="Open POs"
                value={stats?.openPOs || 0}
                change={stats?.ordersChange || 0}
                icon={Package}
                color="from-amber-500 to-amber-600"
                trend={stats?.ordersChange > 0 ? 'up' : 'down'}
                loading={loading}
            />
          </motion.div>

          {/* Tabs Navigation */}
          <div className="mb-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-purple-50 dark:bg-purple-950/30 p-1 w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:text-gray-300">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:text-gray-300">
                  <Truck className="w-4 h-4 mr-2" />
                  Active Orders
                </TabsTrigger>
                <TabsTrigger value="vendors" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:text-gray-300">
                  <Users className="w-4 h-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SpendByCategory categories={spendCategories} loading={loading} />
                  </div>
                  <div>
                    <QuickActions />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ActivePurchaseOrders orders={activeOrders} loading={loading} />
                  </div>
                  <div>
                    <VendorPerformance vendors={vendors} loading={loading} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <ActivePurchaseOrders orders={activeOrders} loading={loading} />
              </TabsContent>

              <TabsContent value="vendors" className="mt-6">
                <VendorPerformance vendors={vendors} loading={loading} />
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <RecentActivity activities={activities} loading={loading} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
          >
            <div className="inline-flex items-center gap-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>Live Procurement Data</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3 h-3" />
                <span>Audit Trail</span>
              </div>
              <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Real-time Sync</span>
              </div>
              {dashboardData?.lastUpdated && (
                  <>
                    <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {new Date(dashboardData.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </>
              )}
            </div>
          </motion.div>
        </div>

        <style>{`
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 32px 32px;
        }
        .dark .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23334155'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
        }
      `}</style>
      </div>
  );
}