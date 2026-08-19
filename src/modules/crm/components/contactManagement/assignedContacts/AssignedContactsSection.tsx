import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockContacts } from '@/modules/crm/data/crmMockData';
import AssignedContactsHeader from '@/modules/crm/components/contactManagement/assignedContacts/AssignedContactsHeader';
import AssignedContactsSearchFilter from '@/modules/crm/components/contactManagement/assignedContacts/AssignedContactsSearchFilter';
import ContactList from '@/modules/crm/components/contactManagement/assignedContacts/ContactList';
import type { Contact } from '@/modules/crm/types/crm';

interface FilterState {
  searchTerm: string;
  stage: string;
  company: string;
  tags: string[];
  isActive: string;
  owner: string;
  dateRange: string;
}

export default function AssignedContactsSection() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    stage: 'all',
    company: 'all',
    tags: [],
    isActive: 'all',
    owner: 'all',
    dateRange: 'all'
  });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => {
    const loadContacts = () => {
      const storedContacts = localStorage.getItem('contacts');
      if (storedContacts) {
        try {
          const parsedContacts = JSON.parse(storedContacts);
          // Filter only assigned contacts (in real app, filter by current user)
          const assignedContacts = parsedContacts.filter((c: Contact) => c.owner);
          setContacts(assignedContacts);
        } catch (error) {
          console.error('Error loading contacts:', error);
          const assignedContacts = mockContacts.filter(c => c.owner);
          setContacts(assignedContacts);
        }
      } else {
        const assignedContacts = mockContacts.filter(c => c.owner);
        setContacts(assignedContacts);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedContacts = localStorage.getItem('contacts');
      if (storedContacts) {
        try {
          const parsedContacts = JSON.parse(storedContacts);
          const assignedContacts = parsedContacts.filter((c: Contact) => c.owner);
          setContacts(assignedContacts);
        } catch (error) {
          console.error('Error loading contacts:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contactsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contactsUpdated', handleStorageChange);
    };
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStage = filters.stage === 'all' || contact.stage === filters.stage;
    const matchesCompany = filters.company === 'all' || contact.company === filters.company;
    const matchesActive = filters.isActive === 'all' || 
      (filters.isActive === 'active' ? contact.isActive : !contact.isActive);
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => contact.tags.includes(tag));
    
    return matchesSearch && matchesStage && matchesCompany && matchesActive && matchesTags;
  });

  const handleDeleteContact = () => {
    // No delete functionality for assigned contacts
  };

  const handleBulkAction = () => {
    // No bulk actions for assigned contacts
  };

  const handleSelectContact = (contactId: string, selected: boolean) => {
    if (selected) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      stage: 'all',
      company: 'all',
      tags: [],
      isActive: 'all',
      owner: 'all',
      dateRange: 'all'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AssignedContactsHeader />

      <AssignedContactsSearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <ContactList
        contacts={filteredContacts}
        onDelete={handleDeleteContact}
        onBulkAction={handleBulkAction}
        selectedContacts={selectedContacts}
        onSelectContact={handleSelectContact}
        onSelectAll={handleSelectAll}
      />
    </motion.div>
  );
}
