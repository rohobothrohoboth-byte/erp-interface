import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutGrid, Edit, Trash2, RefreshCw, Plus,
    Users, Settings, Building, Package, Heart,
    ShoppingCart, Target, Briefcase, Folder, BarChart,
    DollarSign, Calendar, Shield, Clock, FileText,
    User, Home, Activity, AlertCircle, Archive, Bell,
    Book, Box, Camera, CheckCircle, ChevronRight,
    Clipboard, Code, Coffee, Compass, CreditCard,
    Database, Download, Eye, File, Filter, Flag,
    FolderOpen, Gift, Globe, Grid, Hash, Headphones,
    HelpCircle, Image, Inbox, Info, Key, Layers,
    Link, List, Lock, Mail, Map, MapPin, Menu,
    MessageSquare, Mic, Minus, Monitor, Moon,
    MoreHorizontal, MoreVertical, Move, Music,
    Navigation, Notebook, Paperclip, Pause, Phone,
    PieChart, Play, PlusCircle, Power, Printer,
    Radio, Repeat, Rewind, Rocket, RotateCw, Save,
    Search, Send, Server, Share, ShoppingBag,
    Shuffle, Sidebar, Signal, Sliders, Smartphone,
    Smile, Snowflake, Speaker, Star, StopCircle,
    Sun, Sunrise, Sunset, Tablet, Tag, Terminal,
    Thermometer, ThumbsUp, Ticket, ToggleLeft,
    ToggleRight, Trash, TrendingUp, Truck, Tv,
    Twitch, Twitter, Umbrella, Underline, Undo,
    Unlock, Upload, UserCheck, UserMinus, UserPlus,
    Video, Volume1, Volume2, VolumeX, Wallet,
    Watch, Wifi, Wind, Wrench, X, XCircle,
    Youtube, Zap, ZoomIn, ZoomOut
} from 'lucide-react';
import { coreModuleApi } from '@/modules/core/services/settings/ModCore/core-module.api';
import type { CreateModuleDto, ModuleDto } from '@/modules/core/services/settings/ModCore/core-module.api';
import AddModuleModal from '@/modules/settings/components/coreSettings/modules/AddModuleModal';
import EditModuleModal from '@/modules/settings/components/coreSettings/modules/EditModuleModal';
import DeleteModuleModal from '@/modules/settings/components/coreSettings/modules/DeleteModuleModal';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// Icon mapping - maps icon names to Lucide components (only valid icons)
const iconMap: Record<string, React.ReactNode> = {
    // Module icons
    'LayoutDashboard': <LayoutGrid size={20} />,
    'Users': <Users size={20} />,
    'Settings': <Settings size={20} />,
    'Building': <Building size={20} />,
    'Package': <Package size={20} />,
    'Heart': <Heart size={20} />,
    'ShoppingCart': <ShoppingCart size={20} />,
    'Target': <Target size={20} />,
    'Briefcase': <Briefcase size={20} />,
    'Folder': <Folder size={20} />,
    'BarChart': <BarChart size={20} />,
    'BarChart4': <BarChart size={20} />,
    'DollarSign': <DollarSign size={20} />,
    'Calendar': <Calendar size={20} />,
    'Shield': <Shield size={20} />,
    'Clock': <Clock size={20} />,
    'FileText': <FileText size={20} />,
    'User': <User size={20} />,
    'Home': <Home size={20} />,
    'Activity': <Activity size={20} />,
    'AlertCircle': <AlertCircle size={20} />,
    'Archive': <Archive size={20} />,
    'Bell': <Bell size={20} />,
    'Book': <Book size={20} />,
    'Box': <Box size={20} />,
    'Camera': <Camera size={20} />,
    'CheckCircle': <CheckCircle size={20} />,
    'Clipboard': <Clipboard size={20} />,
    'Code': <Code size={20} />,
    'Coffee': <Coffee size={20} />,
    'Compass': <Compass size={20} />,
    'CreditCard': <CreditCard size={20} />,
    'Database': <Database size={20} />,
    'Download': <Download size={20} />,
    'Eye': <Eye size={20} />,
    'File': <File size={20} />,
    'Filter': <Filter size={20} />,
    'Flag': <Flag size={20} />,
    'FolderOpen': <FolderOpen size={20} />,
    'Gift': <Gift size={20} />,
    'Globe': <Globe size={20} />,
    'Grid': <Grid size={20} />,
    'Hash': <Hash size={20} />,
    'Headphones': <Headphones size={20} />,
    'HelpCircle': <HelpCircle size={20} />,
    'Image': <Image size={20} />,
    'Inbox': <Inbox size={20} />,
    'Info': <Info size={20} />,
    'Key': <Key size={20} />,
    'Layers': <Layers size={20} />,
    'Link': <Link size={20} />,
    'List': <List size={20} />,
    'Lock': <Lock size={20} />,
    'Mail': <Mail size={20} />,
    'Map': <Map size={20} />,
    'MapPin': <MapPin size={20} />,
    'Menu': <Menu size={20} />,
    'MessageSquare': <MessageSquare size={20} />,
    'Mic': <Mic size={20} />,
    'Minus': <Minus size={20} />,
    'Monitor': <Monitor size={20} />,
    'Moon': <Moon size={20} />,
    'MoreHorizontal': <MoreHorizontal size={20} />,
    'MoreVertical': <MoreVertical size={20} />,
    'Move': <Move size={20} />,
    'Music': <Music size={20} />,
    'Navigation': <Navigation size={20} />,
    'Notebook': <Notebook size={20} />,
    'Paperclip': <Paperclip size={20} />,
    'Pause': <Pause size={20} />,
    'Phone': <Phone size={20} />,
    'PieChart': <PieChart size={20} />,
    'Play': <Play size={20} />,
    'PlusCircle': <PlusCircle size={20} />,
    'Power': <Power size={20} />,
    'Printer': <Printer size={20} />,
    'Radio': <Radio size={20} />,
    'Repeat': <Repeat size={20} />,
    'Rewind': <Rewind size={20} />,
    'Rocket': <Rocket size={20} />,
    'RotateCw': <RotateCw size={20} />,
    'Save': <Save size={20} />,
    'Search': <Search size={20} />,
    'Send': <Send size={20} />,
    'Server': <Server size={20} />,
    'Share': <Share size={20} />,
    'ShoppingBag': <ShoppingBag size={20} />,
    'Shuffle': <Shuffle size={20} />,
    'Sidebar': <Sidebar size={20} />,
    'Signal': <Signal size={20} />,
    'Sliders': <Sliders size={20} />,
    'Smartphone': <Smartphone size={20} />,
    'Smile': <Smile size={20} />,
    'Snowflake': <Snowflake size={20} />,
    'Speaker': <Speaker size={20} />,
    'Star': <Star size={20} />,
    'StopCircle': <StopCircle size={20} />,
    'Sun': <Sun size={20} />,
    'Sunrise': <Sunrise size={20} />,
    'Sunset': <Sunset size={20} />,
    'Tablet': <Tablet size={20} />,
    'Tag': <Tag size={20} />,
    'Terminal': <Terminal size={20} />,
    'Thermometer': <Thermometer size={20} />,
    'ThumbsUp': <ThumbsUp size={20} />,
    'Ticket': <Ticket size={20} />,
    'ToggleLeft': <ToggleLeft size={20} />,
    'ToggleRight': <ToggleRight size={20} />,
    'Trash': <Trash size={20} />,
    'TrendingUp': <TrendingUp size={20} />,
    'Truck': <Truck size={20} />,
    'Tv': <Tv size={20} />,
    'Twitch': <Twitch size={20} />,
    'Twitter': <Twitter size={20} />,
    'Umbrella': <Umbrella size={20} />,
    'Underline': <Underline size={20} />,
    'Undo': <Undo size={20} />,
    'Unlock': <Unlock size={20} />,
    'Upload': <Upload size={20} />,
    'UserCheck': <UserCheck size={20} />,
    'UserMinus': <UserMinus size={20} />,
    'UserPlus': <UserPlus size={20} />,
    'Video': <Video size={20} />,
    'Volume1': <Volume1 size={20} />,
    'Volume2': <Volume2 size={20} />,
    'VolumeX': <VolumeX size={20} />,
    'Wallet': <Wallet size={20} />,
    'Watch': <Watch size={20} />,
    'Wifi': <Wifi size={20} />,
    'Wind': <Wind size={20} />,
    'Wrench': <Wrench size={20} />,
    'X': <X size={20} />,
    'XCircle': <XCircle size={20} />,
    'Youtube': <Youtube size={20} />,
    'Zap': <Zap size={20} />,
    'ZoomIn': <ZoomIn size={20} />,
    'ZoomOut': <ZoomOut size={20} />,
};

// Helper function to get icon component
const getIcon = (iconName?: string | null) => {
    if (!iconName) return <LayoutGrid size={20} />;
    return iconMap[iconName] || <LayoutGrid size={20} />;
};

function PageModuleSettings() {
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleDto | null>(null);
    const [deletingModule, setDeletingModule] = useState<ModuleDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchModules = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await coreModuleApi.getAllModules();
            console.log('Modules with icons:', data.map(m => ({ desc: m.desc, icon: m.icon })));
            setModules(data || []);
        } catch (err: any) {
            console.error('Error fetching modules:', err);
            setError(err.message || 'Failed to load modules');
            toast.error('Failed to load modules');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const handleAddModule = async (moduleData: CreateModuleDto) => {
        try {
            const response = await coreModuleApi.createModule(moduleData);
            toast.success(`Module "${moduleData.desc}" created successfully`);
            await fetchModules();
            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create module';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleUpdateModule = async (id: string, data: Partial<CreateModuleDto>) => {
        try {
            const response = await coreModuleApi.updateModule(id, data);
            toast.success(`Module updated successfully`);
            await fetchModules();
            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update module';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleDeleteModule = async (id: string) => {
        try {
            await coreModuleApi.deleteModule(id);
            toast.success(`Module deleted successfully`);
            await fetchModules();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete module';
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleModuleAdded = () => {
        fetchModules();
    };

    const filteredModules = modules.filter(module =>
        module.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.key?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 p-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <LayoutGrid className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Create and manage system modules for the application
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchModules}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Refresh modules"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Module
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search modules by name or key..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading modules...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchModules}
                            className="mt-2 text-sm text-red-700 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredModules.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <LayoutGrid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">
                            {searchTerm ? 'No modules match your search' : 'No modules found'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-3 text-sm text-emerald-600 hover:underline"
                            >
                                Create your first module
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredModules.map((module, index) => (
                            <motion.div
                                key={module.id}
                                variants={itemVariants}
                                custom={index}
                                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Dynamic Icon */}
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                            {getIcon(module.icon)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{module.desc}</h3>
                                            <code className="text-xs text-gray-500 font-mono">{module.key}</code>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingModule(module);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                                            title="Edit module"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingModule(module);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete module"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {module.icon && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs">Icon:</span>
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                {module.icon}
                                            </code>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-xs">Order:</span>
                                        <span className="text-xs font-medium text-gray-700">{module.order || 0}</span>
                                    </div>
                                    {module.dateAdd && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs">Created:</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(module.dateAdd).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.section>

            {/* Modals */}
            {isAddModalOpen && (
                <AddModuleModal
                    onAddModule={handleAddModule}
                    onClose={() => setIsAddModalOpen(false)}
                    onModuleAdded={handleModuleAdded}
                />
            )}

            {isEditModalOpen && editingModule && (
                <EditModuleModal
                    module={editingModule}
                    onUpdateModule={handleUpdateModule}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingModule(null);
                    }}
                    onRefresh={fetchModules}
                />
            )}

            {isDeleteModalOpen && deletingModule && (
                <DeleteModuleModal
                    module={deletingModule}
                    onConfirm={() => handleDeleteModule(deletingModule.id)}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingModule(null);
                    }}
                />
            )}
        </>
    );
}

export default PageModuleSettings;