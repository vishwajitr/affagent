import { ContactStatus, CallStatus } from '@prisma/client';

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ContactFilters extends PaginationQuery {
  status?: ContactStatus;
  search?: string;
}

export interface CreateCampaignBody {
  name: string;
  script: string;
}

export interface TwilioWebhookBody {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Digits?: string;
  campaignId?: string;
  contactId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export { ContactStatus, CallStatus };
