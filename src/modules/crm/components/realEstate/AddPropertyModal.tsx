// src/components/crm/realEstate/AddPropertyModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Building2,
    MapPin,
    Bed,
    Bath,
    Ruler,
    DollarSign,
    Calendar,
    Home,
    Image,
    Video,
    Globe,
    Link,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Users,
    User,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';
import { createProperty } from '@/modules/crm/services/crm.api';
import { getCustomers, getAllEmployees } from '@/modules/crm/services/crm.api';
import type { CustomerDto } from '@/modules/crm/types/crm.types';

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const propertyTypes = [
    { value: '1', label: 'Residential' },
    { value: '2', label: 'Commercial' },
    { value: '3', label: 'Land' },
    { value: '4', label: 'Industrial' },
    { value: '5', label: 'Agricultural' },
    { value: '6', label: 'Mixed Use' },
];

const propertyStatuses = [
    { value: '1', label: 'Active' },
    { value: '2', label: 'Pending' },
    { value: '3', label: 'Sold' },
    { value: '4', label: 'Rented' },
    { value: '5', label: 'Off Market' },
    { value: '6', label: 'Under Construction' },
];

const propertyFeatures = [
    'Pool', 'Garage', 'Parking', 'Garden', 'Balcony', 'Elevator',
    'Security System', 'Gym', 'Air Conditioning', 'Heating', 'Fireplace',
    'Basement', 'Attic', 'Waterfront', 'Mountain View', 'Smart Home',
    'Solar Panels', 'Wine Cellar', 'Home Theater', 'Sauna', 'Tennis Court'
];

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSuccess,
                                                           }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [agents, setAgents] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '1',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        latitude: '',
        longitude: '',
        bedrooms: '',
        bathrooms: '',
        halfBathrooms: '',
        landSize: '',
        buildingSize: '',
        yearBuilt: '',
        price: '',
        status: '1',
        ownerId: '',
        listingAgentId: '',
        features: [] as string[],
        mainImageUrl: '',
        images: [] as string[],
        virtualTourUrl: '',
        videoUrl: '',
        isFeatured: false,
        isPublished: false,
        marketingDescription: '',
    });

    const [imageInput, setImageInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            // Set default listing date to today
            setFormData(prev => ({
                ...prev,
                listingDate: new Date().toISOString().split('T')[0],
            }));
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [customersRes, agentsRes] = await Promise.all([
                getCustomers({ page: 1, pageSize: 1000 }),
                getEmployees({ page: 1, pageSize: 1000 }),
            ]);
            setCustomers(customersRes.data?.data || []);
            setAgents(agentsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()],
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature),
        }));
    };

    const addImage = () => {
        if (imageInput.trim()) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, imageInput.trim()],
            }));
            setImageInput('');
        }
    };

    const removeImage = (image: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(i => i !== image),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showToast.error('Property title is required');
            return;
        }

        if (!formData.address.trim()) {
            showToast.error('Property address is required');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            showToast.error('Please enter a valid price');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: parseInt(formData.type),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                postalCode: formData.postalCode.trim(),
                country: formData.country.trim(),
                latitude: formData.latitude.trim(),
                longitude: formData.longitude.trim(),
                bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
                halfBathrooms: formData.halfBathrooms ? parseInt(formData.halfBathrooms) : null,
                landSize: formData.landSize ? parseFloat(formData.landSize) : null,
                buildingSize: formData.buildingSize ? parseFloat(formData.buildingSize) : null,
                yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
                price: parseFloat(formData.price),
                status: parseInt(formData.status),
                ownerId: formData.ownerId || null,
                listingAgentId: formData.listingAgentId || null,
                features: formData.features.length > 0 ? formData.features : null,
                mainImageUrl: formData.mainImageUrl.trim() || null,
                images: formData.images.length > 0 ? formData.images : null,
                virtualTourUrl: formData.virtualTourUrl.trim() || null,
                videoUrl: formData.videoUrl.trim() || null,
                isFeatured: formData.isFeatured,
                isPublished: formData.isPublished,
                marketingDescription: formData.marketingDescription.trim() || null,
            };

            await createProperty(payload);
            showToast.success('Property created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating property:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: '1',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'USA',
            latitude: '',
            longitude: '',
            bedrooms: '',
            bathrooms: '',
            halfBathrooms: '',
            landSize: '',
            buildingSize: '',
            yearBuilt: '',
            price: '',
            status: '1',
            ownerId: '',
            listingAgentId: '',
            features: [],
            mainImageUrl: '',
            images: [],
            virtualTourUrl: '',
            videoUrl: '',
            isFeatured: false,
            isPublished: false,
            marketingDescription: '',
        });
        setFeatureInput('');
        setImageInput('');
    };

    if (!isOpen) return null;

    const isLoading = loading || loadingOptions;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Add New Property
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        Create a new property listing
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <span className="ml-3 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Building2 className="h-4 w-4 mr-2" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="title">Property Title *</Label>
                                                <Input
                                                    id="title"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="Enter property title"
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder="Describe the property..."
                                                    className="mt-1"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="type">Property Type *</Label>
                                                <Select
                                                    value={formData.type}
                                                    onValueChange={(value) => handleSelectChange('type', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {propertyTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => handleSelectChange('status', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {propertyStatuses.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Location
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="address">Address *</Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Street address"
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    placeholder="City"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    placeholder="State"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="postalCode">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleChange}
                                                    placeholder="Postal code"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={formData.country}
                                                    onChange={handleChange}
                                                    placeholder="Country"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="latitude">Latitude</Label>
                                                <Input
                                                    id="latitude"
                                                    name="latitude"
                                                    value={formData.latitude}
                                                    onChange={handleChange}
                                                    placeholder="e.g., 34.0522"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="longitude">Longitude</Label>
                                                <Input
                                                    id="longitude"
                                                    name="longitude"
                                                    value={formData.longitude}
                                                    onChange={handleChange}
                                                    placeholder="e.g., -118.2437"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Home className="h-4 w-4 mr-2" />
                                            Property Details
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <Label htmlFor="bedrooms" className="flex items-center gap-1">
                                                    <Bed className="h-4 w-4" /> Bedrooms
                                                </Label>
                                                <Input
                                                    id="bedrooms"
                                                    name="bedrooms"
                                                    type="number"
                                                    value={formData.bedrooms}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={0}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bathrooms" className="flex items-center gap-1">
                                                    <Bath className="h-4 w-4" /> Bathrooms
                                                </Label>
                                                <Input
                                                    id="bathrooms"
                                                    name="bathrooms"
                                                    type="number"
                                                    value={formData.bathrooms}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.5}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="halfBathrooms">Half Bathrooms</Label>
                                                <Input
                                                    id="halfBathrooms"
                                                    name="halfBathrooms"
                                                    type="number"
                                                    value={formData.halfBathrooms}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={0}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="yearBuilt">Year Built</Label>
                                                <Input
                                                    id="yearBuilt"
                                                    name="yearBuilt"
                                                    type="number"
                                                    value={formData.yearBuilt}
                                                    onChange={handleChange}
                                                    placeholder="2020"
                                                    className="mt-1"
                                                    min={1800}
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="landSize" className="flex items-center gap-1">
                                                    <Ruler className="h-4 w-4" /> Land Size (sq ft)
                                                </Label>
                                                <Input
                                                    id="landSize"
                                                    name="landSize"
                                                    type="number"
                                                    value={formData.landSize}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="buildingSize" className="flex items-center gap-1">
                                                    <Ruler className="h-4 w-4" /> Building Size (sq ft)
                                                </Label>
                                                <Input
                                                    id="buildingSize"
                                                    name="buildingSize"
                                                    type="number"
                                                    value={formData.buildingSize}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Pricing
                                        </h3>
                                        <div>
                                            <Label htmlFor="price">Price *</Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="mt-1"
                                                min={0}
                                                step={0.01}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Owner & Agent */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Owner & Agent
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="ownerId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Owner
                                                </Label>
                                                <Select
                                                    value={formData.ownerId}
                                                    onValueChange={(value) => handleSelectChange('ownerId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select owner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="listingAgentId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Listing Agent
                                                </Label>
                                                <Select
                                                    value={formData.listingAgentId}
                                                    onValueChange={(value) => handleSelectChange('listingAgentId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {agents.map((agent) => (
                                                            <SelectItem key={agent.id} value={agent.id}>
                                                                {agent.fullName || `${agent.firstName} ${agent.lastName}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Home className="h-4 w-4 mr-2" />
                                            Features & Amenities
                                        </h3>
                                        <div className="flex gap-2">
                                            <Input
                                                value={featureInput}
                                                onChange={(e) => setFeatureInput(e.target.value)}
                                                placeholder="Add a feature (e.g., Pool)"
                                                className="flex-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addFeature();
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={addFeature}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.features.map((feature) => (
                                                <span
                                                    key={feature}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                                >
                                                    {feature}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(feature)}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {propertyFeatures.map((feature) => (
                                                <button
                                                    key={feature}
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.features.includes(feature)) {
                                                            removeFeature(feature);
                                                        } else {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                features: [...prev.features, feature],
                                                            }));
                                                        }
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-sm border ${
                                                        formData.features.includes(feature)
                                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {feature}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Media */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Image className="h-4 w-4 mr-2" />
                                            Media
                                        </h3>
                                        <div>
                                            <Label htmlFor="mainImageUrl">Main Image URL</Label>
                                            <Input
                                                id="mainImageUrl"
                                                name="mainImageUrl"
                                                value={formData.mainImageUrl}
                                                onChange={handleChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Additional Images</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    value={imageInput}
                                                    onChange={(e) => setImageInput(e.target.value)}
                                                    placeholder="Image URL"
                                                    className="flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addImage();
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={addImage}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {formData.images.map((image, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                    >
                                                        <Image className="h-3 w-3" />
                                                        Image {index + 1}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(image)}
                                                            className="hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="virtualTourUrl" className="flex items-center gap-1">
                                                    <Link className="h-4 w-4" /> Virtual Tour URL
                                                </Label>
                                                <Input
                                                    id="virtualTourUrl"
                                                    name="virtualTourUrl"
                                                    value={formData.virtualTourUrl}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/tour"
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="videoUrl" className="flex items-center gap-1">
                                                    <Video className="h-4 w-4" /> Video URL
                                                </Label>
                                                <Input
                                                    id="videoUrl"
                                                    name="videoUrl"
                                                    value={formData.videoUrl}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/video.mp4"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marketing */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Globe className="h-4 w-4 mr-2" />
                                            Marketing
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="isFeatured"
                                                    checked={formData.isFeatured}
                                                    onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <Label htmlFor="isFeatured" className="cursor-pointer">
                                                    Featured Property
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="isPublished"
                                                    checked={formData.isPublished}
                                                    onChange={(e) => handleCheckboxChange('isPublished', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <Label htmlFor="isPublished" className="cursor-pointer">
                                                    Publish Immediately
                                                </Label>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="marketingDescription">Marketing Description</Label>
                                            <Textarea
                                                id="marketingDescription"
                                                name="marketingDescription"
                                                value={formData.marketingDescription}
                                                onChange={handleChange}
                                                placeholder="Marketing copy for this property..."
                                                className="mt-1"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="sticky bottom-0 bg-gray-50 -mx-6 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Building2 className="h-4 w-4 mr-2" />
                                                    Create Property
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddPropertyModal;