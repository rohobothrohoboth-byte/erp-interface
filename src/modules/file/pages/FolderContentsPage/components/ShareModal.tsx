// src/pages/file/FolderContentsPage/components/ShareModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Share2, Mail, Users, Link, Facebook, Twitter,
    Linkedin, Copy, Check, Globe, UserPlus,
    MessageCircle, Send, File, Download, Loader2,
    Smartphone, QrCode, Printer, Calendar,
    Bookmark, MoreHorizontal, Phone, Clock
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { fileApi } from '@/modules/file/services/fileManagement/fileManagementApi';

// ============================================================
// TYPES
// ============================================================

type ShareTab = 'link' | 'email' | 'internal' | 'social' | 'sms' | 'more';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: any;
    shareWithEmail: string;
    onEmailChange: (email: string) => void;
    sharePermission: string;
    onPermissionChange: (permission: string) => void;
    onShare: () => void;
    onInternalShare?: (userId: string, permission: string) => void;
    onSocialShare?: (platform: string) => void;
    onCopyLink?: () => void;
    onPublicShare?: (isPublic: boolean) => void;
    availableUsers?: Array<{ id: string; name: string; email: string; avatar?: string; phone?: string }>;
    isPublic?: boolean;
    isShared?: boolean;
    sharingLevel?: string;
    onSmsShare?: (phoneNumber: string, message: string) => void;
    onQrCodeGenerate?: (url: string) => void;
    onScheduleShare?: (date: string, time: string) => void;
}

// ============================================================
// SOCIAL PLATFORMS
// ============================================================

const socialPlatforms = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-[#1877F2] hover:bg-[#1877F2]/90' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-[#000000] hover:bg-[#000000]/90' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366] hover:bg-[#25D366]/90' },
    { id: 'telegram', label: 'Telegram', icon: Send, color: 'bg-[#26A5E4] hover:bg-[#26A5E4]/90' },
    { id: 'email_share', label: 'Email', icon: Mail, color: 'bg-[#EA4335] hover:bg-[#EA4335]/90' },
];

// ============================================================
// MORE SHARING OPTIONS
// ============================================================

const moreOptions = [
    { id: 'qr', label: 'QR Code', icon: QrCode, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'schedule', label: 'Schedule Share', icon: Calendar, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'bookmark', label: 'Bookmark', icon: Bookmark, color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'print', label: 'Print', icon: Printer, color: 'bg-gray-500 hover:bg-gray-600' },
];

// ============================================================
// SMS TEMPLATES
// ============================================================

const smsTemplates = [
    { id: 'default', label: 'Standard', template: 'I\'ve shared a file with you: {fileName}. Download it here: {link}' },
    { id: 'urgent', label: 'Urgent', template: 'URGENT: Please review this file: {fileName}. Download here: {link}' },
    { id: 'friendly', label: 'Friendly', template: 'Hi! Just sharing this file with you: {fileName}. Check it out: {link}' },
    { id: 'professional', label: 'Professional', template: 'Please find attached file: {fileName}. Access it here: {link}. Regards.' },
];

// ============================================================
// QR CODE COMPONENT (Simple version without external library)
// ============================================================

const SimpleQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 150 }) => {
    const [qrImageUrl, setQrImageUrl] = useState<string>('');

    React.useEffect(() => {
        // Use a free QR code generation API
        const encodedValue = encodeURIComponent(value);
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}`;
        setQrImageUrl(apiUrl);
    }, [value, size]);

    if (!qrImageUrl) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <img
            src={qrImageUrl}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded-lg"
        />
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const ShareModal: React.FC<ShareModalProps> = ({
                                                          isOpen,
                                                          onClose,
                                                          document,
                                                          shareWithEmail,
                                                          onEmailChange,
                                                          sharePermission,
                                                          onPermissionChange,
                                                          onShare,
                                                          onInternalShare,
                                                          onSocialShare,
                                                          onCopyLink,
                                                          onPublicShare,
                                                          availableUsers = [],
                                                          isPublic = false,
                                                          isShared = false,
                                                          sharingLevel = 'Private',
                                                          onSmsShare,
                                                          onQrCodeGenerate,
                                                          onScheduleShare,
                                                      }) => {
    // State
    const [activeTab, setActiveTab] = useState<ShareTab>('link');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [internalPermission, setInternalPermission] = useState('view');
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [shareLink, setShareLink] = useState<string>('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [linkExpiresAt, setLinkExpiresAt] = useState<string>('');
    const [showQrCode, setShowQrCode] = useState(false);

    // SMS states
    const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
    const [smsMessage, setSmsMessage] = useState('');
    const [selectedSmsTemplate, setSelectedSmsTemplate] = useState('default');
    const [smsRecipients, setSmsRecipients] = useState<string[]>([]);
    const [smsRecipientInput, setSmsRecipientInput] = useState('');

    // Schedule states
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    // ============================================================
    // GENERATE SHARE LINK
    // ============================================================

    const generateShareLink = async () => {
        if (!document) return;

        setGeneratingLink(true);
        try {
            const docId = document.id || document.Id;

            const response = await fileApi.post(`/documents/${docId}/generate-share-link`);

            if (response.data?.data) {
                const { token, expiresAt } = response.data.data;
                const baseUrl = window.location.origin;
                const shareUrl = `${baseUrl}/public/file/${token}`;
                setShareLink(shareUrl);
                setLinkExpiresAt(expiresAt);

                const fileName = document?.fileName || document?.name || 'Document';
                const defaultTemplate = smsTemplates.find(t => t.id === 'default')?.template || '';
                setSmsMessage(defaultTemplate.replace('{fileName}', fileName).replace('{link}', shareUrl));

                showToast.success('Share link generated!');
            }
        } catch (error: any) {
            console.error('Failed to generate share link:', error);
            showToast.error(error?.message || 'Failed to generate share link');
        } finally {
            setGeneratingLink(false);
        }
    };

    // ============================================================
    // COPY LINK
    // ============================================================

    const handleCopyLink = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
            showToast.success('Link copied to clipboard!');
        } else if (onCopyLink) {
            onCopyLink();
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    // ============================================================
    // SOCIAL SHARE
    // ============================================================

    const handleSocialShare = (platform: string) => {
        const shareUrl = shareLink || window.location.href;
        const fileName = document?.fileName || document?.name || 'Document';
        const text = `Check out this file: ${fileName}`;

        const shareUrls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
            email_share: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent('Download: ' + shareUrl)}`,
        };

        const sharePlatformUrl = shareUrls[platform];
        if (sharePlatformUrl) {
            window.open(sharePlatformUrl, '_blank', 'width=600,height=400');
            showToast.success(`Opened share dialog for ${platform}`);
        }

        if (onSocialShare) {
            onSocialShare(platform);
        }
    };

    // ============================================================
    // SMS SHARE
    // ============================================================

    const handleSmsShare = () => {
        const phones = smsRecipients.length > 0 ? smsRecipients : [smsPhoneNumber];
        const validPhones = phones.filter(p => p.trim().length > 0);

        if (validPhones.length === 0) {
            showToast.warning('Please enter at least one phone number');
            return;
        }

        if (!smsMessage.trim()) {
            showToast.warning('Please enter a message');
            return;
        }

        if (onSmsShare) {
            validPhones.forEach(phone => {
                onSmsShare(phone, smsMessage);
            });
            showToast.success(`SMS sent to ${validPhones.length} recipient(s)`);
            setSmsRecipients([]);
            setSmsPhoneNumber('');
            return;
        }

        if (validPhones.length === 1) {
            const encodedMessage = encodeURIComponent(smsMessage);
            window.location.href = `sms:${validPhones[0]}?body=${encodedMessage}`;
            showToast.success(`SMS app opened for ${validPhones[0]}`);
        } else {
            showToast.info('Multiple recipients: Use backend SMS API');
        }
    };

    const handleAddSmsRecipient = () => {
        if (smsRecipientInput.trim()) {
            setSmsRecipients([...smsRecipients, smsRecipientInput.trim()]);
            setSmsRecipientInput('');
        }
    };

    const handleRemoveSmsRecipient = (index: number) => {
        setSmsRecipients(smsRecipients.filter((_, i) => i !== index));
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedSmsTemplate(templateId);
        const template = smsTemplates.find(t => t.id === templateId);
        if (template) {
            const fileName = document?.fileName || document?.name || 'Document';
            setSmsMessage(template.template.replace('{fileName}', fileName).replace('{link}', shareLink || window.location.href));
        }
    };

    // ============================================================
    // QR CODE
    // ============================================================

    const handleGenerateQrCode = () => {
        if (!shareLink) {
            showToast.warning('Please generate a share link first');
            return;
        }
        setShowQrCode(true);
        if (onQrCodeGenerate) {
            onQrCodeGenerate(shareLink);
        }
    };

    // ============================================================
    // SCHEDULE SHARE
    // ============================================================

    const handleScheduleShare = () => {
        if (!scheduleDate || !scheduleTime) {
            showToast.warning('Please select date and time');
            return;
        }
        if (onScheduleShare) {
            const dateTime = `${scheduleDate}T${scheduleTime}`;
            onScheduleShare(scheduleDate, scheduleTime);
            showToast.success(`Share scheduled for ${new Date(dateTime).toLocaleString()}`);
        }
    };

    // ============================================================
    // EMAIL SHARE
    // ============================================================

    const handleEmailShare = () => {
        if (!shareWithEmail.trim()) {
            showToast.warning('Please enter an email address');
            return;
        }

        const shareUrl = shareLink || window.location.href;
        const fileName = document?.fileName || document?.name || 'Document';
        const subject = `Shared File: ${fileName}`;
        const body = `Hello,\n\nI've shared a file with you: ${fileName}\n\nYou can download it here: ${shareUrl}\n\nRegards,\n${document?.uploadedBy || 'User'}`;

        window.location.href = `mailto:${shareWithEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        showToast.success(`Email opened for ${shareWithEmail}`);
        onShare();
    };

    // ============================================================
    // INTERNAL SHARE
    // ============================================================

    const handleInternalShare = () => {
        if (!selectedUser) {
            showToast.warning('Please select a user');
            return;
        }
        if (onInternalShare) {
            onInternalShare(selectedUser, internalPermission);
        }
    };

    // ============================================================
    // FILTER USERS
    // ============================================================

    const filteredUsers = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ============================================================
    // GET FILE NAME
    // ============================================================

    const getFileName = () => {
        return document?.fileName || document?.name || 'Unnamed';
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <AnimatePresence>
            {isOpen && document && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-purple-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Share File</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Document Info */}
                        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <File className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {getFileName()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                                        {document.fileSize && ' • '}
                                        {document.fileType || 'File'}
                                    </p>
                                </div>
                                <Badge className="text-xs bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    {sharingLevel || 'Private'}
                                </Badge>
                            </div>
                            {(isPublic || isShared) && (
                                <div className="flex gap-2 mt-2">
                                    {isPublic && (
                                        <Badge className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <Globe className="w-3 h-3 inline mr-1" />
                                            Public
                                        </Badge>
                                    )}
                                    {isShared && (
                                        <Badge className="text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                            <Users className="w-3 h-3 inline mr-1" />
                                            Shared
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('link')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'link'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Link className="w-4 h-4 inline mr-1" />
                                Link
                            </button>
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'email'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Mail className="w-4 h-4 inline mr-1" />
                                Email
                            </button>
                            <button
                                onClick={() => setActiveTab('sms')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'sms'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Smartphone className="w-4 h-4 inline mr-1" />
                                SMS
                            </button>
                            <button
                                onClick={() => setActiveTab('internal')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'internal'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Users className="w-4 h-4 inline mr-1" />
                                Internal
                            </button>
                            <button
                                onClick={() => setActiveTab('social')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'social'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <Share2 className="w-4 h-4 inline mr-1" />
                                Social
                            </button>
                            <button
                                onClick={() => setActiveTab('more')}
                                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                    activeTab === 'more'
                                        ? 'text-purple-600 border-b-2 border-purple-500 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <MoreHorizontal className="w-4 h-4 inline mr-1" />
                                More
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px]">
                            {/* Direct Link Tab */}
                            {activeTab === 'link' && (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <File className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                Direct File Download Link
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-300">
                                                Anyone with this link can download the file directly. No login required.
                                            </p>
                                        </div>
                                    </div>

                                    {!shareLink ? (
                                        <Button
                                            onClick={generateShareLink}
                                            disabled={generatingLink}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                                        >
                                            {generatingLink ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Link className="w-4 h-4 mr-2" />
                                                    Generate Share Link
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                <input
                                                    type="text"
                                                    value={shareLink}
                                                    readOnly
                                                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 truncate"
                                                />
                                                <Button
                                                    onClick={handleCopyLink}
                                                    className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                >
                                                    {copied ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span>Link expires: {new Date(linkExpiresAt).toLocaleDateString()}</span>
                                                <button
                                                    onClick={() => {
                                                        setShareLink('');
                                                        generateShareLink();
                                                    }}
                                                    className="text-blue-500 hover:text-blue-600"
                                                >
                                                    Regenerate Link
                                                </button>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    window.open(shareLink, '_blank');
                                                }}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Open File
                                            </Button>
                                        </div>
                                    )}

                                    {onPublicShare && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Public Access
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {isPublic ? 'Anyone can access this file' : 'Only shared users can access'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onPublicShare(!isPublic)}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                                    isPublic ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <div
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                                        isPublic ? 'translate-x-6' : ''
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Email Tab */}
                            {activeTab === 'email' && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            💡 The email will include a direct download link. No login required.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={shareWithEmail}
                                            onChange={(e) => onEmailChange(e.target.value)}
                                            placeholder="Enter email address"
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Permission
                                        </label>
                                        <select
                                            value={sharePermission}
                                            onChange={(e) => onPermissionChange(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="view">View Only</option>
                                            <option value="download">View & Download</option>
                                            <option value="edit">Edit</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleEmailShare}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                                        disabled={!shareWithEmail.trim()}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Email with Download Link
                                    </Button>
                                </div>
                            )}

                            {/* SMS Tab */}
                            {activeTab === 'sms' && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                            📱 Send the download link via SMS. Works on any mobile phone.
                                        </p>
                                    </div>

                                    {!shareLink && (
                                        <Button
                                            onClick={generateShareLink}
                                            disabled={generatingLink}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm"
                                        >
                                            {generatingLink ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating Link...
                                                </>
                                            ) : (
                                                <>
                                                    <Link className="w-4 h-4 mr-2" />
                                                    Generate Link First
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {shareLink && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Message Template
                                                </label>
                                                <select
                                                    value={selectedSmsTemplate}
                                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                                >
                                                    {smsTemplates.map((template) => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Message <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={smsMessage}
                                                    onChange={(e) => setSmsMessage(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white resize-none"
                                                    placeholder="Enter your SMS message..."
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {smsMessage.length} characters
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={smsPhoneNumber}
                                                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                                                    placeholder="+1 234 567 8900"
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>

                                            <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    Or add multiple recipients:
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        value={smsRecipientInput}
                                                        onChange={(e) => setSmsRecipientInput(e.target.value)}
                                                        placeholder="+1 234 567 8900"
                                                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white text-sm"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddSmsRecipient();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={handleAddSmsRecipient}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                {smsRecipients.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {smsRecipients.map((phone, index) => (
                                                            <Badge
                                                                key={index}
                                                                className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1"
                                                            >
                                                                <Smartphone className="w-3 h-3" />
                                                                {phone}
                                                                <button
                                                                    onClick={() => handleRemoveSmsRecipient(index)}
                                                                    className="hover:text-red-500"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={handleSmsShare}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                disabled={!smsPhoneNumber.trim() && smsRecipients.length === 0}
                                            >
                                                <Smartphone className="w-4 h-4 mr-2" />
                                                Send SMS with Download Link
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Internal Tab */}
                            {activeTab === 'internal' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Search Users
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search by name or email..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => setSelectedUser(user.id)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                        selectedUser === user.id
                                                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500'
                                                            : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                                                    } border border-transparent`}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    {selectedUser === user.id && (
                                                        <Check className="w-4 h-4 text-purple-500" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                                                No users found
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Permission
                                        </label>
                                        <select
                                            value={internalPermission}
                                            onChange={(e) => setInternalPermission(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="view">View Only</option>
                                            <option value="download">View & Download</option>
                                            <option value="edit">Edit</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={handleInternalShare}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                        disabled={!selectedUser}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Share Internally
                                    </Button>
                                </div>
                            )}

                            {/* Social Tab */}
                            {activeTab === 'social' && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-blue-700 dark:text-blue-400">
                                            💡 Share the direct download link on social media. No login required.
                                        </p>
                                    </div>
                                    {!shareLink && (
                                        <Button
                                            onClick={generateShareLink}
                                            disabled={generatingLink}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm"
                                        >
                                            {generatingLink ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating Link...
                                                </>
                                            ) : (
                                                <>
                                                    <Link className="w-4 h-4 mr-2" />
                                                    Generate Link First
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <div className="grid grid-cols-3 gap-3">
                                        {socialPlatforms.map((platform) => {
                                            const Icon = platform.icon;
                                            return (
                                                <button
                                                    key={platform.id}
                                                    onClick={() => handleSocialShare(platform.id)}
                                                    disabled={!shareLink && !generatingLink}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl text-white transition-transform hover:scale-105 ${
                                                        platform.color
                                                    } ${!shareLink && !generatingLink ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                    <span className="text-xs font-medium">{platform.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {shareLink && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate">
                                            Sharing: {shareLink}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* More Tab */}
                            {activeTab === 'more' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {moreOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        if (option.id === 'qr') {
                                                            handleGenerateQrCode();
                                                        } else if (option.id === 'schedule') {
                                                            handleScheduleShare();
                                                        } else if (option.id === 'print') {
                                                            window.print();
                                                            showToast.success('Print dialog opened');
                                                        } else if (option.id === 'bookmark') {
                                                            if (document) {
                                                                const docId = document.id || document.Id;
                                                                fileApi.post(`/documents/${docId}/favorite`)
                                                                    .then(() => {
                                                                        showToast.success('Bookmarked!');
                                                                    })
                                                                    .catch(() => {
                                                                        showToast.error('Failed to bookmark');
                                                                    });
                                                            }
                                                        }
                                                    }}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-transform hover:scale-105 ${option.color}`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                    <span className="text-xs font-medium">{option.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>



                                    {/* QR Code Display - Using free API */}
                                    {showQrCode && shareLink && (
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                            <div className="flex flex-col items-center">
                                                <SimpleQRCode value={shareLink} size={150} />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    Scan to access file
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        // ✅ FIX: Use window.document instead of document
                                                        const img = window.document.querySelector('img[alt="QR Code"]');
                                                        if (img) {
                                                            const link = window.document.createElement('a');
                                                            link.download = 'qr-code.png';
                                                            link.href = (img as HTMLImageElement).src;
                                                            link.click();
                                                            showToast.success('QR Code downloaded');
                                                        }
                                                    }}
                                                    className="mt-2 bg-purple-500 hover:bg-purple-600 text-white text-sm"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download QR Code
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Schedule Share */}
                                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Schedule Share
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white text-sm"
                                            />
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white text-sm"
                                            />
                                            <Button
                                                onClick={handleScheduleShare}
                                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};