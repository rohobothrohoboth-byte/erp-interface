// src/pages/crm/realEstate/PropertiesPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Home,
    DollarSign,
    MapPin,
    Bed,
    Bath,
    Ruler,
    Calendar,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    Image,
    Video,
    Link,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import { showToast } from '../../../layout/layout';
import { getProperties, deleteProperty, publishProperty } from '../../../services/crm/crm.api';
import type { Property } from '../../../types/crm/crm.types';
import AddPropertyModal from '../../../components/crm/realEstate/AddPropertyModal';
import EditPropertyModal from '../../../components/crm/realEstate/EditPropertyModal';
import ViewPropertyModal from '../../../components/crm/realEstate/ViewPropertyModal';

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Sold': 'bg-blue-100 text-blue-700 border-blue-200',
        'Rented': 'bg-purple-100 text-purple-700 border-purple-200',
        'OffMarket': 'bg-gray-100 text-gray-700 border-gray-200',
        'UnderConstruction': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Active': return <CheckCircle className="h-3 w-3" />;
        case 'Pending': return <Clock className="h-3 w-3" />;
        case 'Sold': return <DollarSign className="h-3 w-3" />;
        case 'Rented': return <Home className="h-3 w-3" />;
        case 'OffMarket': return <XCircle className="h-3 w-3" />;
        default: return <Clock className="h-3 w-3" />;
    }
};

const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const PropertiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterType !== 'all') params.type = filterType;
            if (searchTerm) params.search = searchTerm;

            const response = await getProperties(params);
            const data = response.data?.data || response.data || [];
            setProperties(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching properties:', error);
            showToast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedProperty) return;
        try {
            setIsProcessing(true);
            await deleteProperty(selectedProperty.id);
            showToast.success('Property deleted successfully');
            setIsDeleteModalOpen(false);
            fetchProperties();
        } catch (error) {
            showToast.error('Failed to delete property');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePublish = async (property: Property) => {
        try {
            setIsProcessing(true);
            await publishProperty(property.id);
            showToast.success('Property published successfully');
            fetchProperties();
        } catch (error) {
            showToast.error('Failed to publish property');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleView = (property: Property) => {
        setSelectedProperty(property);
        setIsViewModalOpen(true);
    };

    const handleEdit = (property: Property) => {
        setSelectedProperty(property);
        setIsEditModalOpen(true);
    };

    const filteredProperties = properties.filter(p => {
        const search = searchTerm.toLowerCase();
        return p.title?.toLowerCase().includes(search) ||
            p.address?.toLowerCase().includes(search) ||
            p.city?.toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProperties = filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: properties.length,
        active: properties.filter(p => p.status === 'Active').length,
        pending: properties.filter(p => p.status === 'Pending').length,
        sold: properties.filter(p => p.status === 'Sold').length,
        rented: properties.filter(p => p.status === 'Rented').length,
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                        Properties
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage real estate properties and listings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchProperties}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        Add Property
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Home className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Sold</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.sold}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="OffMarket">Off Market</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterType('all');
                        fetchProperties();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedProperties.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No properties found</h3>
                        <p className="text-gray-500">Add your first property listing.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Property
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedProperties.map((property) => (
                                <tr
                                    key={property.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleView(property)}
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{property.title}</p>
                                            {property.bedrooms && property.bathrooms && (
                                                <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Bed className="h-3 w-3" /> {property.bedrooms}
                                                        </span>
                                                    <span className="flex items-center gap-1">
                                                            <Bath className="h-3 w-3" /> {property.bathrooms}
                                                        </span>
                                                    {property.buildingSize && (
                                                        <span className="flex items-center gap-1">
                                                                <Ruler className="h-3 w-3" /> {property.buildingSize} sqft
                                                            </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {property.city}, {property.state}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className="bg-gray-100 text-gray-700">
                                            {property.type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(property.price)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${getStatusBadge(property.status)} flex items-center gap-1 w-fit`}>
                                            {getStatusIcon(property.status)}
                                            {property.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleView(property)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {(property.status === 'Active' || property.status === 'Pending') && (
                                                    <DropdownMenuItem onClick={() => handleEdit(property)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                )}
                                                {property.status === 'Draft' && (
                                                    <DropdownMenuItem onClick={() => handlePublish(property)}>
                                                        <Globe className="h-4 w-4 mr-2 text-green-600" />
                                                        Publish
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedProperty(property);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedProperties.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProperties.length)} of {filteredProperties.length} properties
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddPropertyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProperties}
            />

            <EditPropertyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchProperties}
                property={selectedProperty}
            />

            <ViewPropertyModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedProperty(null);
                }}
                property={selectedProperty}
                onEdit={() => {
                    if (selectedProperty) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedProperty);
                    }
                }}
                onDelete={() => {
                    if (selectedProperty) {
                        setIsViewModalOpen(false);
                        setSelectedProperty(selectedProperty);
                        setIsDeleteModalOpen(true);
                    }
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Property
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this property? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProperty && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedProperty.title}</p>
                                <p className="text-sm text-gray-500">{selectedProperty.address}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Property
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PropertiesPage;