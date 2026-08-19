// src/pages/finance/portal/Notifications.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Mail, Send,
    CheckCircle, AlertCircle, Clock, X, Calendar,
    Users, Building2, FileText, CreditCard, Truck,
    DollarSign, TrendingUp, TrendingDown, Activity,
    Shield, MessageSquare, Info, AlertTriangle,
    Check, EyeOff, Archive, Trash2, Bookmark
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import {
    getPortalNotifications,
    markPortalNotificationRead,
    sendPortalNotification,
    deletePortalNotification,
} from '@/modules/finance/services/finance.api';

interface PortalNotification {
    id: string;
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Error' | 'Alert' | 'System' | 'Reminder';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    isRead: boolean;
    isArchived: boolean;
    createdAt: string;
    readAt: string;
    sender: string;
    senderRole: string;
    recipient: string;
    recipientRole: string;
    category: 'Payment' | 'Invoice' | 'Vendor' | 'System' | 'Approval' | 'Reminder' | 'Alert';
    entityId: string;
    entityType: string;
    entityName: string;
    actionUrl: string;
    expiresAt: string;
    rowVersion?: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    archived: number;
    info: number;
    success: number;
    warning: number;
    error: number;
    alert: number;
    system: number;
    reminder: number;
    highPriority: number;
    urgentPriority: number;
    categories: { category: string; count: number }[];
}

const Notifications: React.FC = () => {
    const [items, setItems] = useState<PortalNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterRead, setFilterRead] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<PortalNotification | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sendData, setSendData] = useState({
        title: '',
        message: '',
        type: 'Info',
        priority: 'Medium',
        recipient: '',
        category: 'System',
    });

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('portal-notifications');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterRead !== 'All') {
                params.isRead = filterRead === 'Read';
            }
            if (filterType !== 'All') params.type = filterType;
            if (filterPriority !== 'All') params.priority = filterPriority;
            if (filterCategory !== 'All') params.category = filterCategory;
            if (searchTerm) params.search = searchTerm;

            const response = await getPortalNotifications(params);

            let data: PortalNotification[] = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            showToast.error('Failed to load notifications');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterPriority, filterCategory, filterRead, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): NotificationStats => {
        const filtered = items;
        const unread = filtered.filter(c => !c.isRead).length;
        const read = filtered.filter(c => c.isRead).length;
        const archived = filtered.filter(c => c.isArchived).length;
        const info = filtered.filter(c => c.type === 'Info').length;
        const success = filtered.filter(c => c.type === 'Success').length;
        const warning = filtered.filter(c => c.type === 'Warning').length;
        const error = filtered.filter(c => c.type === 'Error').length;
        const alert = filtered.filter(c => c.type === 'Alert').length;
        const system = filtered.filter(c => c.type === 'System').length;
        const reminder = filtered.filter(c => c.type === 'Reminder').length;
        const highPriority = filtered.filter(c => c.priority === 'High').length;
        const urgentPriority = filtered.filter(c => c.priority === 'Urgent').length;

        const categoryCount: Record<string, number> = {};
        filtered.forEach(c => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });
        const categories = Object.entries(categoryCount).map(([category, count]) => ({ category, count }));

        return {
            total: filtered.length,
            unread,
            read,
            archived,
            info,
            success,
            warning,
            error,
            alert,
            system,
            reminder,
            highPriority,
            urgentPriority,
            categories,
        };
    };

    const stats = getStats();

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Info: 'bg-blue-100 text-blue-700 border-blue-200',
            Success: 'bg-green-100 text-green-700 border-green-200',
            Warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Error: 'bg-red-100 text-red-700 border-red-200',
            Alert: 'bg-orange-100 text-orange-700 border-orange-200',
            System: 'bg-purple-100 text-purple-700 border-purple-200',
            Reminder: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            Low: 'bg-gray-100 text-gray-700 border-gray-200',
            Medium: 'bg-blue-100 text-blue-700 border-blue-200',
            High: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Urgent: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Payment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            Invoice: 'bg-blue-100 text-blue-700 border-blue-200',
            Vendor: 'bg-purple-100 text-purple-700 border-purple-200',
            System: 'bg-gray-100 text-gray-700 border-gray-200',
            Approval: 'bg-green-100 text-green-700 border-green-200',
            Reminder: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Alert: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sender || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesRead = filterRead === 'All' ||
            (filterRead === 'Read' && item.isRead) ||
            (filterRead === 'Unread' && !item.isRead);
        return matchesSearch && matchesType && matchesPriority && matchesCategory && matchesRead;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleView = (item: PortalNotification) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
        if (!item.isRead) {
            markAsRead(item.id);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await markPortalNotificationRead(id);
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = items.filter(item => !item.isRead).map(item => item.id);
            await Promise.all(unreadIds.map(id => markPortalNotificationRead(id)));
            setItems(prev => prev.map(item => ({ ...item, isRead: true, readAt: new Date().toISOString() })));
            showToast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            showToast.error('Failed to mark all as read');
        }
    };

    const handleDeleteNotification = async () => {
        if (!selectedItem) return;

        try {
            setDeleting(true);
            await deletePortalNotification(selectedItem.id);
            showToast.success('Notification deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error: any) {
            console.error('Error deleting notification:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete notification');
        } finally {
            setDeleting(false);
        }
    };

    const handleSendNotification = async () => {
        if (!sendData.title || !sendData.message) {
            showToast.error('Please fill in title and message');
            return;
        }

        try {
            setSending(true);
            await sendPortalNotification(sendData);
            showToast.success('Notification sent successfully');
            await fetchData();
            setIsSendModalOpen(false);
            setSendData({ title: '', message: '', type: 'Info', priority: 'Medium', recipient: '', category: 'System' });
        } catch (error: any) {
            console.error('Error sending notification:', error);
            showToast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">View and manage all notifications</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={markAllAsRead}
                    >
                        <CheckCircle size={16} />
                        Mark All Read
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsSendModalOpen(true)}
                    >
                        <Send size={16} />
                        Send Notification
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.unread} unread</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Bell className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Urgent</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.urgentPriority}</p>
                                <p className="text-xs text-purple-600 mt-1">Needs attention</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Success</p>
                                <p className="text-2xl font-bold text-green-900">{stats.success}</p>
                                <p className="text-xs text-green-600 mt-1">Positive updates</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Alerts</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.alert}</p>
                                <p className="text-xs text-yellow-600 mt-1">Requires action</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Errors</p>
                                <p className="text-2xl font-bold text-red-900">{stats.error}</p>
                                <p className="text-xs text-red-600 mt-1">Failed operations</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            <div className="flex flex-wrap gap-2">
                {stats.categories.map((cat) => (
                    <Badge key={cat.category} className="text-sm px-3 py-1">
                        {cat.category}: {cat.count}
                    </Badge>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Info">Info</SelectItem>
                        <SelectItem value="Success">Success</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                        <SelectItem value="Error">Error</SelectItem>
                        <SelectItem value="Alert">Alert</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Reminder">Reminder</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Priorities</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Payment">Payment</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Approval">Approval</SelectItem>
                        <SelectItem value="Reminder">Reminder</SelectItem>
                        <SelectItem value="Alert">Alert</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Read">Read</SelectItem>
                        <SelectItem value="Unread">Unread</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('All');
                        setFilterPriority('All');
                        setFilterCategory('All');
                        setFilterRead('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Bell className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No notifications found</p>
                                        <p className="text-sm text-gray-400">All caught up!</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.isRead ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-4 py-3 text-center">
                                        {!item.isRead ? (
                                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                        ) : (
                                            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.title}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            {!item.isRead && (
                                                <button
                                                    onClick={() => markAsRead(item.id)}
                                                    className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Mark as Read"
                                                >
                                                    <Check size={16} className="text-green-500" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} notifications
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-600" />
                            Notification Details
                        </DialogTitle>
                        <DialogDescription>
                            View notification details and information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
                                {!selectedItem.isRead && (
                                    <Badge className="bg-blue-100 text-blue-700">New</Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                <Badge className={getCategoryColor(selectedItem.category)}>{selectedItem.category}</Badge>
                                <Badge className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Badge>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700">{selectedItem.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Sender:</span>
                                    <span className="ml-2 font-medium">{selectedItem.sender}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Role:</span>
                                    <span className="ml-2 font-medium">{selectedItem.senderRole}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <span className="ml-2 font-medium">{formatDate(selectedItem.createdAt)}</span>
                                </div>
                                {selectedItem.readAt && (
                                    <div>
                                        <span className="text-gray-500">Read:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedItem.readAt)}</span>
                                    </div>
                                )}
                                {selectedItem.expiresAt && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Expires:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedItem.expiresAt)}</span>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <span className="text-gray-500">Entity:</span>
                                    <span className="ml-2 font-medium">{selectedItem.entityName}</span>
                                    <span className="ml-2 text-xs text-gray-400">({selectedItem.entityType})</span>
                                </div>
                            </div>
                            {selectedItem.actionUrl && (
                                <div className="border-t border-gray-200 pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.location.href = selectedItem.actionUrl}
                                    >
                                        View Related Item
                                    </Button>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                {!selectedItem.isRead && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            markAsRead(selectedItem.id);
                                            setSelectedItem({ ...selectedItem, isRead: true });
                                        }}
                                    >
                                        <Check size={16} className="mr-2" />
                                        Mark as Read
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        setIsDeleteModalOpen(true);
                                    }}
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Modal */}
            <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-blue-600" />
                            Send Notification
                        </DialogTitle>
                        <DialogDescription>
                            Send a notification to users
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Title *</Label>
                            <Input
                                value={sendData.title}
                                onChange={(e) => setSendData({ ...sendData, title: e.target.value })}
                                placeholder="Notification title"
                            />
                        </div>
                        <div>
                            <Label>Message *</Label>
                            <Input
                                value={sendData.message}
                                onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                                placeholder="Notification message"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={sendData.type}
                                    onValueChange={(value) => setSendData({ ...sendData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Info">Info</SelectItem>
                                        <SelectItem value="Success">Success</SelectItem>
                                        <SelectItem value="Warning">Warning</SelectItem>
                                        <SelectItem value="Error">Error</SelectItem>
                                        <SelectItem value="Alert">Alert</SelectItem>
                                        <SelectItem value="System">System</SelectItem>
                                        <SelectItem value="Reminder">Reminder</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={sendData.priority}
                                    onValueChange={(value) => setSendData({ ...sendData, priority: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={sendData.category}
                                onValueChange={(value) => setSendData({ ...sendData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Payment">Payment</SelectItem>
                                    <SelectItem value="Invoice">Invoice</SelectItem>
                                    <SelectItem value="Vendor">Vendor</SelectItem>
                                    <SelectItem value="System">System</SelectItem>
                                    <SelectItem value="Approval">Approval</SelectItem>
                                    <SelectItem value="Reminder">Reminder</SelectItem>
                                    <SelectItem value="Alert">Alert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Recipient</Label>
                            <Input
                                value={sendData.recipient}
                                onChange={(e) => setSendData({ ...sendData, recipient: e.target.value })}
                                placeholder="User or role (e.g., finance-team)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSendNotification}
                            disabled={sending}
                        >
                            {sending ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this notification? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                <strong>{selectedItem.title}</strong>
                            </p>
                            <p className="text-xs text-gray-500">{selectedItem.message}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteNotification}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Notification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-blue-600" />
                            Export Notifications
                        </DialogTitle>
                        <DialogDescription>
                            Export notifications in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF - Document</SelectItem>
                                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                                    <SelectItem value="csv">CSV - Comma separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total: <strong>{filteredItems.length}</strong></p>
                                <p>Unread: <strong>{stats.unread}</strong></p>
                                <p>Urgent: <strong>{stats.urgentPriority}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleExport({ notifications: filteredItems, stats })}
                            disabled={exporting}
                        >
                            {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default Notifications;