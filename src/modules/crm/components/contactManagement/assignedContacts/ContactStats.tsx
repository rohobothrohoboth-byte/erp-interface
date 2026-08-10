import { motion } from 'framer-motion';
import { Users, UserCheck, UserPlus, Building, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Contact } from '@/modules/crm/types/crm';

interface ContactStatsProps {
  contacts: Contact[];
}

export default function ContactStats({ contacts }: ContactStatsProps) {
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter(c => c.isActive).length;
  const newThisMonth = contacts.filter(c => {
    const contactDate = new Date(c.createdAt);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return contactDate >= monthStart;
  }).length;
  
  const leadContacts = contacts.filter(c => c.stage === 'Lead').length;
  const prospectContacts = contacts.filter(c => c.stage === 'Prospect').length;
  const customerContacts = contacts.filter(c => c.stage === 'Customer').length;
  
  const uniqueCompanies = new Set(contacts.map(c => c.company)).size;

  const stats = [
    {
      title: 'Total Contacts',
      value: totalContacts,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Contacts',
      value: activeContacts,
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'New This Month',
      value: newThisMonth,
      change: '+24%',
      trend: 'up',
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Companies',
      value: uniqueCompanies,
      change: '+5%',
      trend: 'up',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const stageStats = [
    { stage: 'Leads', count: leadContacts, color: 'bg-blue-500' },
    { stage: 'Prospects', count: prospectContacts, color: 'bg-yellow-500' },
    { stage: 'Customers', count: customerContacts, color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <TrendIcon className={`w-4 h-4 mr-1 ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stage Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact Lifecycle Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageStats.map((stage, index) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <span className="font-medium text-gray-900">{stage.stage}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{stage.count} contacts</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${stage.color}`}
                        style={{ width: `${totalContacts > 0 ? (stage.count / totalContacts) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {totalContacts > 0 ? Math.round((stage.count / totalContacts) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}