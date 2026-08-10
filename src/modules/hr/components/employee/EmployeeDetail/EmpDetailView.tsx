import React, { memo, useState, useCallback, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { EmpDetailHeader } from '@/modules/hr/components/employee/EmployeeDetail/EmpDetailHeader';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/shared/i18n/LanguageContext';

const OverviewTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/OverviewTab').then(m => ({ default: m.OverviewTab })));
const BasicInfoTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/BasicInfoTab').then(m => ({ default: m.BasicInfoTab })));
const BiographicalTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/BiographicalTab').then(m => ({ default: m.BiographicalTab })));
const EmergencyTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/EmergencyTab').then(m => ({ default: m.EmergencyTab })));
const FamilyTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/FamilyTab').then(m => ({ default: m.FamilyTab })));
const GuarantorTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/GuarantorTab').then(m => ({ default: m.GuarantorTab })));
const DocumentsTab = lazy(() => import('@/modules/hr/components/employee/EmployeeDetail/DocumentsTab').then(m => ({ default: m.DocumentsTab })));

const TAB_MAP: Record<string, React.ComponentType<{ employeeId: string }>> = {
    overview: OverviewTab, basic: BasicInfoTab, bio: BiographicalTab,
    emergency: EmergencyTab, family: FamilyTab, guarantor: GuarantorTab, documents: DocumentsTab,
};

const TabLoader = () => {
    const { t } = useLanguage();
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
};

export const EmpDetailView = memo(function EmpDetailView() {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const employeeId = id ?? '';
    const [activeTab, setActiveTab] = useState('overview');

    const handleTabChange = useCallback((tabId: string) => setActiveTab(tabId), []);

    const ActiveTab = TAB_MAP[activeTab] || OverviewTab;

    if (!employeeId) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{t.employeeNotFound || 'Employee Not Found'}</h2>
                    <p className="text-slate-500">{t.requestedEmployeeNotFound || 'The requested employee could not be found.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <EmpDetailHeader employeeId={employeeId} activeTab={activeTab} onTabChange={handleTabChange} />
            <div key={activeTab} className="mt-6">
                <Suspense fallback={<TabLoader />}>
                    <ActiveTab employeeId={employeeId} />
                </Suspense>
            </div>
        </div>
    );
});

export default EmpDetailView;