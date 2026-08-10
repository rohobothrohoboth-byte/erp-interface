export interface Campaign {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type TargetType = 'Lead' | 'Customer';
export type RecipientType = 'Single' | 'Multiple';
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Sent';

export interface EmailCampaign {
  id: string;
  campaignId: string;
  campaignName: string;
  targetFor: TargetType;
  recipientType: RecipientType;
  recipientId?: string; // For single recipient
  recipientName?: string; // For display
  isAllRecipients?: boolean; // For multiple - "All" option
  subject: string;
  content: string;
  startDate?: string;
  status: CampaignStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface SMSCampaign {
  id: string;
  campaignId: string;
  campaignName: string;
  targetFor: TargetType;
  recipientType: RecipientType;
  recipientId?: string; // For single recipient
  recipientName?: string; // For display
  isAllRecipients?: boolean; // For multiple - "All" option
  message: string;
  startDate?: string;
  status: CampaignStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
