import type { Lead, Contact, Opportunity, Campaign, SupportTicket, Activity, CRMAnalytics } from '@/modules/crm/types/crm';

// Mock Data for CRM Module

export const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1-555-0123',
    company: 'TechCorp Solutions',
    jobTitle: 'IT Director',
    source: 'Website',
    status: 'New',
    score: 85,
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    notes: 'Interested in enterprise software solutions',
    budget: 50000,
    timeline: 'Q2 2024',
    industry: 'Technology',
    // Enhanced fields for comprehensive lead management
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    website: 'https://techcorp.com',
    companySize: '201-500',
    annualRevenue: 5000000,
    leadQuality: 'Hot',
    authority: 'Decision Maker',
    need: 'High',
    urgency: 'This Quarter',
    tags: ['Enterprise', 'High Value', 'Technology'],
    customFields: {
      preferredImplementationDate: '2024-04-01',
      currentSoftware: 'Legacy ERP System',
      decisionTimeframe: '3 months'
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/in/johnsmith-tech',
      twitter: '@johnsmith_tech'
    },
    lastContactDate: '2024-01-18T14:30:00Z',
    nextFollowUpDate: '2024-01-22T10:00:00Z',
    leadOwnerHistory: [
      {
        id: '1',
        previousOwner: 'Auto Assignment',
        newOwner: 'Sarah Johnson',
        changedBy: 'System',
        changedAt: '2024-01-15T10:30:00Z',
        reason: 'Territory-based assignment'
      }
    ],
    campaignId: '1',
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'enterprise-software',
      term: 'erp-solution',
      content: 'ad-variant-a'
    },
    ipAddress: '192.168.1.100',
    referralSource: 'Google Ads',
    leadMagnet: 'ERP Buyer\'s Guide',
    unsubscribed: false,
    doNotCall: false,
    doNotEmail: false,
    gdprConsent: true,
    lastActivityDate: '2024-01-18T14:30:00Z',
    totalActivities: 8,
    emailsSent: 3,
    emailsOpened: 2,
    emailsClicked: 1,
    callsAttempted: 2,
    callsConnected: 1,
    meetingsScheduled: 1,
    meetingsAttended: 1,
    proposalsSent: 0,
    quotesRequested: 1,
    demoRequested: true,
    trialRequested: false,
    pricingRequested: true,
    competitorMentioned: ['SAP', 'Oracle'],
    painPoints: ['Manual processes', 'Data silos', 'Reporting challenges'],
    interests: ['Cloud deployment', 'Mobile access', 'API integration'],
    productInterest: ['ERP Core', 'CRM Module', 'Analytics'],
    marketingQualified: true,
    salesQualified: false,
    qualificationDate: '2024-01-16T09:00:00Z',
    leadTemperature: 85,
    engagementScore: 78,
    responseTime: 2.5,
    averageEmailResponseTime: 4.2,
    preferredContactMethod: 'Email',
    timezone: 'America/Los_Angeles',
    bestTimeToContact: '9:00 AM - 5:00 PM PST',
    language: 'English',
    currency: 'USD',
    leadValue: 75000,
    probabilityToClose: 65,
    expectedCloseDate: '2024-03-15',
    salesCycleStage: 3,
    touchpointsCount: 12,
    lastTouchpointType: 'Email',
    lastTouchpointDate: '2024-01-18T14:30:00Z',
    nurturingCampaignId: 'nurture_enterprise_1',
    leadMagnetDownloads: ['ERP Buyer\'s Guide', 'ROI Calculator'],
    webinarAttendance: ['Enterprise Software Trends 2024'],
    eventAttendance: ['TechCorp Solutions Expo'],
    contentEngagement: [
      {
        id: '1',
        contentType: 'Whitepaper',
        contentTitle: 'Digital Transformation Guide',
        contentUrl: 'https://example.com/whitepaper',
        engagementType: 'Download',
        engagementDate: '2024-01-10T09:00:00Z',
        duration: 15,
        completionPercentage: 100
      }
    ],
    behaviorScore: 82,
    demographicScore: 88,
    firmographicScore: 90,
    intentScore: 75,
    fitScore: 85,
    leadGrade: 'A',
    lifecycleStage: 'Marketing Qualified Lead',
    buyingRole: 'Decision Maker',
    buyingStage: 'Solution Aware',
    leadMagnetType: 'Whitepaper',
    originalReferrer: 'https://google.com',
    landingPage: 'https://example.com/enterprise-solutions',
    firstPageVisited: 'https://example.com/enterprise-solutions',
    pagesVisited: 8,
    timeOnSite: 25,
    sessionCount: 3,
    deviceType: 'Desktop',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    mobileNumber: '+1-555-0123',
    workPhone: '+1-555-0123',
    department: 'Information Technology',
    reportingManager: 'CTO',
    decisionMakingProcess: 'Committee-based with final approval from CTO',
    budget_authority: true,
    budget_timeline: 'Q2 2024',
    currentSolution: 'Legacy ERP System',
    currentVendor: 'Custom In-house Solution',
    contractEndDate: '2024-06-30',
    evaluationCriteria: ['Cost', 'Features', 'Implementation time', 'Support'],
    decisionTimeframe: '3 months',
    stakeholders: ['CTO', 'CFO', 'IT Manager', 'Operations Director'],
    championIdentified: true,
    championName: 'John Smith',
    championContact: 'john.smith@techcorp.com',
    competitiveThreats: ['SAP', 'Oracle'],
    riskFactors: ['Budget constraints', 'Implementation timeline'],
    opportunitySize: 75000,
    dealProbability: 65,
    nextSteps: ['Schedule technical demo', 'Prepare proposal', 'Identify additional stakeholders'],
    internalNotes: ['High-value prospect', 'Decision maker confirmed', 'Budget approved'],
    publicNotes: ['Interested in cloud deployment', 'Requires mobile access'],
    attachments: ['requirements_document.pdf', 'current_system_overview.docx'],
    documents: ['proposal_draft.pdf'],
    recordings: ['discovery_call_20240118.mp3'],
    emailHistory: [
      {
        id: '1',
        subject: 'Welcome to TechCorp Solutions',
        body: 'Thank you for your interest in our enterprise solutions...',
        sentBy: 'Sarah Johnson',
        sentAt: '2024-01-15T11:00:00Z',
        opened: true,
        openedAt: '2024-01-15T11:30:00Z',
        clicked: true,
        clickedAt: '2024-01-15T11:35:00Z',
        replied: false,
        bounced: false,
        templateId: 'welcome_template',
        campaignId: '1',
        attachments: ['company_brochure.pdf']
      }
    ],
    callHistory: [
      {
        id: '1',
        type: 'Outbound',
        duration: 25,
        outcome: 'Connected',
        notes: 'Great initial conversation. Confirmed budget and timeline.',
        calledBy: 'Sarah Johnson',
        calledAt: '2024-01-18T14:00:00Z',
        followUpRequired: true,
        followUpDate: '2024-01-22T10:00:00Z',
        sentiment: 'Positive',
        nextSteps: ['Send proposal', 'Schedule demo']
      }
    ],
    meetingHistory: [
      {
        id: '1',
        title: 'Discovery Call',
        type: 'Discovery',
        scheduledAt: '2024-01-18T14:00:00Z',
        duration: 30,
        attendees: ['John Smith', 'Sarah Johnson'],
        agenda: 'Understand current challenges and requirements',
        notes: 'Detailed discussion about current system limitations',
        outcome: 'Completed',
        followUpRequired: true,
        followUpDate: '2024-01-22T10:00:00Z',
        nextSteps: ['Technical demo', 'Stakeholder meeting'],
        actionItems: [
          {
            id: '1',
            description: 'Prepare technical demo',
            assignedTo: 'Sarah Johnson',
            dueDate: '2024-01-20T17:00:00Z',
            status: 'In Progress',
            priority: 'High'
          }
        ]
      }
    ],
    taskHistory: [
      {
        id: '1',
        title: 'Follow up on demo request',
        description: 'Schedule technical demonstration for John Smith',
        type: 'Follow-up',
        status: 'Completed',
        priority: 'High',
        assignedTo: 'Sarah Johnson',
        assignedBy: 'Sarah Johnson',
        createdAt: '2024-01-18T15:00:00Z',
        dueDate: '2024-01-20T17:00:00Z',
        completedAt: '2024-01-19T10:00:00Z',
        notes: 'Demo scheduled for next week',
        relatedTo: 'meeting_1'
      }
    ],
    noteHistory: [
      {
        id: '1',
        content: 'Prospect is very interested in cloud deployment options',
        type: 'General',
        createdBy: 'Sarah Johnson',
        createdAt: '2024-01-18T14:30:00Z',
        isPrivate: false,
        tags: ['cloud', 'deployment'],
        attachments: []
      }
    ],
    statusHistory: [
      {
        id: '1',
        previousStatus: 'New',
        newStatus: 'Contacted',
        changedBy: 'Sarah Johnson',
        changedAt: '2024-01-18T14:30:00Z',
        reason: 'Completed discovery call',
        automatedChange: false
      }
    ],
    scoreHistory: [
      {
        id: '1',
        previousScore: 75,
        newScore: 85,
        changedAt: '2024-01-18T14:30:00Z',
        reason: 'Positive call outcome and confirmed budget',
        automatedChange: true,
        factors: [
          { factor: 'Budget confirmed', points: 5, description: 'Lead confirmed available budget' },
          { factor: 'Decision maker', points: 5, description: 'Speaking with decision maker' }
        ]
      }
    ],
    touchpointHistory: [
      {
        id: '1',
        type: 'Call',
        channel: 'Phone',
        description: 'Discovery call to understand requirements',
        timestamp: '2024-01-18T14:00:00Z',
        duration: 30,
        outcome: 'Positive engagement',
        sentiment: 'Positive',
        engagementLevel: 'High',
        notes: 'Great conversation, confirmed interest',
        automatedCapture: false
      }
    ],
    campaignHistory: [
      {
        id: '1',
        campaignId: '1',
        campaignName: 'Q1 Product Launch Campaign',
        campaignType: 'Email',
        joinedAt: '2024-01-15T10:30:00Z',
        status: 'Active',
        interactions: 3,
        conversions: 1,
        revenue: 0
      }
    ],
    webActivity: [
      {
        id: '1',
        sessionId: 'session_123',
        pageUrl: 'https://example.com/enterprise-solutions',
        pageTitle: 'Enterprise Solutions',
        visitedAt: '2024-01-15T09:00:00Z',
        timeOnPage: 180,
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        location: {
          country: 'USA',
          region: 'California',
          city: 'San Francisco'
        },
        actions: [
          {
            id: '1',
            type: 'Click',
            element: 'Request Demo Button',
            timestamp: '2024-01-15T09:02:30Z'
          }
        ]
      }
    ],
    emailActivity: [
      {
        id: '1',
        emailId: 'email_123',
        type: 'Opened',
        timestamp: '2024-01-15T11:30:00Z',
        details: { userAgent: 'Outlook', location: 'San Francisco, CA' }
      }
    ],
    socialActivity: [
      {
        id: '1',
        platform: 'LinkedIn',
        type: 'Profile View',
        timestamp: '2024-01-16T10:00:00Z',
        engagement: 1
      }
    ],
    integrationData: {
      salesforce: { id: 'sf_123', lastSync: '2024-01-18T15:00:00Z' },
      hubspot: { id: 'hs_456', lastSync: '2024-01-18T15:00:00Z' }
    },
    externalIds: {
      salesforce: 'sf_123',
      hubspot: 'hs_456',
      marketo: 'mkto_789'
    },
    syncStatus: 'Synced',
    lastSyncDate: '2024-01-18T15:00:00Z',
    dataSource: 'Website Form',
    dataQuality: 'High',
    archived: false,
    auditTrail: [
      {
        id: '1',
        action: 'Created',
        changedBy: 'System',
        changedAt: '2024-01-15T10:30:00Z',
        automatedChange: true
      }
    ],
    permissions: {
      canView: ['Sarah Johnson', 'Mike Wilson', 'Sales Team'],
      canEdit: ['Sarah Johnson'],
      canDelete: ['Sarah Johnson', 'Sales Manager'],
      canAssign: ['Sarah Johnson', 'Sales Manager'],
      canExport: ['Sarah Johnson', 'Sales Team'],
      canMerge: ['Sales Manager'],
      restrictedFields: []
    },
    sharing: {
      isPublic: false,
      sharedWith: ['Sales Team'],
      shareLevel: 'View',
      teamVisibility: 'Team',
      externalSharing: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notifyOnStatusChange: true,
      notifyOnScoreChange: true,
      notifyOnAssignment: true,
      notifyOnActivity: true,
      notificationFrequency: 'Immediate',
      customNotifications: []
    },
    automation: {
      autoAssignment: true,
      autoScoring: true,
      autoNurturing: true,
      autoFollowUp: true,
      autoQualification: true,
      workflowRules: [],
      triggers: []
    },
    scoring: {
      totalScore: 85,
      demographicScore: 88,
      behaviorScore: 82,
      engagementScore: 78,
      fitScore: 85,
      intentScore: 75,
      scoringModel: 'Enterprise Lead Scoring v2.0',
      lastScored: '2024-01-18T14:30:00Z',
      scoringRules: [],
      scoreBreakdown: [
        { category: 'Demographic', score: 88, maxScore: 100, percentage: 88, factors: ['Job Title', 'Company Size'] },
        { category: 'Behavior', score: 82, maxScore: 100, percentage: 82, factors: ['Website Activity', 'Email Engagement'] },
        { category: 'Engagement', score: 78, maxScore: 100, percentage: 78, factors: ['Call Participation', 'Demo Request'] }
      ]
    },
    routing: {
      routingRules: [],
      assignmentMethod: 'Territory',
      autoAssignment: true,
      reassignmentRules: [],
      escalationRules: []
    },
    enrichment: {
      autoEnrichment: true,
      enrichmentSources: ['ZoomInfo', 'Clearbit'],
      lastEnriched: '2024-01-15T10:30:00Z',
      enrichmentStatus: 'Completed',
      enrichedFields: ['company', 'jobTitle', 'industry', 'companySize'],
      enrichmentScore: 95,
      dataProviders: [
        {
          name: 'ZoomInfo',
          status: 'Active',
          lastSync: '2024-01-15T10:30:00Z',
          fieldsProvided: ['company', 'jobTitle'],
          confidence: 95
        }
      ]
    },
    validation: {
      emailValidation: { isValid: true, confidence: 98, status: 'Valid', validatedAt: '2024-01-15T10:30:00Z' },
      phoneValidation: { isValid: true, confidence: 95, status: 'Valid', validatedAt: '2024-01-15T10:30:00Z' },
      addressValidation: { isValid: true, confidence: 90, status: 'Valid', validatedAt: '2024-01-15T10:30:00Z' },
      companyValidation: { isValid: true, confidence: 98, status: 'Valid', validatedAt: '2024-01-15T10:30:00Z' },
      overallValidation: { isValid: true, confidence: 96, status: 'Valid', validatedAt: '2024-01-15T10:30:00Z' },
      lastValidated: '2024-01-15T10:30:00Z',
      validationRules: []
    },
    compliance: {
      gdprCompliant: true,
      ccpaCompliant: true,
      canSpamCompliant: true,
      consentStatus: 'Granted',
      consentDate: '2024-01-15T10:30:00Z',
      consentSource: 'Website Form',
      optInStatus: 'Double',
      unsubscribeDate: undefined,
      dataRetentionDate: '2027-01-15T10:30:00Z',
      rightToBeForgettenRequested: false,
      dataProcessingPurpose: ['Marketing', 'Sales'],
      legalBasis: 'Consent',
      complianceNotes: []
    },
    analytics: {
      conversionProbability: 65,
      timeToConversion: 45,
      valueScore: 85,
      engagementTrend: 'Increasing',
      responseRate: 75,
      averageResponseTime: 4.2,
      touchpointsToConversion: 8,
      channelEffectiveness: [
        { channel: 'Email', interactions: 3, conversions: 1, conversionRate: 33, averageResponseTime: 4.2, effectiveness: 'High' },
        { channel: 'Phone', interactions: 2, conversions: 1, conversionRate: 50, averageResponseTime: 2.5, effectiveness: 'High' }
      ],
      predictedValue: 75000,
      churnRisk: 15,
      nextBestAction: ['Schedule demo', 'Send proposal', 'Identify stakeholders'],
      similarLeads: ['lead_456', 'lead_789'],
      benchmarkComparison: {
        industryAverage: 72,
        companyAverage: 78,
        teamAverage: 82,
        performanceRating: 'Above Average'
      }
    }
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@retailplus.com',
    phone: '+1-555-0124',
    company: 'RetailPlus Inc',
    jobTitle: 'Operations Manager',
    source: 'Email',
    status: 'Contacted',
    score: 72,
    assignedTo: 'Mike Wilson',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    notes: 'Looking for inventory management system',
    budget: 25000,
    timeline: 'Q1 2024',
    industry: 'Retail',
    // Enhanced fields with minimal data for brevity
    address: '456 Retail Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    website: 'https://retailplus.com',
    companySize: '51-200',
    annualRevenue: 2000000,
    leadQuality: 'Warm',
    authority: 'Influencer',
    need: 'Medium',
    urgency: 'This Quarter',
    tags: ['Retail', 'Inventory', 'Mid-Market'],
    customFields: {},
    socialMedia: { linkedin: 'https://linkedin.com/in/emilydavis' },
    lastContactDate: '2024-01-16T09:15:00Z',
    nextFollowUpDate: '2024-01-20T14:00:00Z',
    leadOwnerHistory: [],
    campaignId: '2',
    unsubscribed: false,
    doNotCall: false,
    doNotEmail: false,
    gdprConsent: true,
    lastActivityDate: '2024-01-16T09:15:00Z',
    totalActivities: 4,
    emailsSent: 2,
    emailsOpened: 1,
    emailsClicked: 0,
    callsAttempted: 1,
    callsConnected: 1,
    meetingsScheduled: 0,
    meetingsAttended: 0,
    proposalsSent: 0,
    quotesRequested: 0,
    demoRequested: false,
    trialRequested: false,
    pricingRequested: false,
    competitorMentioned: [],
    painPoints: ['Manual inventory tracking', 'Stock-outs'],
    interests: ['Automated reordering', 'Real-time tracking'],
    productInterest: ['Inventory Management'],
    marketingQualified: true,
    salesQualified: false,
    leadTemperature: 72,
    engagementScore: 65,
    responseTime: 6.0,
    averageEmailResponseTime: 8.5,
    preferredContactMethod: 'Email',
    timezone: 'America/Chicago',
    bestTimeToContact: '9:00 AM - 6:00 PM CST',
    language: 'English',
    currency: 'USD',
    leadValue: 25000,
    probabilityToClose: 45,
    expectedCloseDate: '2024-02-28',
    salesCycleStage: 2,
    touchpointsCount: 6,
    lastTouchpointType: 'Email',
    lastTouchpointDate: '2024-01-16T09:15:00Z',
    leadMagnetDownloads: ['Inventory Best Practices Guide'],
    webinarAttendance: [],
    eventAttendance: [],
    contentEngagement: [],
    behaviorScore: 68,
    demographicScore: 75,
    firmographicScore: 70,
    intentScore: 60,
    fitScore: 72,
    leadGrade: 'B',
    lifecycleStage: 'Lead',
    buyingRole: 'Influencer',
    buyingStage: 'Problem Aware',
    pagesVisited: 4,
    timeOnSite: 12,
    sessionCount: 2,
    deviceType: 'Desktop',
    browser: 'Firefox',
    operatingSystem: 'Windows',
    mobileNumber: '+1-555-0124',
    workPhone: '+1-555-0124',
    department: 'Operations',
    budget_authority: false,
    budget_timeline: 'Q1 2024',
    currentSolution: 'Excel spreadsheets',
    evaluationCriteria: ['Cost', 'Ease of use', 'Integration'],
    decisionTimeframe: '2 months',
    stakeholders: ['Operations Manager', 'IT Director', 'CFO'],
    championIdentified: false,
    competitiveThreats: [],
    riskFactors: ['Limited budget', 'Change resistance'],
    opportunitySize: 25000,
    dealProbability: 45,
    nextSteps: ['Send product demo', 'Understand decision process'],
    internalNotes: ['Budget conscious', 'Needs simple solution'],
    publicNotes: ['Interested in ease of use'],
    attachments: ['requirements_document.pdf', 'current_system_overview.docx'],
    documents: ['proposal_draft.pdf'],
    recordings: ['discovery_call_20240118.mp3'],
    emailHistory: [],
    callHistory: [],
    meetingHistory: [],
    taskHistory: [],
    noteHistory: [],
    statusHistory: [],
    scoreHistory: [],
    touchpointHistory: [],
    campaignHistory: [],
    webActivity: [],
    emailActivity: [],
    socialActivity: [],
    integrationData: {},
    externalIds: {},
    syncStatus: 'Synced',
    lastSyncDate: '2024-01-16T09:15:00Z',
    dataSource: 'Email Campaign',
    dataQuality: 'Medium',
    archived: false,
    auditTrail: [],
    permissions: {
      canView: ['Mike Wilson', 'Sales Team'],
      canEdit: ['Mike Wilson'],
      canDelete: ['Mike Wilson', 'Sales Manager'],
      canAssign: ['Mike Wilson', 'Sales Manager'],
      canExport: ['Mike Wilson', 'Sales Team'],
      canMerge: ['Sales Manager'],
      restrictedFields: []
    },
    sharing: {
      isPublic: false,
      sharedWith: ['Sales Team'],
      shareLevel: 'View',
      teamVisibility: 'Team',
      externalSharing: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notifyOnStatusChange: true,
      notifyOnScoreChange: true,
      notifyOnAssignment: true,
      notifyOnActivity: true,
      notificationFrequency: 'Daily',
      customNotifications: []
    },
    automation: {
      autoAssignment: true,
      autoScoring: true,
      autoNurturing: true,
      autoFollowUp: true,
      autoQualification: true,
      workflowRules: [],
      triggers: []
    },
    scoring: {
      totalScore: 72,
      demographicScore: 75,
      behaviorScore: 68,
      engagementScore: 65,
      fitScore: 72,
      intentScore: 60,
      scoringModel: 'SMB Lead Scoring v1.0',
      lastScored: '2024-01-16T09:15:00Z',
      scoringRules: [],
      scoreBreakdown: [
        { category: 'Demographic', score: 75, maxScore: 100, percentage: 75, factors: ['Job Title', 'Company Size'] },
        { category: 'Behavior', score: 68, maxScore: 100, percentage: 68, factors: ['Email Engagement'] },
        { category: 'Engagement', score: 65, maxScore: 100, percentage: 65, factors: ['Email Opens'] }
      ]
    },
    routing: {
      routingRules: [],
      assignmentMethod: 'Round Robin',
      autoAssignment: true,
      reassignmentRules: [],
      escalationRules: []
    },
    enrichment: {
      autoEnrichment: true,
      enrichmentSources: ['Clearbit'],
      lastEnriched: '2024-01-14T14:20:00Z',
      enrichmentStatus: 'Completed',
      enrichedFields: ['company', 'industry'],
      enrichmentScore: 85,
      dataProviders: [
        {
          name: 'Clearbit',
          status: 'Active',
          lastSync: '2024-01-14T14:20:00Z',
          fieldsProvided: ['company', 'industry'],
          confidence: 85
        }
      ]
    },
    validation: {
      emailValidation: { isValid: true, confidence: 95, status: 'Valid', validatedAt: '2024-01-14T14:20:00Z' },
      phoneValidation: { isValid: true, confidence: 90, status: 'Valid', validatedAt: '2024-01-14T14:20:00Z' },
      addressValidation: { isValid: true, confidence: 85, status: 'Valid', validatedAt: '2024-01-14T14:20:00Z' },
      companyValidation: { isValid: true, confidence: 95, status: 'Valid', validatedAt: '2024-01-14T14:20:00Z' },
      overallValidation: { isValid: true, confidence: 91, status: 'Valid', validatedAt: '2024-01-14T14:20:00Z' },
      lastValidated: '2024-01-14T14:20:00Z',
      validationRules: []
    },
    compliance: {
      gdprCompliant: true,
      ccpaCompliant: true,
      canSpamCompliant: true,
      consentStatus: 'Granted',
      consentDate: '2024-01-14T14:20:00Z',
      consentSource: 'Email Campaign',
      optInStatus: 'Single',
      unsubscribeDate: undefined,
      dataRetentionDate: '2027-01-14T14:20:00Z',
      rightToBeForgettenRequested: false,
      dataProcessingPurpose: ['Marketing', 'Sales'],
      legalBasis: 'Consent',
      complianceNotes: []
    },
    analytics: {
      conversionProbability: 45,
      timeToConversion: 60,
      valueScore: 72,
      engagementTrend: 'Stable',
      responseRate: 50,
      averageResponseTime: 8.5,
      touchpointsToConversion: 12,
      channelEffectiveness: [
        { channel: 'Email', interactions: 2, conversions: 0, conversionRate: 0, averageResponseTime: 8.5, effectiveness: 'Medium' }
      ],
      predictedValue: 25000,
      churnRisk: 25,
      nextBestAction: ['Send demo video', 'Schedule call', 'Provide case study'],
      similarLeads: ['lead_123', 'lead_456'],
      benchmarkComparison: {
        industryAverage: 68,
        companyAverage: 70,
        teamAverage: 75,
        performanceRating: 'Average'
      }
    }
  }
];

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-0201',
    company: 'Innovation Labs',
    jobTitle: 'CEO',
    address: '123 Business Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    tags: ['VIP', 'Decision Maker'],
    socialMedia: {
      linkedin: 'https://linkedin.com/in/alicejohnson',
      twitter: '@alicejohnson'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    lastContactDate: '2024-01-18T12:00:00Z',
    notes: 'Key decision maker for technology purchases',
    isActive: true,
    stage: 'Customer',
    owner: 'Sarah Johnson',
    teamVisibility: 'team',
    consentStatus: 'granted',
    customFields: {
      industry: 'Technology',
      companySize: '50-100'
    },
    relationshipScore: 85,
    lastInteractionType: 'meeting',
    segmentIds: ['enterprise', 'tech-leaders']
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@techstart.com',
    phone: '+1-555-0202',
    company: 'TechStart Solutions',
    jobTitle: 'CTO',
    address: '456 Tech Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    tags: ['Technical', 'Influencer'],
    socialMedia: {
      linkedin: 'https://linkedin.com/in/davidbrown'
    },
    createdAt: '2024-01-08T10:30:00Z',
    updatedAt: '2024-01-17T15:45:00Z',
    lastContactDate: '2024-01-16T14:20:00Z',
    notes: 'Technical expert, influences purchasing decisions',
    isActive: true,
    stage: 'Prospect',
    owner: 'Mike Wilson',
    teamVisibility: 'public',
    consentStatus: 'granted',
    customFields: {
      industry: 'Software',
      companySize: '20-50'
    },
    relationshipScore: 72,
    lastInteractionType: 'email',
    segmentIds: ['mid-market', 'technical-buyers']
  },
  {
    id: '3',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@globalcorp.com',
    phone: '+1-555-0203',
    company: 'Global Manufacturing',
    jobTitle: 'Operations Director',
    address: '789 Industrial Blvd',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    tags: ['Budget Holder', 'Champion'],
    socialMedia: {
      linkedin: 'https://linkedin.com/in/mariagarcia'
    },
    createdAt: '2024-01-12T14:15:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    lastContactDate: '2024-01-19T09:30:00Z',
    notes: 'Strong advocate for our solutions, has budget authority',
    isActive: true,
    stage: 'Lead',
    owner: 'Emily Davis',
    teamVisibility: 'team',
    consentStatus: 'granted',
    customFields: {
      industry: 'Manufacturing',
      companySize: '500+'
    },
    relationshipScore: 91,
    lastInteractionType: 'call',
    segmentIds: ['enterprise', 'manufacturing']
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'Enterprise ERP Implementation',
    accountId: '1',
    contactId: '1',
    stage: 'Proposal',
    amount: 150000,
    probability: 75,
    expectedCloseDate: '2024-03-15',
    assignedTo: 'Sarah Johnson',
    source: 'Inbound Lead',
    description: 'Complete ERP system implementation for mid-size company',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:30:00Z',
    products: ['ERP Core', 'CRM Module', 'Finance Module'],
    competitors: ['SAP', 'Oracle'],
    nextStep: 'Schedule technical demo',
    weightedAmount: 112500, // amount * probability
    salesVelocity: 8.5, // days per stage
    daysInStage: 12,
    lastActivityDate: '2024-01-18T11:30:00Z',
    winProbabilityAI: 78,
    lostReason: undefined,
    approvalStatus: 'approved',
    discountApproved: false,
    commissionRate: 0.05,
    forecastCategory: 'commit',
    crossSellOpportunities: ['Training Services', 'Support Package'],
    upsellPotential: 25000
  },
  {
    id: '2',
    name: 'CRM System Upgrade',
    accountId: '2',
    contactId: '2',
    stage: 'Negotiation',
    amount: 75000,
    probability: 85,
    expectedCloseDate: '2024-02-28',
    assignedTo: 'Mike Wilson',
    source: 'Existing Customer',
    description: 'Upgrade existing CRM system with new features',
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-17T16:45:00Z',
    products: ['CRM Advanced', 'Analytics Module'],
    competitors: ['Salesforce', 'HubSpot'],
    nextStep: 'Final contract review',
    weightedAmount: 63750, // amount * probability
    salesVelocity: 6.2,
    daysInStage: 8,
    lastActivityDate: '2024-01-17T16:45:00Z',
    winProbabilityAI: 88,
    lostReason: undefined,
    approvalStatus: 'approved',
    discountApproved: true,
    commissionRate: 0.04,
    forecastCategory: 'commit',
    crossSellOpportunities: ['Data Migration', 'Custom Integration'],
    upsellPotential: 15000
  },
  {
    id: '3',
    name: 'Manufacturing Process Optimization',
    accountId: '3',
    contactId: '3',
    stage: 'Qualification',
    amount: 200000,
    probability: 45,
    expectedCloseDate: '2024-04-30',
    assignedTo: 'Emily Davis',
    source: 'Referral',
    description: 'Complete manufacturing process optimization and automation',
    createdAt: '2024-01-12T10:15:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
    products: ['Manufacturing Suite', 'IoT Sensors', 'Analytics Platform'],
    competitors: ['Siemens', 'GE Digital'],
    nextStep: 'Conduct needs assessment',
    weightedAmount: 90000, // amount * probability
    salesVelocity: 12.3,
    daysInStage: 7,
    lastActivityDate: '2024-01-19T14:20:00Z',
    winProbabilityAI: 52,
    lostReason: undefined,
    approvalStatus: 'pending',
    discountApproved: false,
    commissionRate: 0.06,
    forecastCategory: 'best-case',
    crossSellOpportunities: ['Maintenance Contract', 'Training Program'],
    upsellPotential: 50000
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Product Launch Campaign',
    type: 'Email',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budget: 15000,
    targetAudience: 'Enterprise customers',
    description: 'Promoting new ERP features to existing and potential customers',
    metrics: {
      sent: 5000,
      delivered: 4850,
      opened: 1940,
      clicked: 485,
      converted: 97
    },
    createdAt: '2023-12-15T10:00:00Z',
    createdBy: 'Marketing Team',
    automationRules: [
      {
        id: '1',
        name: 'Welcome Series',
        trigger: 'email_opened',
        conditions: [
          { field: 'email_opened', operator: 'equals', value: 'true' }
        ],
        actions: [
          { type: 'send_email', parameters: { templateId: 'welcome-2', delay: '24h' } }
        ],
        isActive: true
      }
    ],
    emailTemplate: {
      id: '1',
      name: 'Product Launch Template',
      subject: 'Introducing Our Latest ERP Features',
      htmlContent: '<html><body><h1>New Features Available</h1></body></html>',
      textContent: 'New Features Available - Check out our latest ERP updates',
      variables: ['firstName', 'companyName', 'productName']
    },
    leadScoringRules: [
      {
        id: '1',
        name: 'Email Engagement',
        criteria: [
          { field: 'email_opened', operator: 'equals', value: 'true' }
        ],
        points: 10,
        isActive: true
      }
    ],
    abTestVariants: [
      {
        id: '1',
        name: 'Variant A',
        percentage: 50,
        template: {
          id: '1a',
          name: 'Template A',
          subject: 'Introducing Our Latest ERP Features',
          htmlContent: '<html><body><h1>Version A</h1></body></html>',
          textContent: 'Version A content',
          variables: ['firstName']
        },
        metrics: { sent: 2500, opened: 970, clicked: 242, converted: 48 }
      }
    ],
    landingPageUrl: 'https://example.com/product-launch',
    conversionGoals: [
      {
        id: '1',
        name: 'Demo Request',
        type: 'form_submit',
        value: 100,
        url: 'https://example.com/demo-request'
      }
    ],
    segmentIds: ['enterprise', 'existing-customers'],
    triggerConditions: [
      {
        id: '1',
        type: 'contact_created',
        parameters: { source: 'website' }
      }
    ]
  },
  {
    id: '2',
    name: 'Webinar Series - CRM Best Practices',
    type: 'Webinar',
    status: 'Completed',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    budget: 5000,
    targetAudience: 'SMB customers',
    description: 'Educational webinar about CRM best practices',
    metrics: {
      sent: 2000,
      delivered: 1950,
      opened: 780,
      clicked: 390,
      converted: 78
    },
    createdAt: '2024-01-01T09:00:00Z',
    createdBy: 'Sarah Johnson',
    automationRules: [
      {
        id: '2',
        name: 'Webinar Follow-up',
        trigger: 'form_submitted',
        conditions: [
          { field: 'webinar_attended', operator: 'equals', value: 'true' }
        ],
        actions: [
          { type: 'send_email', parameters: { templateId: 'webinar-followup', delay: '2h' } }
        ],
        isActive: true
      }
    ],
    emailTemplate: {
      id: '2',
      name: 'Webinar Invitation',
      subject: 'Join Our CRM Best Practices Webinar',
      htmlContent: '<html><body><h1>Webinar Invitation</h1></body></html>',
      textContent: 'Join our webinar on CRM best practices',
      variables: ['firstName', 'webinarDate', 'webinarTime']
    },
    leadScoringRules: [
      {
        id: '2',
        name: 'Webinar Attendance',
        criteria: [
          { field: 'webinar_attended', operator: 'equals', value: 'true' }
        ],
        points: 25,
        isActive: true
      }
    ],
    abTestVariants: [
      {
        id: '2',
        name: 'Variant B',
        percentage: 100,
        template: {
          id: '2b',
          name: 'Webinar Template',
          subject: 'Join Our CRM Best Practices Webinar',
          htmlContent: '<html><body><h1>Webinar</h1></body></html>',
          textContent: 'Webinar content',
          variables: ['firstName']
        },
        metrics: { sent: 2000, opened: 780, clicked: 390, converted: 78 }
      }
    ],
    landingPageUrl: 'https://example.com/webinar-registration',
    conversionGoals: [
      {
        id: '2',
        name: 'Webinar Registration',
        type: 'form_submit',
        value: 50,
        url: 'https://example.com/webinar-register'
      }
    ],
    segmentIds: ['smb', 'prospects'],
    triggerConditions: [
      {
        id: '2',
        type: 'tag_added',
        parameters: { tag: 'webinar-interest' }
      }
    ]
  }
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: '1',
    title: 'Login Issues with CRM Module',
    description: 'Users unable to access CRM dashboard after recent update. Multiple users reporting the same issue across different browsers.',
    status: 'In Progress',
    priority: 'High',
    category: 'Technical',
    customerId: '1',
    assignedTo: 'Tech Support Team',
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    resolvedAt: undefined,
    slaDeadline: '2024-01-19T09:30:00Z',
    tags: ['login', 'crm', 'urgent'],
    attachments: ['screenshot1.png', 'error_log.txt'],
    customerSatisfaction: undefined,
    escalationLevel: 1,
    responseTime: 45, // 45 minutes
    resolutionTime: undefined,
    channel: 'email',
    internalNotes: [
      {
        id: '1',
        content: 'Initial investigation shows this might be related to the recent authentication update',
        createdBy: 'John Doe',
        createdAt: '2024-01-18T10:15:00Z',
        isInternal: true
      }
    ],
    publicReplies: [
      {
        id: '1',
        content: 'Thank you for reporting this issue. We are currently investigating and will update you shortly.',
        createdBy: 'Tech Support Team',
        createdAt: '2024-01-18T10:15:00Z',
        isFromCustomer: false,
        attachments: []
      }
    ],
    relatedTickets: [],
    knowledgeBaseArticles: ['2'],
    slaPolicy: {
      id: '1',
      name: 'High Priority SLA',
      responseTime: 60, // 1 hour
      resolutionTime: 480, // 8 hours
      priority: 'High',
      businessHoursOnly: true
    },
    customerInfo: {
      name: 'Alice Johnson',
      email: 'alice.johnson@innovation-labs.com',
      phone: '+1-555-0201',
      company: 'Innovation Labs',
      tier: 'Enterprise'
    }
  },
  {
    id: '2',
    title: 'Feature Request: Custom Fields',
    description: 'Customer requesting ability to add custom fields to contact forms to better track industry-specific information',
    status: 'Open',
    priority: 'Medium',
    category: 'Feature Request',
    customerId: '2',
    assignedTo: 'Product Team',
    createdAt: '2024-01-17T11:15:00Z',
    updatedAt: '2024-01-17T11:15:00Z',
    resolvedAt: undefined,
    slaDeadline: '2024-01-24T11:15:00Z',
    tags: ['enhancement', 'custom-fields', 'contacts'],
    attachments: [],
    customerSatisfaction: undefined,
    escalationLevel: 0,
    responseTime: 120, // 2 hours
    resolutionTime: undefined,
    channel: 'web',
    internalNotes: [],
    publicReplies: [
      {
        id: '1',
        content: 'Thank you for your feature request. We have added this to our product roadmap for consideration.',
        createdBy: 'Product Team',
        createdAt: '2024-01-17T13:30:00Z',
        isFromCustomer: false,
        attachments: []
      }
    ],
    relatedTickets: [],
    knowledgeBaseArticles: [],
    slaPolicy: {
      id: '2',
      name: 'Standard SLA',
      responseTime: 240, // 4 hours
      resolutionTime: 1440, // 24 hours
      priority: 'Medium',
      businessHoursOnly: true
    },
    customerInfo: {
      name: 'David Brown',
      email: 'david.brown@techstart.com',
      phone: '+1-555-0202',
      company: 'TechStart Solutions',
      tier: 'Premium'
    }
  },
  {
    id: '3',
    title: 'Billing Discrepancy - Overcharged',
    description: 'Customer reports being charged twice for the same month. Invoice #12345 shows duplicate charges.',
    status: 'Resolved',
    priority: 'High',
    category: 'Billing',
    customerId: '3',
    assignedTo: 'Customer Success',
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-16T16:45:00Z',
    resolvedAt: '2024-01-16T16:45:00Z',
    slaDeadline: '2024-01-16T14:20:00Z',
    tags: ['billing', 'refund', 'duplicate-charge'],
    attachments: ['invoice_12345.pdf'],
    customerSatisfaction: 4.5,
    escalationLevel: 0,
    responseTime: 30, // 30 minutes
    resolutionTime: 1545, // 25 hours 45 minutes
    channel: 'phone',
    internalNotes: [
      {
        id: '1',
        content: 'Confirmed duplicate charge in billing system. Processing refund.',
        createdBy: 'Billing Team',
        createdAt: '2024-01-16T09:30:00Z',
        isInternal: true
      }
    ],
    publicReplies: [
      {
        id: '1',
        content: 'We have identified the duplicate charge and processed a full refund. You should see the credit within 3-5 business days.',
        createdBy: 'Customer Success',
        createdAt: '2024-01-16T16:45:00Z',
        isFromCustomer: false,
        attachments: ['refund_confirmation.pdf']
      }
    ],
    relatedTickets: [],
    knowledgeBaseArticles: ['3'],
    slaPolicy: {
      id: '1',
      name: 'High Priority SLA',
      responseTime: 60, // 1 hour
      resolutionTime: 480, // 8 hours
      priority: 'High',
      businessHoursOnly: true
    },
    customerInfo: {
      name: 'Maria Garcia',
      email: 'maria.garcia@globalcorp.com',
      phone: '+1-555-0203',
      company: 'Global Manufacturing',
      tier: 'Enterprise'
    }
  },
  {
    id: '4',
    title: 'Password Reset Not Working',
    description: 'Customer unable to reset password using the forgot password link. Email is not being received.',
    status: 'Pending',
    priority: 'Medium',
    category: 'Technical',
    customerId: '4',
    assignedTo: 'Tech Support Team',
    createdAt: '2024-01-19T08:45:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
    resolvedAt: undefined,
    slaDeadline: '2024-01-20T08:45:00Z',
    tags: ['password', 'email', 'authentication'],
    attachments: [],
    customerSatisfaction: undefined,
    escalationLevel: 0,
    responseTime: 105, // 1 hour 45 minutes
    resolutionTime: undefined,
    channel: 'chat',
    internalNotes: [
      {
        id: '1',
        content: 'Checked email delivery logs. Email is being sent but may be going to spam folder.',
        createdBy: 'Tech Support',
        createdAt: '2024-01-19T10:30:00Z',
        isInternal: true
      }
    ],
    publicReplies: [
      {
        id: '1',
        content: 'Please check your spam/junk folder for the password reset email. If you still cannot find it, we can manually reset your password.',
        createdBy: 'Tech Support Team',
        createdAt: '2024-01-19T10:30:00Z',
        isFromCustomer: false,
        attachments: []
      }
    ],
    relatedTickets: [],
    knowledgeBaseArticles: ['1'],
    slaPolicy: {
      id: '2',
      name: 'Standard SLA',
      responseTime: 240, // 4 hours
      resolutionTime: 1440, // 24 hours
      priority: 'Medium',
      businessHoursOnly: true
    },
    customerInfo: {
      name: 'Robert Chen',
      email: 'robert.chen@manufacturing.com',
      phone: '+1-555-0125',
      company: 'Global Manufacturing',
      tier: 'Basic'
    }
  },
  {
    id: '5',
    title: 'Data Export Functionality Missing',
    description: 'Customer cannot find the data export feature that was mentioned in the documentation.',
    status: 'Closed',
    priority: 'Low',
    category: 'General',
    customerId: '5',
    assignedTo: 'Customer Success',
    createdAt: '2024-01-14T16:30:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    resolvedAt: '2024-01-15T11:20:00Z',
    slaDeadline: '2024-01-17T16:30:00Z',
    tags: ['export', 'documentation', 'feature-location'],
    attachments: ['export_guide.pdf'],
    customerSatisfaction: 5.0,
    escalationLevel: 0,
    responseTime: 180, // 3 hours
    resolutionTime: 1130, // 18 hours 50 minutes
    channel: 'email',
    internalNotes: [],
    publicReplies: [
      {
        id: '1',
        content: 'The data export feature is located in the Settings > Data Management section. I have attached a detailed guide.',
        createdBy: 'Customer Success',
        createdAt: '2024-01-15T11:20:00Z',
        isFromCustomer: false,
        attachments: ['export_guide.pdf']
      }
    ],
    relatedTickets: [],
    knowledgeBaseArticles: ['4'],
    slaPolicy: {
      id: '3',
      name: 'Low Priority SLA',
      responseTime: 480, // 8 hours
      resolutionTime: 2880, // 48 hours
      priority: 'Low',
      businessHoursOnly: true
    },
    customerInfo: {
      name: 'Emily Davis',
      email: 'emily.davis@retailplus.com',
      phone: '+1-555-0124',
      company: 'RetailPlus Inc',
      tier: 'Premium'
    }
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'Call',
    title: 'Follow-up call with TechCorp',
    description: 'Discuss proposal details and answer technical questions',
    status: 'Completed',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    relatedTo: {
      type: 'Lead',
      id: '1',
      name: 'John Smith - TechCorp Solutions'
    },
    scheduledDate: '2024-01-18T14:00:00Z',
    completedDate: '2024-01-18T14:30:00Z',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    reminder: true,
    reminderTime: '2024-01-18T13:45:00Z'
  },
  {
    id: '2',
    type: 'Meeting',
    title: 'Product Demo for RetailPlus',
    description: 'Demonstrate inventory management features',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Mike Wilson',
    relatedTo: {
      type: 'Lead',
      id: '2',
      name: 'Emily Davis - RetailPlus Inc'
    },
    scheduledDate: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    reminder: true,
    reminderTime: '2024-01-20T09:30:00Z'
  },
  {
    id: '3',
    type: 'Task',
    title: 'Prepare Q1 presentation',
    description: 'Create slides for quarterly business review meeting',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Emily Davis',
    relatedTo: {
      type: 'Opportunity',
      id: '1',
      name: 'Enterprise ERP Implementation'
    },
    scheduledDate: '2024-01-19T16:00:00Z',
    createdAt: '2024-01-18T11:30:00Z',
    updatedAt: '2024-01-19T09:15:00Z',
    reminder: true,
    reminderTime: '2024-01-19T15:30:00Z'
  },
  {
    id: '4',
    type: 'Email',
    title: 'Send proposal to Global Manufacturing',
    description: 'Send detailed proposal with pricing and implementation timeline',
    status: 'Completed',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    relatedTo: {
      type: 'Contact',
      id: '3',
      name: 'Maria Garcia - Global Manufacturing'
    },
    scheduledDate: '2024-01-17T09:00:00Z',
    completedDate: '2024-01-17T09:30:00Z',
    createdAt: '2024-01-16T15:20:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
    reminder: false
  },
  {
    id: '5',
    type: 'Task',
    title: 'Update CRM contact records',
    description: 'Clean up and update contact information in the CRM system',
    status: 'Pending',
    priority: 'Low',
    assignedTo: 'John Smith',
    relatedTo: {
      type: 'Account',
      id: '1',
      name: 'TechCorp Solutions'
    },
    scheduledDate: '2024-01-22T11:00:00Z',
    createdAt: '2024-01-19T14:45:00Z',
    updatedAt: '2024-01-19T14:45:00Z',
    reminder: true,
    reminderTime: '2024-01-22T10:30:00Z'
  },
  {
    id: '6',
    type: 'Call',
    title: 'Discovery call with new prospect',
    description: 'Initial discovery call to understand business needs and pain points',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Mike Wilson',
    relatedTo: {
      type: 'Lead',
      id: '4',
      name: 'Robert Chen - Manufacturing Corp'
    },
    scheduledDate: '2024-01-21T15:30:00Z',
    createdAt: '2024-01-19T16:20:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
    reminder: true,
    reminderTime: '2024-01-21T15:15:00Z'
  },
  {
    id: '7',
    type: 'Meeting',
    title: 'Team standup meeting',
    description: 'Weekly team standup to discuss progress and blockers',
    status: 'Completed',
    priority: 'Low',
    assignedTo: 'Emily Davis',
    relatedTo: {
      type: 'Account',
      id: '2',
      name: 'Internal Team'
    },
    scheduledDate: '2024-01-19T09:00:00Z',
    completedDate: '2024-01-19T09:30:00Z',
    createdAt: '2024-01-18T17:00:00Z',
    updatedAt: '2024-01-19T09:30:00Z',
    reminder: true,
    reminderTime: '2024-01-19T08:45:00Z'
  },
  {
    id: '8',
    type: 'Note',
    title: 'Document client requirements',
    description: 'Document detailed requirements gathered from client meeting',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: 'Lisa Chen',
    relatedTo: {
      type: 'Opportunity',
      id: '2',
      name: 'CRM System Upgrade'
    },
    scheduledDate: '2024-01-20T14:00:00Z',
    createdAt: '2024-01-19T11:30:00Z',
    updatedAt: '2024-01-19T13:45:00Z',
    reminder: false
  }
];

export const mockAnalytics: CRMAnalytics = {
  leadConversionRate: 24.5,
  averageDealSize: 87500,
  salesCycleLength: 45,
  customerAcquisitionCost: 2500,
  customerLifetimeValue: 125000,
  pipelineValue: 450000,
  winRate: 68.2,
  activityMetrics: {
    callsMade: 156,
    emailsSent: 342,
    meetingsHeld: 28,
    tasksCompleted: 89
  }
};

// Lead Import/Export Mock Data
export const mockLeadImportTemplates = [
  {
    id: '1',
    name: 'Standard Lead Import',
    description: 'Basic lead information import template',
    fields: ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'source', 'status'],
    sampleData: [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Source', 'Status'],
      ['John', 'Smith', 'john.smith@example.com', '+1-555-0123', 'TechCorp', 'IT Director', 'Website', 'New'],
      ['Jane', 'Doe', 'jane.doe@example.com', '+1-555-0124', 'RetailCorp', 'Manager', 'Email', 'New']
    ]
  },
  {
    id: '2',
    name: 'Comprehensive Lead Import',
    description: 'Full lead profile with all available fields',
    fields: [
      'firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'industry', 
      'source', 'status', 'budget', 'timeline', 'address', 'city', 'state', 'zipCode', 
      'country', 'website', 'companySize', 'annualRevenue', 'assignedTo'
    ],
    sampleData: [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Industry', 'Source', 'Status', 'Budget', 'Timeline', 'Address', 'City', 'State', 'Zip', 'Country', 'Website', 'Company Size', 'Annual Revenue', 'Assigned To'],
      ['John', 'Smith', 'john.smith@techcorp.com', '+1-555-0123', 'TechCorp Solutions', 'IT Director', 'Technology', 'Website', 'New', '50000', 'Q2 2024', '123 Tech St', 'San Francisco', 'CA', '94105', 'USA', 'https://techcorp.com', '201-500', '5000000', 'Sarah Johnson']
    ]
  }
];

// Lead Assignment Rules Mock Data
export const mockLeadAssignmentRules = [
  {
    id: '1',
    name: 'Territory-Based Assignment',
    description: 'Assign leads based on geographic territory',
    isActive: true,
    priority: 1,
    conditions: [
      { field: 'state', operator: 'equals', value: 'CA', weight: 1 },
      { field: 'state', operator: 'equals', value: 'NV', weight: 1 }
    ],
    assignTo: 'Sarah Johnson',
    matchCount: 45
  },
  {
    id: '2',
    name: 'Industry Specialization',
    description: 'Assign technology leads to tech specialists',
    isActive: true,
    priority: 2,
    conditions: [
      { field: 'industry', operator: 'equals', value: 'Technology', weight: 1 },
      { field: 'industry', operator: 'equals', value: 'Software', weight: 1 }
    ],
    assignTo: 'Mike Wilson',
    matchCount: 32
  },
  {
    id: '3',
    name: 'High-Value Leads',
    description: 'Assign high-budget leads to senior reps',
    isActive: true,
    priority: 3,
    conditions: [
      { field: 'budget', operator: 'greater_than', value: '100000', weight: 1 }
    ],
    assignTo: 'Emily Davis',
    matchCount: 18
  },
  {
    id: '4',
    name: 'Round Robin Default',
    description: 'Default round-robin assignment for unmatched leads',
    isActive: true,
    priority: 999,
    conditions: [],
    assignTo: 'Round Robin',
    matchCount: 156
  }
];

// Lead Nurturing Campaigns Mock Data
export const mockNurturingCampaigns = [
  {
    id: '1',
    name: 'New Lead Welcome Series',
    description: 'Automated welcome sequence for new leads',
    status: 'Active',
    triggerConditions: [
      { field: 'status', operator: 'equals', value: 'New' }
    ],
    steps: [
      {
        id: '1',
        name: 'Welcome Email',
        type: 'email',
        delay: 0,
        templateId: 'welcome-template',
        subject: 'Welcome to Our Community',
        isActive: true
      },
      {
        id: '2',
        name: 'Company Overview',
        type: 'email',
        delay: 24,
        templateId: 'company-overview',
        subject: 'Learn More About Our Solutions',
        isActive: true
      },
      {
        id: '3',
        name: 'Case Study',
        type: 'email',
        delay: 72,
        templateId: 'case-study',
        subject: 'See How We Helped Companies Like Yours',
        isActive: true
      },
      {
        id: '4',
        name: 'Demo Invitation',
        type: 'email',
        delay: 168,
        templateId: 'demo-invitation',
        subject: 'Ready for a Personalized Demo?',
        isActive: true
      }
    ],
    metrics: {
      enrolled: 245,
      completed: 89,
      optedOut: 12,
      converted: 34
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Enterprise Lead Nurturing',
    description: 'Specialized nurturing for enterprise prospects',
    status: 'Active',
    triggerConditions: [
      { field: 'companySize', operator: 'equals', value: '500+' },
      { field: 'budget', operator: 'greater_than', value: '50000' }
    ],
    steps: [
      {
        id: '1',
        name: 'Enterprise Welcome',
        type: 'email',
        delay: 0,
        templateId: 'enterprise-welcome',
        subject: 'Enterprise Solutions for Your Business',
        isActive: true
      },
      {
        id: '2',
        name: 'ROI Calculator',
        type: 'email',
        delay: 48,
        templateId: 'roi-calculator',
        subject: 'Calculate Your Potential ROI',
        isActive: true
      },
      {
        id: '3',
        name: 'Executive Brief',
        type: 'email',
        delay: 120,
        templateId: 'executive-brief',
        subject: 'Executive Brief: Digital Transformation',
        isActive: true
      },
      {
        id: '4',
        name: 'Schedule Consultation',
        type: 'task',
        delay: 240,
        assignedTo: 'Account Executive',
        description: 'Schedule executive consultation call',
        isActive: true
      }
    ],
    metrics: {
      enrolled: 67,
      completed: 23,
      optedOut: 3,
      converted: 18
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  }
];

// Lead Source Tracking Mock Data
export const mockLeadSources = [
  {
    id: '1',
    name: 'Website',
    description: 'Organic website visitors and form submissions',
    category: 'Digital',
    isActive: true,
    trackingCode: 'WEB001',
    metrics: {
      totalLeads: 1245,
      qualifiedLeads: 456,
      convertedLeads: 89,
      conversionRate: 19.5,
      averageScore: 72,
      averageValue: 45000,
      cost: 12500,
      costPerLead: 10.04,
      roi: 285
    }
  },
  {
    id: '2',
    name: 'Google Ads',
    description: 'Paid search advertising campaigns',
    category: 'Paid Advertising',
    isActive: true,
    trackingCode: 'GAD001',
    metrics: {
      totalLeads: 892,
      qualifiedLeads: 378,
      convertedLeads: 76,
      conversionRate: 20.1,
      averageScore: 68,
      averageValue: 52000,
      cost: 25000,
      costPerLead: 28.03,
      roi: 158
    }
  },
  {
    id: '3',
    name: 'LinkedIn',
    description: 'LinkedIn advertising and organic content',
    category: 'Social Media',
    isActive: true,
    trackingCode: 'LIN001',
    metrics: {
      totalLeads: 567,
      qualifiedLeads: 289,
      convertedLeads: 67,
      conversionRate: 23.2,
      averageScore: 78,
      averageValue: 68000,
      cost: 18000,
      costPerLead: 31.75,
      roi: 245
    }
  },
  {
    id: '4',
    name: 'Email Marketing',
    description: 'Email campaigns and newsletters',
    category: 'Email',
    isActive: true,
    trackingCode: 'EML001',
    metrics: {
      totalLeads: 734,
      qualifiedLeads: 312,
      convertedLeads: 58,
      conversionRate: 18.6,
      averageScore: 65,
      averageValue: 38000,
      cost: 5000,
      costPerLead: 6.81,
      roi: 440
    }
  },
  {
    id: '5',
    name: 'Referrals',
    description: 'Customer and partner referrals',
    category: 'Referral',
    isActive: true,
    trackingCode: 'REF001',
    metrics: {
      totalLeads: 234,
      qualifiedLeads: 198,
      convertedLeads: 89,
      conversionRate: 44.9,
      averageScore: 85,
      averageValue: 95000,
      cost: 2000,
      costPerLead: 8.55,
      roi: 4225
    }
  },
  {
    id: '6',
    name: 'Trade Shows',
    description: 'Industry events and trade shows',
    category: 'Events',
    isActive: true,
    trackingCode: 'EVT001',
    metrics: {
      totalLeads: 456,
      qualifiedLeads: 234,
      convertedLeads: 45,
      conversionRate: 19.2,
      averageScore: 71,
      averageValue: 78000,
      cost: 35000,
      costPerLead: 76.75,
      roi: 98
    }
  }
];

// Lead Qualification Workflows Mock Data
export const mockQualificationWorkflows = [
  {
    id: '1',
    name: 'BANT Qualification',
    description: 'Budget, Authority, Need, Timeline qualification process',
    isActive: true,
    steps: [
      {
        id: '1',
        name: 'Budget Assessment',
        description: 'Determine if prospect has budget for solution',
        criteria: [
          { question: 'What is your budget range for this project?', required: true, type: 'select', options: ['<$10K', '$10K-$50K', '$50K-$100K', '$100K+'] },
          { question: 'Is budget approved?', required: true, type: 'boolean' },
          { question: 'When is budget available?', required: true, type: 'select', options: ['Immediately', 'This Quarter', 'Next Quarter', 'This Year'] }
        ],
        passingScore: 2,
        weight: 0.3
      },
      {
        id: '2',
        name: 'Authority Verification',
        description: 'Confirm decision-making authority',
        criteria: [
          { question: 'Are you the primary decision maker?', required: true, type: 'boolean' },
          { question: 'Who else is involved in the decision?', required: false, type: 'text' },
          { question: 'What is your role in the evaluation process?', required: true, type: 'select', options: ['Decision Maker', 'Influencer', 'User', 'Gatekeeper'] }
        ],
        passingScore: 2,
        weight: 0.25
      },
      {
        id: '3',
        name: 'Need Identification',
        description: 'Understand business needs and pain points',
        criteria: [
          { question: 'What business challenge are you trying to solve?', required: true, type: 'text' },
          { question: 'How are you currently handling this?', required: true, type: 'text' },
          { question: 'What happens if you don\'t solve this problem?', required: true, type: 'text' },
          { question: 'How important is solving this problem?', required: true, type: 'select', options: ['Critical', 'Important', 'Nice to Have'] }
        ],
        passingScore: 3,
        weight: 0.25
      },
      {
        id: '4',
        name: 'Timeline Assessment',
        description: 'Determine implementation timeline',
        criteria: [
          { question: 'When do you need a solution in place?', required: true, type: 'select', options: ['Immediately', 'Within 3 months', 'Within 6 months', 'Within 1 year', 'No specific timeline'] },
          { question: 'What is driving this timeline?', required: false, type: 'text' },
          { question: 'Are there any constraints affecting the timeline?', required: false, type: 'text' }
        ],
        passingScore: 1,
        weight: 0.2
      }
    ],
    qualificationThreshold: 70,
    autoAdvanceOnPass: true,
    nextStageOnPass: 'Qualified',
    nextStageOnFail: 'Disqualified'
  },
  {
    id: '2',
    name: 'MEDDIC Qualification',
    description: 'Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion',
    isActive: false,
    steps: [
      {
        id: '1',
        name: 'Metrics',
        description: 'Quantify the business impact',
        criteria: [
          { question: 'What metrics will you use to measure success?', required: true, type: 'text' },
          { question: 'What is the current baseline for these metrics?', required: true, type: 'text' },
          { question: 'What improvement are you targeting?', required: true, type: 'text' }
        ],
        passingScore: 2,
        weight: 0.2
      },
      {
        id: '2',
        name: 'Economic Buyer',
        description: 'Identify who controls the budget',
        criteria: [
          { question: 'Who has the authority to approve this purchase?', required: true, type: 'text' },
          { question: 'Have you spoken with the economic buyer?', required: true, type: 'boolean' },
          { question: 'What is their view on this initiative?', required: false, type: 'text' }
        ],
        passingScore: 2,
        weight: 0.2
      }
    ],
    qualificationThreshold: 75,
    autoAdvanceOnPass: true,
    nextStageOnPass: 'Qualified',
    nextStageOnFail: 'Nurturing'
  }
];

// Lead Communication Templates Mock Data
export const mockCommunicationTemplates = [
  {
    id: '1',
    name: 'Initial Outreach',
    type: 'email',
    category: 'Prospecting',
    subject: 'Quick question about {{company}} operations',
    body: `Hi {{firstName}},

I noticed that {{company}} is in the {{industry}} industry, and I wanted to reach out because we've been helping similar companies streamline their operations and reduce costs.

I'd love to learn more about your current challenges and see if there might be a fit. Would you be open to a brief 15-minute conversation this week?

Best regards,
{{senderName}}`,
    variables: ['firstName', 'company', 'industry', 'senderName'],
    isActive: true,
    usage: 245,
    openRate: 34.2,
    responseRate: 8.7
  },
  {
    id: '2',
    name: 'Follow-up After Demo',
    type: 'email',
    category: 'Follow-up',
    subject: 'Thanks for your time today - next steps',
    body: `Hi {{firstName}},

Thank you for taking the time to see our demo today. I hope you found it valuable and that it addressed your key concerns around {{painPoint}}.

As discussed, I'm attaching:
- The ROI calculator we mentioned
- Case study from {{similarCompany}}
- Pricing information for the {{productName}} solution

I'd love to schedule a follow-up call to discuss any questions and talk about next steps. Are you available {{suggestedTime}}?

Best regards,
{{senderName}}`,
    variables: ['firstName', 'painPoint', 'similarCompany', 'productName', 'suggestedTime', 'senderName'],
    isActive: true,
    usage: 189,
    openRate: 67.8,
    responseRate: 23.4
  },
  {
    id: '3',
    name: 'Re-engagement Campaign',
    type: 'email',
    category: 'Nurturing',
    subject: 'Still thinking about {{solution}}?',
    body: `Hi {{firstName}},

I wanted to follow up on our conversation about {{solution}} for {{company}}. I know these decisions take time, and I don't want to be pushy, but I also don't want you to miss out on the benefits we discussed.

Since we last spoke, we've had some great results with companies like yours:
- {{recentWin}} saw a {{improvement}} improvement in {{metric}}
- We've launched new features that address {{specificNeed}}

If the timing isn't right now, I completely understand. Would it be helpful if I checked back in {{timeframe}}?

Best regards,
{{senderName}}`,
    variables: ['firstName', 'solution', 'company', 'recentWin', 'improvement', 'metric', 'specificNeed', 'timeframe', 'senderName'],
    isActive: true,
    usage: 156,
    openRate: 28.9,
    responseRate: 12.1
  },
  {
    id: '4',
    name: 'Cold Call Script',
    type: 'call',
    category: 'Prospecting',
    subject: 'Cold Call Opening',
    body: `Hi {{firstName}}, this is {{senderName}} from {{companyName}}.

I know I'm calling out of the blue, so I'll be brief. I'm reaching out because we work with {{industry}} companies like {{company}} to help them {{primaryBenefit}}.

I'm not sure if this is something you're currently looking at, but I'd love to ask you a couple of quick questions to see if there might be a fit.

Do you have 30 seconds for me to explain why I'm calling?

[If yes]: Great! We've been working with companies like {{similarCompany}} to help them {{specificBenefit}}. Are you currently facing any challenges with {{commonPainPoint}}?

[If no]: I understand you're busy. Would there be a better time to reach you, or would you prefer I send you some information via email?`,
    variables: ['firstName', 'senderName', 'companyName', 'industry', 'company', 'primaryBenefit', 'similarCompany', 'specificBenefit', 'commonPainPoint'],
    isActive: true,
    usage: 78,
    openRate: null,
    responseRate: 15.4
  }
];

// Lead Reporting Dashboards Mock Data
export const mockLeadReports = [
  {
    id: '1',
    name: 'Lead Pipeline Overview',
    description: 'High-level view of lead pipeline and conversion metrics',
    type: 'dashboard',
    widgets: [
      {
        id: '1',
        type: 'metric',
        title: 'Total Leads',
        value: 2456,
        change: 12.5,
        period: 'vs last month'
      },
      {
        id: '2',
        type: 'metric',
        title: 'Qualified Leads',
        value: 892,
        change: 8.3,
        period: 'vs last month'
      },
      {
        id: '3',
        type: 'metric',
        title: 'Conversion Rate',
        value: 24.5,
        change: -2.1,
        period: 'vs last month',
        format: 'percentage'
      },
      {
        id: '4',
        type: 'chart',
        title: 'Lead Sources',
        chartType: 'pie',
        data: [
          { name: 'Website', value: 35.2 },
          { name: 'Google Ads', value: 28.7 },
          { name: 'LinkedIn', value: 18.9 },
          { name: 'Email', value: 12.4 },
          { name: 'Referrals', value: 4.8 }
        ]
      },
      {
        id: '5',
        type: 'chart',
        title: 'Lead Trend',
        chartType: 'line',
        data: [
          { month: 'Jan', leads: 234, qualified: 89 },
          { month: 'Feb', leads: 267, qualified: 98 },
          { month: 'Mar', leads: 298, qualified: 112 },
          { month: 'Apr', leads: 245, qualified: 95 },
          { month: 'May', leads: 289, qualified: 118 }
        ]
      }
    ],
    filters: ['dateRange', 'source', 'assignedTo', 'status'],
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sales Rep Performance',
    description: 'Individual sales rep lead management performance',
    type: 'report',
    widgets: [
      {
        id: '1',
        type: 'table',
        title: 'Rep Performance',
        columns: ['Rep Name', 'Leads Assigned', 'Leads Contacted', 'Leads Qualified', 'Conversion Rate', 'Avg Response Time'],
        data: [
          { repName: 'Sarah Johnson', assigned: 145, contacted: 132, qualified: 67, conversionRate: 46.2, avgResponseTime: '2.3 hours' },
          { repName: 'Mike Wilson', assigned: 134, contacted: 128, qualified: 58, conversionRate: 43.3, avgResponseTime: '3.1 hours' },
          { repName: 'Emily Davis', assigned: 156, contacted: 142, qualified: 45.5, avgResponseTime: '1.8 hours' }
        ]
      }
    ],
    filters: ['dateRange', 'rep', 'team'],
    isPublic: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  }
];