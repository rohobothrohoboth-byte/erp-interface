// src/modules/core/api/publicCompany.api.ts
import axios from 'axios';

export interface PublicCompanyDto {
    name: string;
    nameAm: string;
    motto: string;
    logoUrl: string;
    stampUrl: string;
}

class PublicCompanyApi {
    // ✅ Go through the gateway
    private baseUrl = import.meta.env.VITE_GATEWAY_URL || 'http://192.168.1.2:5000';

    async getPublicCompanyInfo(): Promise<PublicCompanyDto> {
        try {
            // Gateway should route /api/public/company/info to the correct backend
            const response = await axios.get(`${this.baseUrl}/api/public/company/info`);

            // Handle the response
            const data = response.data?.data || response.data;

            if (data && data.name) {
                return {
                    name: data.name || 'RST ERP',
                    nameAm: data.nameAm || '',
                    motto: data.motto || 'Enterprise Solution',
                    logoUrl: data.logoUrl || '',
                    stampUrl: data.stampUrl || ''
                };
            }

            return this.getDefaultCompany();
        } catch (error) {
            console.error('Error fetching public company info:', error);
            return this.getDefaultCompany();
        }
    }

    private getDefaultCompany(): PublicCompanyDto {
        return {
            name: 'RST ERP',
            nameAm: '',
            motto: 'Enterprise Solution',
            logoUrl: '',
            stampUrl: ''
        };
    }
}

export const publicCompanyApi = new PublicCompanyApi();