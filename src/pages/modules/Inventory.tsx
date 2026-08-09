import { useState, useEffect, useCallback, useMemo } from 'react';
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
    Package,
    Warehouse,
    AlertTriangle,
    BarChart4,
    Download,
    Filter,
    Calendar,
    Truck,
    Boxes
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import InventoryStatCards from '../../components/inventory/InventoryStatCards';
import StockMovements from '../../components/inventory/StockMovements';
import WarehouseManagement from '../../components/inventory/WarehouseManagement';
import ReorderAlerts from '../../components/inventory/ReorderAlerts';
import InventoryTrends from '../../components/inventory/InventoryTrends';
import { useModuleStore } from '../../stores/module.store';

// Dark mode hook
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

// Quick Stats Component
const QuickInventoryStats = () => {
    const stats = [
        { label: 'Low Stock Items', value: '23', icon: AlertTriangle, color: 'amber', trend: '+5' },
        { label: 'Out of Stock', value: '8', icon: Package, color: 'red', trend: '+2' },
        { label: 'Active Warehouses', value: '4', icon: Warehouse, color: 'blue', trend: '0' },
        { label: 'Pending Orders', value: '156', icon: Truck, color: 'purple', trend: '+12' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const colorClasses = {
                    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
                    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
                    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
                };

                return (
                    <div
                        key={stat.label}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{stat.value}</p>
                                {stat.trend !== '0' && (
                                    <p className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                        {stat.trend} this week
                                    </p>
                                )}
                            </div>
                            <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Recent Stock Movements Summary
const RecentStockMovementsSummary = () => {
    const movements = [
        { id: 1, product: 'Laptop Pro X', type: 'in', quantity: 50, date: '2024-01-15', warehouse: 'Main Warehouse' },
        { id: 2, product: 'Wireless Mouse', type: 'out', quantity: 120, date: '2024-01-15', warehouse: 'North Branch' },
        { id: 3, product: 'USB-C Cable', type: 'in', quantity: 300, date: '2024-01-14', warehouse: 'Main Warehouse' },
        { id: 4, product: 'Monitor 24"', type: 'out', quantity: 25, date: '2024-01-14', warehouse: 'South Branch' },
        { id: 5, product: 'Keyboard Mechanical', type: 'in', quantity: 80, date: '2024-01-13', warehouse: 'East Branch' },
    ];

    return (
        <Card className="border-yellow-200 dark:border-yellow-800 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Recent Stock Movements
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View all
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {movements.map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${movement.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {movement.type === 'in' ? (
                                        <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <TrendingUp className="w-3 h-3 text-red-600 dark:text-red-400 transform rotate-180" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{movement.product}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{movement.warehouse}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-medium ${movement.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{movement.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, when: "beforeChildren" }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20, duration: 0.3 }
    }
};

export default function InventoryDashboard() {
    const activeModule = useModuleStore((s) => s.activeModule);
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const prefersReducedMotion = useReducedMotion();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Update current time
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    const buttonVariants = useMemo(() => ({
        hover: { scale: prefersReducedMotion ? 1 : 1.02 },
        tap: { scale: prefersReducedMotion ? 1 : 0.98 }
    }), [prefersReducedMotion]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50/30 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

            {/* Decorative Elements */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 dark:from-yellow-400/5 dark:to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative container mx-auto px-4 py-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full" />
                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Inventory Module</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
                            Inventory Management Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Track stock levels, manage warehouses, and monitor inventory movements
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Current Time */}
                        <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Activity size={14} />
                            <span className="font-mono">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </span>
                        </div>

                        {/* Dark Mode Toggle */}
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.button>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="gap-2 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span>Refresh</span>
                        </Button>

                        {/* Export Button */}
                        <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 transition-all"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Export Report</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants}>
                    <QuickInventoryStats />
                </motion.div>

                {/* Tabs Navigation */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-yellow-50 dark:bg-yellow-950/30 p-1 w-full justify-start overflow-x-auto">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:text-gray-300">
                                <BarChart4 className="w-4 h-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="stock" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:text-gray-300">
                                <Package className="w-4 h-4 mr-2" />
                                Stock Management
                            </TabsTrigger>
                            <TabsTrigger value="warehouses" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:text-gray-300">
                                <Warehouse className="w-4 h-4 mr-2" />
                                Warehouses
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white dark:text-gray-300">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Reorder Alerts
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            {/* Main Stats Cards */}
                            <motion.div variants={itemVariants}>
                                <InventoryStatCards />
                            </motion.div>

                            {/* Main Content Grid */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                <div className="lg:col-span-2">
                                    <StockMovements />
                                </div>
                                <div>
                                    <RecentStockMovementsSummary />
                                </div>
                            </motion.div>

                            {/* Inventory Trends */}
                            <motion.div variants={itemVariants}>
                                <InventoryTrends />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="stock" className="mt-6">
                            <div className="grid grid-cols-1 gap-6">
                                <StockMovements />
                            </div>
                        </TabsContent>

                        <TabsContent value="warehouses" className="mt-6">
                            <div className="grid grid-cols-1 gap-6">
                                <WarehouseManagement />
                            </div>
                        </TabsContent>

                        <TabsContent value="alerts" className="mt-6">
                            <div className="grid grid-cols-1 gap-6">
                                <ReorderAlerts />
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>

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
                            <span>Live Inventory Data</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Shield className="w-3 h-3" />
                            <span>Real-time Sync</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Boxes className="w-3 h-3" />
                            <span>Multi-warehouse</span>
                        </div>
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