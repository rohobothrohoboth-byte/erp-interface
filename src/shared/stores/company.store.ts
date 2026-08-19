// src/shared/stores/company.store.ts
import { create } from 'zustand';
import { publicCompanyApi, type PublicCompanyDto } from '@/modules/core/services/company/publicCompany.api';
import { companyApi } from '@/modules/core/services/company/company.api';
import type { CompListDto } from '@/modules/core/types/comp';



interface CompanyStore {
    company: (CompListDto & { motto?: string }) | null;
    isLoading: boolean;
    error: string | null;
    fetchPublicCompany: () => Promise<void>;
    fetchCompany: () => Promise<void>;
    setCompany: (company: CompListDto) => void;
    clearCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
    company: null,
    isLoading: false,
    error: null,

    fetchPublicCompany: async () => {
        set({ isLoading: true, error: null });
        try {
            const publicData = await publicCompanyApi.getPublicCompanyInfo();

            // ✅ Convert to company format
            const company: CompListDto & { motto?: string } = {
                id: 'public',
                name: publicData.name || 'RST ERP',
                nameAm: publicData.nameAm || '',
                branchCount: '0',
                taxId: '',
                phone: '',
                email: '',
                address: '',
                website: '',
                logoUrl: publicData.logoUrl || '',
                stampUrl: publicData.stampUrl || '',
                motto: publicData.motto || 'Enterprise Solution',
                mission: '',
                vision: '',
                values: '',
                structure: '',
                rowVersion: '',
            };

            set({ company, isLoading: false });
        } catch (error) {
            console.error('Error in fetchPublicCompany:', error);
            // Set default company on error
            set({
                company: {
                    id: 'default',
                    name: 'RST ERP',
                    nameAm: '',
                    branchCount: '0',
                    logoUrl: '',
                    stampUrl: '',
                    motto: 'Enterprise Solution',
                    mission: '',
                    vision: '',
                    values: '',
                    structure: '',
                    rowVersion: '',
                },
                isLoading: false
            });
        }
    },

    fetchCompany: async () => {
        set({ isLoading: true, error: null });
        try {
            const companies = await companyApi.getAllCompanies();
            if (companies && companies.length > 0) {
                const company = companies[0];
                set({ company, isLoading: false });
            } else {
                set({ error: 'No company found', isLoading: false });
            }
        } catch (error) {
            set({
                error: (error as Error).message || 'Failed to fetch company',
                isLoading: false
            });
        }
    },

    setCompany: (company) => set({ company }),
    clearCompany: () => set({ company: null, error: null }),
}));