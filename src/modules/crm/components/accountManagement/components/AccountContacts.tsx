import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Mail, Phone, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface AccountContactsProps {
  accountId: string;
}

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@innovationlabs.com',
    phone: '+1-555-0201',
    jobTitle: 'CEO',
    isPrimary: true,
    stage: 'Customer',
    relationshipScore: 85
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@innovationlabs.com',
    phone: '+1-555-0202',
    jobTitle: 'CTO',
    isPrimary: false,
    stage: 'Customer',
    relationshipScore: 72
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@innovationlabs.com',
    phone: '+1-555-0203',
    jobTitle: 'VP of Sales',
    isPrimary: false,
    stage: 'Customer',
    relationshipScore: 68
  }
];

export default function AccountContacts({ accountId }: AccountContactsProps) {
  const navigate = useNavigate();
  const [contacts] = useState(mockContacts);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-blue-100 text-blue-800';
      case 'Prospect': return 'bg-yellow-100 text-yellow-800';
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account Contacts</h3>
          <p className="text-sm text-gray-600">Manage contacts associated with this account</p>
        </div>
        <Button 
          onClick={() => navigate(`/crm/contacts/add?accountId=${accountId}`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/crm/contacts/${contact.id}`)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.jobTitle}</p>
                    </div>
                  </div>
                  {contact.isPrimary && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-yellow-600 font-medium">Primary</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStageColor(contact.stage)}>
                    {contact.stage}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${contact.relationshipScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {contact.relationshipScore}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
              <p className="text-gray-500 mb-4">Start by adding contacts to this account.</p>
              <Button 
                onClick={() => navigate(`/crm/contacts/add?accountId=${accountId}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}