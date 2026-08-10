// src/components/crm/ContactOverview.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useCrmData } from '@/modules/crm/hooks/useCrmData';

export default function ContactOverview() {
  const { customers, loading } = useCrmData();

  if (loading) {
    return (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
    );
  }

  const recentContacts = customers?.slice(0, 5) || [];

  return (
      <Card className="border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-blue-100 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Overview
            </CardTitle>
            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
              {customers?.length || 0} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">Companies</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {customers?.filter((c: any) => c.type === 'Company' || c.isCompany).length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300">Individuals</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">
                {customers?.filter((c: any) => c.type === 'Individual' || !c.isCompany).length || 0}
              </p>
            </div>
          </div>

          {/* Recent Contacts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Contacts</p>
            {recentContacts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No contacts yet</p>
            ) : (
                recentContacts.map((contact: any, index: number) => (
                    <motion.div
                        key={contact.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                          {contact.name?.charAt(0) || contact.firstName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {contact.name || contact.fullName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.companyName || contact.company || 'No company'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {contact.email && <Mail className="h-3 w-3 text-gray-400" />}
                        {contact.phone && <Phone className="h-3 w-3 text-gray-400" />}
                      </div>
                    </motion.div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
  );
}