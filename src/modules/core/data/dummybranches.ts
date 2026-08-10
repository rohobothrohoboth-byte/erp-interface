export interface Branch {
  id: string;
  branchId: string;
  name: string;
  code: string;
  type: "Head Office" | "Regional" | "Local" | "Virtual";
  status: "active" | "inactive" | "under-construction";
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  manager: string;
  openingDate: string;
  totalEmployees: number;
  operatingHours: string;
  facilities: string[];
  services: string[];
  annualRevenue: number;
  currency: string;
  taxId: string;
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  }[];
  customerSatisfaction: number;
  lastAuditDate: string;
  auditScore: number;
  keyPerformanceIndicators: {
    name: string;
    target: string;
    actual: string;
    weight: number;
  }[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export const dummyBranches: Branch[] = [
  {
    id: "1",
    branchId: "BR-1001",
    name: "New York Headquarters",
    code: "NYHQ",
    type: "Head Office",
    status: "active",
    address: "123 Business Ave, Manhattan",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    phone: "+1 212-555-1001",
    email: "ny.hq@company.com",
    manager: "Sarah Johnson",
    openingDate: "2010-05-15",
    totalEmployees: 125,
    operatingHours: "Mon-Fri: 8:00 AM - 6:00 PM",
    facilities: ["Conference Rooms", "Cafeteria", "Gym", "Parking"],
    services: ["Customer Support", "Sales", "R&D", "Executive Offices"],
    annualRevenue: 12500000,
    currency: "USD",
    taxId: "US-123456789",
    bankAccounts: [
      {
        bankName: "Chase Bank",
        accountNumber: "9876543210",
        branchCode: "CHASUS33"
      }
    ],
    customerSatisfaction: 8.7,
    lastAuditDate: "2023-11-20",
    auditScore: 92,
    keyPerformanceIndicators: [
      {
        name: "Sales Growth",
        target: "15%",
        actual: "18%",
        weight: 30
      },
      {
        name: "Customer Retention",
        target: "85%",
        actual: "88%",
        weight: 25
      },
      {
        name: "Employee Satisfaction",
        target: "8.0",
        actual: "8.5",
        weight: 20
      }
    ],
    createdAt: "2010-05-15T00:00:00Z",
    updatedAt: "2023-11-21T08:30:00Z",
    updatedBy: "admin@company.com"
  },
  {
    id: "2",
    branchId: "BR-1002",
    name: "London Regional Office",
    code: "LONRO",
    type: "Regional",
    status: "active",
    address: "45 Business Park, Canary Wharf",
    city: "London",
    state: "",
    postalCode: "E14 5AB",
    country: "UK",
    phone: "+44 20 7946 0958",
    email: "london.office@company.com",
    manager: "David Wilson",
    openingDate: "2015-09-22",
    totalEmployees: 68,
    operatingHours: "Mon-Fri: 9:00 AM - 5:30 PM",
    facilities: ["Meeting Rooms", "Break Area", "Visitor Parking"],
    services: ["Sales", "Customer Support", "Marketing"],
    annualRevenue: 8500000,
    currency: "GBP",
    taxId: "GB-987654321",
    bankAccounts: [
      {
        bankName: "Barclays",
        accountNumber: "12345678",
        branchCode: "BARCGB22"
      }
    ],
    customerSatisfaction: 9.1,
    lastAuditDate: "2023-10-15",
    auditScore: 95,
    keyPerformanceIndicators: [
      {
        name: "Sales Growth",
        target: "12%",
        actual: "14%",
        weight: 30
      },
      {
        name: "Market Share",
        target: "22%",
        actual: "25%",
        weight: 25
      }
    ],
    createdAt: "2015-09-22T00:00:00Z",
    updatedAt: "2023-10-16T09:15:00Z",
    updatedBy: "admin@company.com"
  },
  {
    id: "3",
    branchId: "BR-1003",
    name: "Berlin Local Office",
    code: "BERLO",
    type: "Local",
    status: "active",
    address: "78 Friedrichstraße",
    city: "Berlin",
    state: "",
    postalCode: "10117",
    country: "Germany",
    phone: "+49 30 901820",
    email: "berlin.office@company.com",
    manager: "Anna Müller",
    openingDate: "2018-03-10",
    totalEmployees: 32,
    operatingHours: "Mon-Fri: 8:30 AM - 5:00 PM",
    facilities: ["Coffee Station", "Small Meeting Room"],
    services: ["Customer Support", "Local Sales"],
    annualRevenue: 4200000,
    currency: "EUR",
    taxId: "DE-567891234",
    bankAccounts: [
      {
        bankName: "Deutsche Bank",
        accountNumber: "87654321",
        branchCode: "DEUTDEBB"
      }
    ],
    customerSatisfaction: 8.9,
    lastAuditDate: "2023-09-05",
    auditScore: 89,
    keyPerformanceIndicators: [
      {
        name: "Customer Satisfaction",
        target: "8.5",
        actual: "8.9",
        weight: 40
      },
      {
        name: "Local Partnerships",
        target: "10",
        actual: "12",
        weight: 30
      }
    ],
    createdAt: "2018-03-10T00:00:00Z",
    updatedAt: "2023-09-06T10:45:00Z",
    updatedBy: "admin@company.com"
  },
  {
    id: "4",
    branchId: "BR-1004",
    name: "Virtual Support Center",
    code: "VIRT",
    type: "Virtual",
    status: "active",
    address: "Online",
    city: "Virtual",
    state: "",
    postalCode: "",
    country: "Global",
    phone: "+1 800-555-1004",
    email: "virtual.support@company.com",
    manager: "Michael Chen",
    openingDate: "2020-01-15",
    totalEmployees: 45,
    operatingHours: "24/7",
    facilities: [],
    services: ["Technical Support", "Online Sales", "Customer Service"],
    annualRevenue: 3800000,
    currency: "USD",
    taxId: "US-987654321",
    bankAccounts: [
      {
        bankName: "Bank of America",
        accountNumber: "5432167890",
        branchCode: "BOFAUS3N"
      }
    ],
    customerSatisfaction: 9.3,
    lastAuditDate: "2023-08-12",
    auditScore: 97,
    keyPerformanceIndicators: [
      {
        name: "Response Time",
        target: "<2h",
        actual: "1.5h",
        weight: 35
      },
      {
        name: "Resolution Rate",
        target: "90%",
        actual: "94%",
        weight: 35
      }
    ],
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: "2023-08-13T11:30:00Z",
    updatedBy: "admin@company.com"
  },
  {
    id: "5",
    branchId: "BR-1005",
    name: "Singapore Regional Office",
    code: "SGRO",
    type: "Regional",
    status: "under-construction",
    address: "1 Marina Boulevard",
    city: "Singapore",
    state: "",
    postalCode: "018989",
    country: "Singapore",
    phone: "+65 6123 4567",
    email: "singapore.office@company.com",
    manager: "Raj Patel",
    openingDate: "2023-06-01",
    totalEmployees: 15,
    operatingHours: "Mon-Fri: 9:00 AM - 6:00 PM",
    facilities: ["Construction in Progress"],
    services: ["Initial Setup"],
    annualRevenue: 1200000,
    currency: "SGD",
    taxId: "SG-123456789X",
    bankAccounts: [
      {
        bankName: "DBS Bank",
        accountNumber: "1234567890",
        branchCode: "DBSSSGSG"
      }
    ],
    customerSatisfaction: 0,
    lastAuditDate: "",
    auditScore: 0,
    keyPerformanceIndicators: [],
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2023-06-01T00:00:00Z",
    updatedBy: "admin@company.com"
  }
];