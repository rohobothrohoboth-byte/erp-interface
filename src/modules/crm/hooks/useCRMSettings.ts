import { useState, useEffect } from 'react';

// Simplified CRM Item interface
interface SimpleCRMItem {
  id: string;
  name: string;
  is_active: boolean;
  priority?: number; // Only for Lead Statuses
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Simplified CRM Settings interface
interface CRMSettings {
  leadSources: SimpleCRMItem[];
  leadStatuses: SimpleCRMItem[];
  leadQualificationStatuses: SimpleCRMItem[];
  leadCategories: SimpleCRMItem[];
  industries: SimpleCRMItem[];
  contactMethods: SimpleCRMItem[];
  activityTypes: SimpleCRMItem[];
  assignmentModes: SimpleCRMItem[];
  conversionTargets: SimpleCRMItem[];
}

// Mock CRM settings data - in production, this would come from API
// Initially empty arrays - admin needs to CRUD them
const mockCRMSettings: CRMSettings = {
  leadSources: [
    {
      id: '1',
      name: 'Website',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Email',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Social Media',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Phone',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '5',
      name: 'Referral',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '6',
      name: 'Event',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  leadStatuses: [
    {
      id: '1',
      name: 'New',
      is_active: true,
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Contacted',
      is_active: true,
      priority: 2,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Qualified',
      is_active: true,
      priority: 3,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Disqualified',
      is_active: true,
      priority: 4,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '5',
      name: 'Nurturing',
      is_active: true,
      priority: 5,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  leadQualificationStatuses: [
    {
      id: '1',
      name: 'Unqualified',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Marketing Qualified',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Sales Qualified',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  leadCategories: [
    {
      id: '1',
      name: 'Hot Lead',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Warm Lead',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Cold Lead',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  industries: [
    {
      id: '1',
      name: 'Technology',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Healthcare',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Finance',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Retail',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '5',
      name: 'Manufacturing',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  contactMethods: [
    {
      id: '1',
      name: 'Email',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Phone',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'LinkedIn',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Any',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  activityTypes: [
    {
      id: '1',
      name: 'Call',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Email',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Meeting',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Task',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '5',
      name: 'Note',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  assignmentModes: [
    {
      id: '1',
      name: 'Round Robin',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Manual',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Territory Based',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '4',
      name: 'Load Balancing',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ],
  conversionTargets: [
    {
      id: '1',
      name: 'Lead to Opportunity',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '2',
      name: 'Trial to Customer',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    },
    {
      id: '3',
      name: 'Prospect to Lead',
      is_active: true,
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'System'
    }
  ]
};

/**
 * Custom hook to manage CRM settings
 * Provides access to all CRM dropdown options and settings
 */
export function useCRMSettings() {
  const [settings, setSettings] = useState<CRMSettings>(mockCRMSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get active options only
  const getActiveOptions = (options: SimpleCRMItem[]): SimpleCRMItem[] => {
    return options
      .filter(option => option.is_active)
      .sort((a, b) => {
        // Sort by priority if available (for Lead Statuses), otherwise by name
        if (a.priority !== undefined && b.priority !== undefined) {
          return a.priority - b.priority;
        }
        return a.name.localeCompare(b.name);
      });
  };

  // Helper function to get option names for dropdowns
  const getOptionNames = (options: SimpleCRMItem[]): string[] => {
    return getActiveOptions(options).map(option => option.name);
  };

  // Helper function to get option by name
  const getOptionByName = (options: SimpleCRMItem[], name: string): SimpleCRMItem | undefined => {
    return options.find(option => option.name === name);
  };

  // Load settings from API (mock implementation)
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/crm/settings');
      // const data = await response.json();
      // setSettings(data);
      
      // For now, load from localStorage if available, otherwise use mock data
      const savedSettings = localStorage.getItem('crmSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        setSettings(mockCRMSettings);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CRM settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to API (mock implementation)
  const saveSettings = async (newSettings: Partial<CRMSettings>) => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/crm/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });
      
      // For now, just update local state and persist to localStorage for demo
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Persist to localStorage for demo purposes
      localStorage.setItem('crmSettings', JSON.stringify(updatedSettings));
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save CRM settings');
      throw err; // Re-throw to let the component handle the error
    } finally {
      setLoading(false);
    }
  };

  // Initialize settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    getActiveOptions,
    getOptionNames,
    getOptionByName,
    
    // Convenient getters for the 9 required CRM settings only
    leadSources: getActiveOptions(settings.leadSources),
    leadStatuses: getActiveOptions(settings.leadStatuses),
    leadQualificationStatuses: getActiveOptions(settings.leadQualificationStatuses),
    leadCategories: getActiveOptions(settings.leadCategories),
    industries: getActiveOptions(settings.industries),
    contactMethods: getActiveOptions(settings.contactMethods),
    activityTypes: getActiveOptions(settings.activityTypes),
    assignmentModes: getActiveOptions(settings.assignmentModes),
    conversionTargets: getActiveOptions(settings.conversionTargets),
    
    // Name arrays for backward compatibility
    leadSourceNames: getOptionNames(settings.leadSources),
    leadStatusNames: getOptionNames(settings.leadStatuses),
    leadQualificationStatusNames: getOptionNames(settings.leadQualificationStatuses),
    leadCategoryNames: getOptionNames(settings.leadCategories),
    industryNames: getOptionNames(settings.industries),
    contactMethodNames: getOptionNames(settings.contactMethods),
    activityTypeNames: getOptionNames(settings.activityTypes),
    assignmentModeNames: getOptionNames(settings.assignmentModes),
    conversionTargetNames: getOptionNames(settings.conversionTargets)
  };
}