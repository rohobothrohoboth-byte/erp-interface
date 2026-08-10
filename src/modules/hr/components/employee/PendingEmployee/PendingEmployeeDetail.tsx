import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    User,
    Briefcase,
    Building2,
    MapPin,
    Award,
    Mail,
    Phone,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Sparkles,
    FileText,
    Shield,
    Heart
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import type { EmpDbPendList } from '@/modules/hr/types/dashboard'
import ReviewModal from '@/modules/hr/components/employee/PendingEmployee/ReviewModal'
import { useLanguage } from '@/shared/i18n/LanguageContext';

export const PendingEmployeeDetail: React.FC = () => {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [employee, setEmployee] = useState<EmpDbPendList | null>(null)
    const [loading, setLoading] = useState(true)
    const [showReviewModal, setShowReviewModal] = useState(false)

    useEffect(() => {
        const stored = sessionStorage.getItem('selectedPendingEmployee')
        if (stored) {
            setEmployee(JSON.parse(stored))
        }
        setLoading(false)
    }, [id])

    const getInitials = (name: string): string =>
        name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || '??'

    const getDepartmentColor = (department: string): string => {
        const colors: Record<string, string> = {
            'IT': 'bg-blue-100 text-blue-700 border-blue-200',
            'HR': 'bg-purple-100 text-purple-700 border-purple-200',
            'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
            'Sales': 'bg-orange-100 text-orange-700 border-orange-200',
            'Operations': 'bg-amber-100 text-amber-700 border-amber-200',
        }
        return colors[department] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    const handleBack = () => {
        navigate('/hr/pend-employees')
    }

    const handleApprove = () => {
        setShowReviewModal(true)
    }

    const handleReject = () => {
        setShowReviewModal(true)
    }

    const handleReviewClose = () => {
        setShowReviewModal(false)
        navigate('/hr/pend-employees')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-amber-200 rounded-full" />
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium mt-4">{t.loadingEmployeeDetails || "Loading employee details..."}</p>
                </div>
            </div>
        )
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
                <Card className="p-8 text-center max-w-md">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">{t.employeeNotFound || "Employee Not Found"}</h2>
                    <p className="text-slate-500 mb-6">{t.employeeNotFoundMsg || "The pending employee record could not be found."}</p>
                    <Button onClick={handleBack} className="bg-gradient-to-r from-amber-600 to-orange-600">
                        {t.backToPendingList || "Back to Pending List"}
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
                <div className="fixed inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />
                <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/10 to-rose-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative container mx-auto px-4 py-6 max-w-5xl">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: -4 }}
                        onClick={handleBack}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 hover:bg-white hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.backToPendingList || "Back to Pending List"}
                    </motion.button>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl overflow-hidden">
                            {/* Header with Gradient */}
                            <div className="relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-20 rounded-xl" />
                                                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-bold text-slate-800">{t.pendingEmployeeReview || "Pending Employee Review"}</h1>
                                                <p className="text-sm text-slate-500 mt-0.5">{t.reviewBeforeApproval || "Review employee information before approval"}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-700 border-0 px-3 py-1.5 rounded-full">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                                {t.pendingApproval || "Pending Approval"}
                                            </div>
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Profile Section */}
                                <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-slate-100">
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md opacity-30" />
                                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-2xl font-bold">
                                                    {getInitials(employee.empFullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800">{employee.empFullName || t.noName || "No Name"}</h2>
                                                {employee.empFullNameAm && (
                                                    <p className="text-sm text-slate-500 mt-1">{employee.empFullNameAm}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge className={getDepartmentColor(employee.department)}>
                                                        {employee.department || t.unassigned || "Unassigned"}
                                                    </Badge>
                                                    {employee.position && (
                                                        <Badge className="bg-slate-100 text-slate-700 border-0">
                                                            <Briefcase className="w-3 h-3 mr-1" />
                                                            {employee.position}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full">
                                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                <span className="text-xs font-medium text-amber-700">{t.awaitingReview || "Awaiting Review"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="py-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        {t.employeeInformation || "Employee Information"}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailCard
                                            icon={<Briefcase className="w-4 h-4" />}
                                            label={t.employeeCode || "Employee Code"}
                                            value={employee.code || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<User className="w-4 h-4" />}
                                            label={t.gender || "Gender"}
                                            value={employee.gender || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<Building2 className="w-4 h-4" />}
                                            label={t.department || "Department"}
                                            value={employee.department || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<Briefcase className="w-4 h-4" />}
                                            label={t.position || "Position"}
                                            value={employee.position || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<MapPin className="w-4 h-4" />}
                                            label={t.branch || "Branch"}
                                            value={employee.branch || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<Award className="w-4 h-4" />}
                                            label={t.jobGrade || "Job Grade"}
                                            value={employee.jobGrade || "N/A"}
                                        />
                                        <DetailCard
                                            icon={<Mail className="w-4 h-4" />}
                                            label={t.email || "Email"}
                                            value={employee.email || t.notProvided || "Not provided"}
                                        />
                                        <DetailCard
                                            icon={<Phone className="w-4 h-4" />}
                                            label={t.phone || "Phone"}
                                            value={employee.phone || t.notProvided || "Not provided"}
                                        />
                                        <DetailCard
                                            icon={<Calendar className="w-4 h-4" />}
                                            label={t.employmentDate || "Employment Date"}
                                            value={employee.employmentDate || t.notSpecified || "Not specified"}
                                        />
                                    </div>
                                </div>

                                {/* Verification Note */}
                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-white rounded-lg">
                                            <Shield className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-amber-800">{t.verificationRequired || "Verification Required"}</p>
                                            <p className="text-xs text-amber-700 mt-0.5">
                                                {t.verifyInfoBeforeApproval || "Please verify all employee information before approving. This action cannot be undone."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                                <Button variant="outline" onClick={handleBack} className="cursor-pointer">
                                    {t.cancel || "Cancel"}
                                </Button>
                                <Button onClick={handleReject} variant="destructive" className="cursor-pointer gap-2">
                                    <XCircle className="w-4 h-4" />
                                    {t.reject || "Reject"}
                                </Button>
                                <Button onClick={handleApprove} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 cursor-pointer gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    {t.approveEmployee || "Approve Employee"}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && employee && (
                <ReviewModal employee={employee} onClose={handleReviewClose} />
            )}
        </>
    );
};

// Detail Card Component
interface DetailCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all">
        <div className="p-2 bg-white rounded-lg shadow-sm">
            <div className="text-slate-400">{icon}</div>
        </div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-800">{value}</p>
        </div>
    </div>
);

export default PendingEmployeeDetail;