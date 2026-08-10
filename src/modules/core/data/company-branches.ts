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

export interface Company {
  id: number;
  name: string;
  nameAm: string;
  industry: string;
  foundedYear: number;
  headquarters: string;
  website: string;
  email: string;
  phone: string;
  taxId: string;
  totalEmployees: number;
  totalBranches: number;
  annualRevenue: number;
  currency: string;
  description: string;
  descriptionAm: string;
  status: "active" | "inactive" | "expanding";
  companyValues: string[];
  keyProducts: string[];
  socialMedia: {
    platform: string;
    url: string;
  }[];
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    currency: string;
  }[];
  branches: Branch[];
  createdAt: string;
  updatedAt: string;
}

export const companies: Company[] = [
  {
    id: 1,
    name: 'Rohobot Tech',
    nameAm: 'ሮሆቦት ቴክ',
    industry: 'Information Technology',
    foundedYear: 2015,
    headquarters: 'Addis Ababa, Ethiopia',
    website: 'https://rohobot.tech',
    email: 'info@rohobot.tech',
    phone: '+251 911 123 456',
    taxId: 'ET-1234567890',
    totalEmployees: 342,
    totalBranches: 5,
    annualRevenue: 25000000,
    currency: 'ETB',
    description: 'Leading technology solutions provider specializing in software development, cloud services, and digital transformation.',
    descriptionAm: 'የቴክኖሎጂ መፍትሄዎች አቅራቢ ድርጅት፣ በሶፍትዌር ልማት፣ ደመና አገልግሎቶች እና ዲጂታል ለውጥ ላይ ተለይቶ የሚታወቅ።',
    status: "active",
    companyValues: [
      "Innovation",
      "Customer Focus",
      "Integrity",
      "Excellence",
      "Collaboration"
    ],
    keyProducts: [
      "Enterprise Software Solutions",
      "Mobile Applications",
      "AI & Machine Learning",
      "Cloud Infrastructure"
    ],
    socialMedia: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/rohobot-tech"
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/rohobot_tech"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/rohobot.tech"
      }
    ],
    bankAccounts: [
      {
        bankName: "Commercial Bank of Ethiopia",
        accountNumber: "1000234567890",
        branchCode: "0134",
        currency: "ETB"
      },
      {
        bankName: "Awash Bank",
        accountNumber: "0134567890123",
        branchCode: "0245",
        currency: "USD"
      }
    ],
    branches: [
      {
        id: "1",
        branchId: "RT-AA-001",
        name: "Rohobot Tech Headquarters",
        code: "AAHQ",
        type: "Head Office",
        status: "active",
        address: "Bole Road, Friendship Building 4th Floor",
        city: "Addis Ababa",
        state: "Addis Ababa",
        postalCode: "1000",
        country: "Ethiopia",
        phone: "+251 115 671 234",
        email: "hq@rohobot.tech",
        manager: "Daniel Mekonnen",
        openingDate: "2015-06-15",
        totalEmployees: 150,
        operatingHours: "Mon-Fri: 8:30 AM - 5:30 PM",
        facilities: [
          "Research Lab",
          "Training Center",
          "Cafeteria",
          "Conference Rooms"
        ],
        services: [
          "Software Development",
          "Customer Support",
          "Training",
          "Executive Offices"
        ],
        annualRevenue: 15000000,
        currency: "ETB",
        taxId: "ET-AA-1234567890",
        bankAccounts: [
          {
            bankName: "Commercial Bank of Ethiopia",
            accountNumber: "1000234567890",
            branchCode: "0134"
          }
        ],
        customerSatisfaction: 9.2,
        lastAuditDate: "2023-10-15",
        auditScore: 94,
        keyPerformanceIndicators: [
          {
            name: "Project Delivery Time",
            target: "On schedule",
            actual: "95% on time",
            weight: 40
          },
          {
            name: "Client Retention",
            target: "90%",
            actual: "93%",
            weight: 30
          }
        ],
        createdAt: "2015-06-15T00:00:00Z",
        updatedAt: "2023-10-16T09:30:00Z",
        updatedBy: "admin@rohobot.tech"
      },
      {
        id: "2",
        branchId: "RT-DB-002",
        name: "Rohobot Tech Bahir Dar Branch",
        code: "DBRD",
        type: "Regional",
        status: "active",
        address: "Giorgis Road, Lakeview Plaza 2nd Floor",
        city: "Bahir Dar",
        state: "Amhara",
        postalCode: "1001",
        country: "Ethiopia",
        phone: "+251 582 123 456",
        email: "bahirdar@rohobot.tech",
        manager: "Alemayehu Kassahun",
        openingDate: "2018-03-10",
        totalEmployees: 45,
        operatingHours: "Mon-Fri: 8:30 AM - 5:30 PM, Sat: 9:00 AM - 1:00 PM",
        facilities: [
          "Training Room",
          "Customer Support Center"
        ],
        services: [
          "Regional Support",
          "Sales",
          "Training"
        ],
        annualRevenue: 3500000,
        currency: "ETB",
        taxId: "ET-AM-9876543210",
        bankAccounts: [
          {
            bankName: "Dashen Bank",
            accountNumber: "1234567890123",
            branchCode: "DBBD001"
          }
        ],
        customerSatisfaction: 8.8,
        lastAuditDate: "2023-09-05",
        auditScore: 89,
        keyPerformanceIndicators: [
          {
            name: "Regional Market Share",
            target: "65%",
            actual: "68%",
            weight: 40
          },
          {
            name: "Training Satisfaction",
            target: "8.5",
            actual: "8.9",
            weight: 30
          }
        ],
        createdAt: "2018-03-10T00:00:00Z",
        updatedAt: "2023-09-06T10:15:00Z",
        updatedBy: "admin@rohobot.tech"
      }
    ],
    createdAt: "2015-06-15T00:00:00Z",
    updatedAt: "2023-11-15T14:30:00Z"
  },
  {
    id: 2,
    name: 'Rohobot Group',
    nameAm: 'ሮሆቦት ግሩፕ',
    industry: 'Conglomerate',
    foundedYear: 2010,
    headquarters: 'Addis Ababa, Ethiopia',
    website: 'https://rohobotgroup.com',
    email: 'contact@rohobotgroup.com',
    phone: '+251 911 987 654',
    taxId: 'ET-9876543210',
    totalEmployees: 1250,
    totalBranches: 12,
    annualRevenue: 850000000,
    currency: 'ETB',
    description: 'Diversified conglomerate with interests in construction, manufacturing, import/export, and hospitality sectors.',
    descriptionAm: 'በግንባታ፣ ኢንዱስትሪ፣ ኢምፖርት/ኤክስፖርት እና ሆስፒታሊቲ ዘርፎች የሚሰራ የተለያዩ ንግዶች ያሉት ድርጅት።',
    status: "active",
    companyValues: [
      "Quality",
      "Diversity",
      "Sustainability",
      "Community Impact"
    ],
    keyProducts: [
      "Construction Services",
      "Building Materials",
      "Agricultural Products",
      "Hospitality Services"
    ],
    socialMedia: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/rohobot-group"
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/rohobotgroup"
      }
    ],
    bankAccounts: [
      {
        bankName: "Commercial Bank of Ethiopia",
        accountNumber: "1000987654321",
        branchCode: "0134",
        currency: "ETB"
      },
      {
        bankName: "Abyssinia Bank",
        accountNumber: "9876543210123",
        branchCode: "0456",
        currency: "USD"
      }
    ],
    branches: [
      {
        id: "1",
        branchId: "RG-AA-001",
        name: "Rohobot Group Headquarters",
        code: "AAHQ",
        type: "Head Office",
        status: "active",
        address: "Mexico Square, Rohobot Tower 10th Floor",
        city: "Addis Ababa",
        state: "Addis Ababa",
        postalCode: "1000",
        country: "Ethiopia",
        phone: "+251 115 543 210",
        email: "hq@rohobotgroup.com",
        manager: "Samuel Getachew",
        openingDate: "2010-01-20",
        totalEmployees: 300,
        operatingHours: "Mon-Fri: 8:00 AM - 6:00 PM",
        facilities: [
          "Executive Offices",
          "Conference Center",
          "Staff Cafeteria",
          "Fitness Center"
        ],
        services: [
          "Corporate Management",
          "Strategic Planning",
          "Investor Relations"
        ],
        annualRevenue: 350000000,
        currency: "ETB",
        taxId: "ET-AA-9876543210",
        bankAccounts: [
          {
            bankName: "Commercial Bank of Ethiopia",
            accountNumber: "1000987654321",
            branchCode: "0134"
          }
        ],
        customerSatisfaction: 8.5,
        lastAuditDate: "2023-11-10",
        auditScore: 91,
        keyPerformanceIndicators: [
          {
            name: "Group Revenue Growth",
            target: "12%",
            actual: "14%",
            weight: 40
          },
          {
            name: "Operational Efficiency",
            target: "15% improvement",
            actual: "18% improvement",
            weight: 30
          }
        ],
        createdAt: "2010-01-20T00:00:00Z",
        updatedAt: "2023-11-11T10:45:00Z",
        updatedBy: "admin@rohobotgroup.com"
      },
      {
        id: "2",
        branchId: "RG-DW-002",
        name: "Rohobot Construction Dire Dawa",
        code: "DWCN",
        type: "Regional",
        status: "active",
        address: "Industrial Zone, Block C",
        city: "Dire Dawa",
        state: "Dire Dawa",
        postalCode: "3000",
        country: "Ethiopia",
        phone: "+251 251 112 233",
        email: "diredawa@rohobotgroup.com",
        manager: "Hassan Mohammed",
        openingDate: "2017-08-15",
        totalEmployees: 120,
        operatingHours: "Mon-Sat: 7:30 AM - 5:30 PM",
        facilities: [
          "Construction Yard",
          "Material Storage",
          "Equipment Maintenance"
        ],
        services: [
          "Construction Services",
          "Material Supply",
          "Project Management"
        ],
        annualRevenue: 125000000,
        currency: "ETB",
        taxId: "ET-DD-4567890123",
        bankAccounts: [
          {
            bankName: "Oromia Bank",
            accountNumber: "4567890123456",
            branchCode: "ORDD001"
          }
        ],
        customerSatisfaction: 8.2,
        lastAuditDate: "2023-09-20",
        auditScore: 87,
        keyPerformanceIndicators: [
          {
            name: "Project Completion Rate",
            target: "On schedule",
            actual: "90% on time",
            weight: 50
          },
          {
            name: "Safety Incidents",
            target: "<5/year",
            actual: "3",
            weight: 30
          }
        ],
        createdAt: "2017-08-15T00:00:00Z",
        updatedAt: "2023-09-21T11:30:00Z",
        updatedBy: "admin@rohobotgroup.com"
      }
    ],
    createdAt: "2010-01-20T00:00:00Z",
    updatedAt: "2023-11-15T15:45:00Z"
  },
  {
    id: 3,
    name: 'EthioDev',
    nameAm: 'ኢትዮዴቭ',
    industry: 'Software Development',
    foundedYear: 2018,
    headquarters: 'Addis Ababa, Ethiopia',
    website: 'https://ethiodev.com',
    email: 'hello@ethiodev.com',
    phone: '+251 911 456 789',
    taxId: 'ET-5678912345',
    totalEmployees: 85,
    totalBranches: 3,
    annualRevenue: 18000000,
    currency: 'ETB',
    description: 'Innovative software development company focused on creating localized solutions for Ethiopian businesses.',
    descriptionAm: 'ለኢትዮጵያዊ ንግዶች የተለየ የሶፍትዌር መፍትሄዎችን የሚያዘጋጅ ፈጣሪ የሶፍትዌር ኩባንያ።',
    status: "expanding",
    companyValues: [
      "Innovation",
      "Local Focus",
      "Quality",
      "Agility"
    ],
    keyProducts: [
      "Business Management Software",
      "Mobile Banking Solutions",
      "ERP Systems",
      "Custom Software Development"
    ],
    socialMedia: [
      {
        platform: "Twitter",
        url: "https://twitter.com/ethiodev"
      },
      {
        platform: "GitHub",
        url: "https://github.com/ethiodev"
      }
    ],
    bankAccounts: [
      {
        bankName: "Awash Bank",
        accountNumber: "0134567890123",
        branchCode: "0245",
        currency: "ETB"
      }
    ],
    branches: [
      {
        id: "1",
        branchId: "ED-AA-001",
        name: "EthioDev Main Office",
        code: "AAMO",
        type: "Head Office",
        status: "active",
        address: "Kazanchis, Abyssinia Plaza 5th Floor",
        city: "Addis Ababa",
        state: "Addis Ababa",
        postalCode: "1000",
        country: "Ethiopia",
        phone: "+251 115 678 901",
        email: "info@ethiodev.com",
        manager: "Tigist Alemayehu",
        openingDate: "2018-05-10",
        totalEmployees: 65,
        operatingHours: "Mon-Fri: 8:30 AM - 5:30 PM",
        facilities: [
          "Development Labs",
          "Meeting Rooms",
          "Breakout Areas"
        ],
        services: [
          "Software Development",
          "Client Consultations",
          "Technical Support"
        ],
        annualRevenue: 15000000,
        currency: "ETB",
        taxId: "ET-AA-5678912345",
        bankAccounts: [
          {
            bankName: "Awash Bank",
            accountNumber: "0134567890123",
            branchCode: "0245"
          }
        ],
        customerSatisfaction: 9.4,
        lastAuditDate: "2023-08-25",
        auditScore: 96,
        keyPerformanceIndicators: [
          {
            name: "Project Delivery",
            target: "95% on time",
            actual: "97%",
            weight: 50
          },
          {
            name: "Client Satisfaction",
            target: "9.0",
            actual: "9.4",
            weight: 40
          }
        ],
        createdAt: "2018-05-10T00:00:00Z",
        updatedAt: "2023-08-26T09:15:00Z",
        updatedBy: "admin@ethiodev.com"
      },
      {
        id: "2",
        branchId: "ED-MK-002",
        name: "EthioDev Mekelle Branch",
        code: "MKBR",
        type: "Local",
        status: "active",
        address: "Hawelti, Axumite Building 3rd Floor",
        city: "Mekelle",
        state: "Tigray",
        postalCode: "2000",
        country: "Ethiopia",
        phone: "+251 344 405 060",
        email: "mekelle@ethiodev.com",
        manager: "Yohannes Gebre",
        openingDate: "2021-11-15",
        totalEmployees: 12,
        operatingHours: "Mon-Fri: 8:30 AM - 5:00 PM",
        facilities: [
          "Client Meeting Room",
          "Small Development Team"
        ],
        services: [
          "Regional Support",
          "Implementation Services",
          "Training"
        ],
        annualRevenue: 2000000,
        currency: "ETB",
        taxId: "ET-TI-3456789012",
        bankAccounts: [
          {
            bankName: "Wegagen Bank",
            accountNumber: "7890123456789",
            branchCode: "WBMK001"
          }
        ],
        customerSatisfaction: 9.1,
        lastAuditDate: "2023-07-10",
        auditScore: 92,
        keyPerformanceIndicators: [
          {
            name: "Regional Client Acquisition",
            target: "15/year",
            actual: "18",
            weight: 40
          },
          {
            name: "Support Response Time",
            target: "<4h",
            actual: "2.5h",
            weight: 30
          }
        ],
        createdAt: "2021-11-15T00:00:00Z",
        updatedAt: "2023-07-11T10:30:00Z",
        updatedBy: "admin@ethiodev.com"
      }
    ],
    createdAt: "2018-05-10T00:00:00Z",
    updatedAt: "2023-11-15T16:20:00Z"
  }
];

export interface CompanyTableProps {
  companies: Company[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onCompanyUpdate: (updatedCompany: Company) => void;
  onCompanyStatusChange: (companyId: number, newStatus: "active" | "inactive" | "expanding") => void;
  onCompanyDelete: (companyId: number) => void;
}