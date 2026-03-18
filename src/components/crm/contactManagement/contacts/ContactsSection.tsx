import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../../layout/layout';
import { mockContacts } from '../../../../data/crmMockData';
import ContactList from './ContactList';
import ContactFilters from './ContactFilters';
import type { Contact } from '../../../../types/crm';

interface FilterState {
  searchTerm: string;
  stage: string;
  company: string;
  tags: string[];
  isActive: string;
  owner: string;
  dateRange: string;
}

export default function ContactsSection() {
  const navigate = useNavigate();
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
          setContacts(parsedContacts);
        } catch (error) {
          console.error('Error loading contacts from localStorage:', error);
          setContacts(mockContacts);
        }
      } else {
        setContacts(mockContacts);
        localStorage.setItem('contacts', JSON.stringify(mockContacts));
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
          setContacts(parsedContacts);
        } catch (error) {
          console.error('Error loading contacts after storage change:', error);
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
      contact.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      contact.jobTitle.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStage = filters.stage === 'all' || contact.stage === filters.stage;
    const matchesCompany = filters.company === 'all' || contact.company === filters.company;
    const matchesActive = filters.isActive === 'all' || 
      (filters.isActive === 'active' ? contact.isActive : !contact.isActive);
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.some(tag => contact.tags.includes(tag));
    
    const matchesDate = filters.dateRange === 'all' || (() => {
      const contactDate = new Date(contact.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          return contactDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return contactDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          return contactDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
          return contactDate >= quarterAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStage && matchesCompany && matchesActive && matchesTags && matchesDate;
  });

  const handleDeleteContact = (contactId: string) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, isActive: false, updatedAt: new Date().toISOString() }
        : contact
    );
    setContacts(updatedContacts);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    showToast.success('Contact archived successfully');
  };

  const handleBulkAction = (action: string, contactIds: string[]) => {
    switch (action) {
      case 'delete':
        const updatedContacts = contacts.map(contact => 
          contactIds.includes(contact.id) 
            ? { ...contact, isActive: false, updatedAt: new Date().toISOString() }
            : contact
        );
        setContacts(updatedContacts);
        localStorage.setItem('contacts', JSON.stringify(updatedContacts));
        setSelectedContacts([]);
        showToast.success(`${contactIds.length} contact(s) archived successfully`);
        break;
      case 'stage-prospect':
      case 'stage-customer':
        const newStage = action.replace('stage-', '') as Contact['stage'];
        const stageUpdatedContacts = contacts.map(contact => 
          contactIds.includes(contact.id) 
            ? { ...contact, stage: newStage, updatedAt: new Date().toISOString() }
            : contact
        );
        setContacts(stageUpdatedContacts);
        localStorage.setItem('contacts', JSON.stringify(stageUpdatedContacts));
        setSelectedContacts([]);
        showToast.success(`${contactIds.length} contact(s) moved to ${newStage} stage`);
        break;
      case 'export':
        showToast.success('Export functionality will be implemented');
        break;
    }
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
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent text-2xl font-bold">
          Contacts
        </h1>
      </motion.div>

      <ContactFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        totalCount={contacts.length}
        filteredCount={filteredContacts.length}
        onAddClick={() => navigate('/crm/contacts/add')}
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
