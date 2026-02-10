export interface WhatsAppConfig {
  method: 'official' | 'gateway' | 'manual';
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  gatewayUrl?: string;
  gatewayApiKey?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  group: string;
  status: 'active' | 'inactive';
  isGoogleContact?: boolean;
}

export interface InternalGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  contactIds?: string[];
}

export interface ScheduledMessage {
  id: string;
  groupId: string;
  content: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed';
  attachment?: string; 
}

export interface Material {
  id: string;
  name: string;
  unit: string;
}

export interface OrderItem {
  id: string;
  materialName: string;
  unit: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  contactId: string;
  contactName: string;
  city: string;
  description: string;
  items?: OrderItem[];
  deliveryDate: string;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  issueInvoice: boolean;
  nfIssued?: boolean; 
  receiptData?: {
    fullName: string;
    document: string;
    receivedAt: string;
    signature: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'client';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isUnread?: boolean;
  tags?: string[];
  messages: ChatMessage[];
}

export type ViewState = 'dashboard' | 'contacts' | 'scheduler' | 'order-scheduler' | 'settings' | 'inbox' | 'reports';