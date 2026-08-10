// src/pages/crm/contactManagement/ContactDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Star,
    UserCheck,
    MessageCircle,
    Linkedin,
    Twitter,
    Facebook,
    Calendar,
    Clock,
    Link,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Activity,
    FileText,
    MoreVertical,
} from 'lucide-react';
import { getContactById, deleteContact } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import type { ContactDto } from '@/modules/crm/types/crm.types';

const ContactDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<ContactDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchContact(id);
        }
    }, [id]);

    const fetchContact = async (contactId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getContactById(contactId);
            const data = response.data?.data || response.data;

            if (!data) {
                throw new Error('Contact not found');
            }

            setContact(data);
        } catch (error: any) {
            console.error('Error fetching contact:', error);
            const errorMessage = error?.response?.status === 404
                ? 'Contact not found'
                : error?.response?.data?.message || 'Failed to load contact details';
            setError(errorMessage);
            showToast.error(errorMessage);

            setTimeout(() => {
                navigate('/crm/contacts');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!contact) return;
        try {
            setIsDeleting(true);
            await deleteContact(contact.id);
            showToast.success('Contact deleted successfully');
            navigate('/crm/contacts');
        } catch (error) {
            showToast.error('Failed to delete contact');
        } finally {
            setIsDeleting(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Loading contact details...</p>
            </div>
        );
    }

    if (error || !contact) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Contact not found</h2>
                <p className="text-gray-500">{error || "The contact you're looking for doesn't exist."}</p>
                <Button onClick={() => navigate('/crm/contacts')} className="mt-4">
                    Back to Contacts
                </Button>
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/crm/contacts')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                                {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {contact.firstName} {contact.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {contact.title && (
                                    <span className="text-sm text-gray-500">{contact.title}</span>
                                )}
                                {contact.isActive ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-700 border-red-200">Inactive</Badge>
                                )}
                                {contact.isPrimary && (
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Primary
                                    </Badge>
                                )}
                                {contact.isDecisionMaker && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                        <UserCheck className="h-3 w-3 mr-1" />
                                        Decision Maker
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/crm/contacts/edit/${contact.id}`)}
                        className="flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Company</p>
                                <p className="text-lg font-bold text-blue-900">
                                    {contact.customerName || 'N/A'}
                                </p>
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
                                <p className="text-sm text-green-700 font-medium">Email</p>
                                <p className="text-lg font-bold text-green-900 truncate">
                                    {contact.email || 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Mail className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Phone</p>
                                <p className="text-lg font-bold text-purple-900">
                                    {contact.phone || 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Phone className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Department</p>
                                <p className="text-lg font-bold text-orange-900">
                                    {contact.department || 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Briefcase className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Communication Preferences */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <MessageCircle className="h-5 w-5 text-indigo-600" />
                                Communication Preferences
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    {contact.acceptsEmail ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm">Accepts Email</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {contact.acceptsSMS ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm">Accepts SMS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {contact.acceptsCalls ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm">Accepts Calls</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {contact.acceptsMarketing ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm">Accepts Marketing</span>
                                </div>
                            </div>
                            {contact.preferredContactMethod && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        Preferred Contact Method: <span className="font-medium">{contact.preferredContactMethod}</span>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Media */}
                    {(contact.linkedIn || contact.twitter || contact.facebook) && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <Link className="h-5 w-5 text-indigo-600" />
                                    Social Media
                                </h2>
                                <div className="space-y-2">
                                    {contact.linkedIn && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Linkedin className="h-4 w-4 text-blue-600" />
                                            <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                {contact.linkedIn}
                                            </a>
                                        </div>
                                    )}
                                    {contact.twitter && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Twitter className="h-4 w-4 text-blue-400" />
                                            <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                                                {contact.twitter}
                                            </a>
                                        </div>
                                    )}
                                    {contact.facebook && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Facebook className="h-4 w-4 text-blue-700" />
                                            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-sm">
                                                {contact.facebook}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {contact.notes && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                    Notes
                                </h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <User className="h-5 w-5 text-indigo-600" />
                                Contact Info
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {contact.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {contact.phone || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Mobile</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {contact.mobile || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Title</p>
                                    <p className="font-medium">{contact.title || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{contact.department || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium">{contact.customerName || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Engagement */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                Engagement
                            </h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Contact Count</span>
                                    <span className="font-medium">{contact.contactCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Last Contact</span>
                                    <span className="font-medium">{contact.lastContactDate ? formatDate(contact.lastContactDate) : 'Never'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Created</span>
                                    <span className="font-medium">{formatDate(contact.createdAt)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate(`/crm/contacts/edit/${contact.id}`)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Contact
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Contact
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Contact
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contact? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {contact && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                        {getInitials(contact.firstName, contact.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {contact.firstName} {contact.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{contact.email || 'No email'}</p>
                                </div>
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
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Contact
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ContactDetailPage;