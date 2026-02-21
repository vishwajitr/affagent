export type ContactStatus =
  | 'NOT_CALLED'
  | 'CALLED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'NO_ANSWER'
  | 'FAILED';

export type CallStatus = 'INITIATED' | 'RINGING' | 'ANSWERED' | 'FAILED';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: ContactStatus;
  lastResponse: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  script: string;
  createdAt: string;
  _count?: { calls: number };
}

export interface Call {
  id: string;
  contactId: string;
  campaignId: string;
  callSid: string | null;
  callStatus: CallStatus;
  userInput: string | null;
  duration: number | null;
  createdAt: string;
  contact?: Contact;
}

export interface DashboardStats {
  totalContacts: number;
  totalCalls: number;
  interested: number;
  notInterested: number;
  noAnswer: number;
  failed: number;
  called: number;
  successRate: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
