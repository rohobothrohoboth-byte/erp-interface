import { motion } from 'framer-motion';
import CompSection from '@/modules/core/components/company/CompSection';
import AllBranchs from '@/modules/core/components/company/AllBranches';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Building2, MapPin } from 'lucide-react';

const CompanyBranchesPage = () => {
  return (
      <div className="space-y-6">
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              All Branches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-6">
            <CompSection />
          </TabsContent>

          <TabsContent value="branches" className="mt-6">
            <AllBranchs />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default CompanyBranchesPage;