// src/components/crm/realEstate/ViewPropertyModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Building2,
    MapPin,
    Bed,
    Bath,
    Ruler,
    DollarSign,
    Home,
    Image,
    Video,
    Globe,
    Link,
    Edit,
    Trash2,
    Users,
    User,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    TrendingUp,
    Heart,
    Share2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { showToast } from '../../../layout/layout';
import type { Property } from '../../../types/crm/crm.types';

interface ViewPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onEdit?: () => void;
    onDelete?: () => void;
}

const ViewPropertyModal: React.FC<ViewPropertyModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 property,
                                                                 onEdit,
                                                                 onDelete,
                                                             }) => {
    if (!isOpen || !property) return null;

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
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="bg-white/20 rounded-lg p-2">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {property.title}
                                        </h2>
                                        <p className="text-sm text-blue-200 flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            {property.address}, {property.city}, {property.state} {property.postalCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={getStatusBadge(property.status)}>
                                        {property.status}
                                    </Badge>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-180px)]">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(property.price)}
                                    </p>
                                    <p className="text-xs text-gray-500">Price</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {property.bedrooms || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <Bed className="h-3 w-3" /> Bedrooms
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {property.bathrooms || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <Bath className="h-3 w-3" /> Bathrooms
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {property.buildingSize || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                        <Ruler className="h-3 w-3" /> Sq Ft
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                                    <p className="text-gray-600">{property.description}</p>
                                </div>
                            )}

                            {/* Property Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Property Details</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Type</dt>
                                            <dd className="font-medium">{property.type}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Status</dt>
                                            <dd className="font-medium">
                                                <Badge className={getStatusBadge(property.status)}>
                                                    {property.status}
                                                </Badge>
                                            </dd>
                                        </div>
                                        {property.yearBuilt && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Year Built</dt>
                                                <dd className="font-medium">{property.yearBuilt}</dd>
                                            </div>
                                        )}
                                        {property.landSize && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Land Size</dt>
                                                <dd className="font-medium">{property.landSize.toLocaleString()} sq ft</dd>
                                            </div>
                                        )}
                                        {property.listingDate && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Listed On</dt>
                                                <dd className="font-medium">{formatDate(property.listingDate)}</dd>
                                            </div>
                                        )}
                                        {property.soldDate && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Sold On</dt>
                                                <dd className="font-medium">{formatDate(property.soldDate)}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Address</dt>
                                            <dd className="font-medium text-right">{property.address}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">City</dt>
                                            <dd className="font-medium">{property.city}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">State</dt>
                                            <dd className="font-medium">{property.state}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Postal Code</dt>
                                            <dd className="font-medium">{property.postalCode}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Country</dt>
                                            <dd className="font-medium">{property.country}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Features */}
                            {property.features && property.features.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Features & Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-100"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Owner & Agent */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {property.ownerName && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Owner</p>
                                        <p className="font-medium">{property.ownerName}</p>
                                    </div>
                                )}
                                {property.listingAgentName && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Listing Agent</p>
                                        <p className="font-medium">{property.listingAgentName}</p>
                                    </div>
                                )}
                            </div>

                            {/* Media */}
                            {(property.mainImageUrl || property.images?.length > 0 || property.virtualTourUrl || property.videoUrl) && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Media</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {property.mainImageUrl && (
                                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={property.mainImageUrl}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-2 py-0.5 rounded">Main</span>
                                            </div>
                                        )}
                                        {property.images?.slice(0, 3).map((image, index) => (
                                            <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={`${property.title} - ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {property.virtualTourUrl && (
                                            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                                                <Link className="h-6 w-6 text-indigo-600 mr-1" />
                                                <span className="text-sm text-indigo-600">Virtual Tour</span>
                                            </div>
                                        )}
                                        {property.videoUrl && (
                                            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                                                <Video className="h-6 w-6 text-red-600 mr-1" />
                                                <span className="text-sm text-red-600">Video</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Marketing */}
                            {property.marketingDescription && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-blue-700 mb-1">Marketing Description</h3>
                                    <p className="text-sm text-blue-600">{property.marketingDescription}</p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-center text-sm text-gray-500 border-t pt-4">
                                <div className="flex items-center justify-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {property.viewCount || 0} Views
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {property.inquiryCount || 0} Inquiries
                                </div>
                                {property.isFeatured && (
                                    <div className="flex items-center justify-center gap-1 text-indigo-600">
                                        <TrendingUp className="h-4 w-4" />
                                        Featured
                                    </div>
                                )}
                                {property.isPublished && (
                                    <div className="flex items-center justify-center gap-1 text-green-600">
                                        <Globe className="h-4 w-4" />
                                        Published
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                            {onEdit && (
                                <Button
                                    onClick={onEdit}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Property
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    onClick={onDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewPropertyModal;