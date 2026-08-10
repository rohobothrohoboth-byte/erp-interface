// company.ts
export interface Department {
  id: number;
  name: string;
  type: 'operations' | 'finance' | 'hr' | 'it' | 'sales' | 'marketing';
  manager: string;
  employees: number;
  budget: string;
  lastActivity: string;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  location: string;
  status: 'active' | 'inactive' | 'setup';
  GeneralManager: string;
  users: number;
  established: string;
  lastActivity: string;
  departments: Department[];
}

export interface Company {
  id: number;
  name: string;
  branches: Branch[];
}

export const companies: Company[] = [
  {
    id: 1,
    name: 'BDA Investment Group',
    branches: [
      {
        id: 1,
        name: 'Headquarters',
        code: 'BDA-HQ-001',
        location: 'New York, USA',
        status: 'active',
        GeneralManager: 'Sarah Johnson',
        users: 45,
        established: 'Jan 15, 2015',
        lastActivity: 'Today, 10:45 AM',
        departments: [
          {
            id: 1,
            name: 'Investment Operations',
            type: 'operations',
            manager: 'Robert Taylor',
            employees: 12,
            budget: '$1.2M',
            lastActivity: 'Today, 9:30 AM'
          },
          {
            id: 2,
            name: 'Corporate Finance',
            type: 'finance',
            manager: 'Emily Chen',
            employees: 8,
            budget: '$850K',
            lastActivity: 'Today, 11:15 AM'
          },
          {
            id: 3,
            name: 'Human Resources',
            type: 'hr',
            manager: 'David Wilson',
            employees: 5,
            budget: '$500K',
            lastActivity: 'Yesterday, 3:45 PM'
          },
          {
            id: 4,
            name: 'IT Services',
            type: 'it',
            manager: 'Michael Brown',
            employees: 7,
            budget: '$1.1M',
            lastActivity: 'Today, 8:00 AM'
          }
        ]
      },
      {
        id: 2,
        name: 'London Office',
        code: 'BDA-LON-002',
        location: 'London, UK',
        status: 'active',
        GeneralManager: 'James Wilson',
        users: 32,
        established: 'Mar 22, 2017',
        lastActivity: 'Today, 9:30 AM',
        departments: [
          {
            id: 5,
            name: 'European Sales',
            type: 'sales',
            manager: 'Olivia Parker',
            employees: 10,
            budget: '$950K',
            lastActivity: 'Today, 9:00 AM'
          },
          {
            id: 6,
            name: 'Marketing',
            type: 'marketing',
            manager: 'Sophia Martinez',
            employees: 6,
            budget: '$750K',
            lastActivity: 'Yesterday, 5:30 PM'
          }
        ]
      },
      {
        id: 3,
        name: 'Singapore Branch',
        code: 'BDA-SIN-003',
        location: 'Singapore',
        status: 'active',
        GeneralManager: 'Raj Patel',
        users: 28,
        established: 'Aug 10, 2018',
        lastActivity: 'Today, 11:20 AM',
        departments: [
          {
            id: 7,
            name: 'Asia Operations',
            type: 'operations',
            manager: 'Wei Zhang',
            employees: 9,
            budget: '$1.1M',
            lastActivity: 'Today, 10:00 AM'
          },
          {
            id: 8,
            name: 'Regional Finance',
            type: 'finance',
            manager: 'Hiroshi Tanaka',
            employees: 5,
            budget: '$700K',
            lastActivity: 'Today, 8:45 AM'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'TechNova Solutions',
    branches: [
      {
        id: 4,
        name: 'TechNova HQ',
        code: 'TCH-HQ-001',
        location: 'San Francisco, USA',
        status: 'active',
        GeneralManager: 'Alex Turner',
        users: 68,
        established: 'Jun 5, 2012',
        lastActivity: 'Today, 11:45 AM',
        departments: [
          {
            id: 9,
            name: 'Software Development',
            type: 'it',
            manager: 'Jessica Lee',
            employees: 25,
            budget: '$3.5M',
            lastActivity: 'Today, 10:30 AM'
          },
          {
            id: 10,
            name: 'Product Management',
            type: 'operations',
            manager: 'Daniel Kim',
            employees: 12,
            budget: '$2.1M',
            lastActivity: 'Today, 9:15 AM'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Global Retail Corp',
    branches: [
      {
        id: 5,
        name: 'Flagship Store',
        code: 'GRC-NY-001',
        location: 'New York, USA',
        status: 'active',
        GeneralManager: 'Maria Garcia',
        users: 52,
        established: 'Apr 18, 2010',
        lastActivity: 'Today, 12:30 PM',
        departments: [
          {
            id: 11,
            name: 'Retail Operations',
            type: 'operations',
            manager: 'Thomas Wilson',
            employees: 30,
            budget: '$2.8M',
            lastActivity: 'Today, 11:00 AM'
          },
          {
            id: 12,
            name: 'Customer Service',
            type: 'operations',
            manager: 'Lisa Johnson',
            employees: 15,
            budget: '$1.2M',
            lastActivity: 'Today, 10:15 AM'
          }
        ]
      },
      {
        id: 6,
        name: 'Regional Distribution',
        code: 'GRC-NJ-002',
        location: 'New Jersey, USA',
        status: 'active',
        GeneralManager: 'Kevin Smith',
        users: 24,
        established: 'Nov 3, 2014',
        lastActivity: 'Today, 9:45 AM',
        departments: [
          {
            id: 13,
            name: 'Warehouse',
            type: 'operations',
            manager: 'Brian Adams',
            employees: 18,
            budget: '$1.5M',
            lastActivity: 'Today, 8:30 AM'
          },
          {
            id: 14,
            name: 'Logistics',
            type: 'operations',
            manager: 'Rachel Green',
            employees: 6,
            budget: '$900K',
            lastActivity: 'Yesterday, 6:00 PM'
          }
        ]
      }
    ]
  }
];