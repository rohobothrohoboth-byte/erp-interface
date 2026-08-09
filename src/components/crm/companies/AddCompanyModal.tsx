// src/components/crm/companies/AddCompanyModal.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Briefcase,
    User,
    Loader2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { createCompany } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import type { CreateCompanyDto } from '../../../types/crm/crm.types';

interface AddCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onSuccess,
                                                         }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateCompanyDto>({
        name: '',
        industry: '',
        status: 'Lead',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast.error('Company name is required');
            return;
        }

        try {
            setLoading(true);
            await createCompany(formData);
            showToast.success('Company created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating company:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            industry: '',
            status: 'Lead',
            email: '',
            phone: '',
            website: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            description: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Add Company</h2>
                            <p className="text-sm text-gray-500">Create a new company record</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div className="md:col-span-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                Company Name *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                className="mt-1"
                                required
                            />
                        </div>

                        {/* Industry */}
                        <div>
                            <Label htmlFor="industry" className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                                Industry
                            </Label>
                            <Select
                                value={formData.industry}
                                onValueChange={(value) => handleSelectChange('industry', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="Retail">Retail</SelectItem>
                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="Education">Education</SelectItem>
                                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
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
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    <SelectItem value="Prospect">Prospect</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Customer">Customer</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="company@example.com"
                                className="mt-1"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                className="mt-1"
                            />
                        </div>

                        {/* Website */}
                        <div className="md:col-span-2">
                            <Label htmlFor="website" className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                Website
                            </Label>
                            <Input
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://www.example.com"
                                className="mt-1"
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <Label htmlFor="address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                Address
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Street address"
                                className="mt-1"
                            />
                        </div>

                        {/* City */}
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

                        {/* State */}
                        <div>
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="mt-1"
                            />
                        </div>

                        {/* Country */}
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

                        {/* Postal Code */}
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

                        {/* Description */}
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Company description..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Company'
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddCompanyModal;