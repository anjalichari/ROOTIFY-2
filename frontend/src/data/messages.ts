import { ChatMessage, SupportIssue, SettlementRecord } from '../types';

export const INITIAL_MESSAGES: ChatMessage[] = [
  // Vendor <-> Delivery Partner chat for ord-1002
  {
    id: 'msg-1',
    conversationId: 'ord-1002-vendor',
    orderId: 'ord-1002',
    senderId: 'v-divar-shg',
    senderRole: 'vendor',
    senderName: 'Divar Island Mahila Mandal SHG',
    text: 'Hello Rohan, the package with Recheado paste & Balchao is sealed in a corrugated box with fragile tape.',
    timestamp: '2026-10-03T10:46:00Z',
    isRead: true,
  },
  {
    id: 'msg-2',
    conversationId: 'ord-1002-vendor',
    orderId: 'ord-1002',
    senderId: 'user-delivery-rohan',
    senderRole: 'delivery',
    senderName: 'Rohan Naik',
    text: 'Got it! I am just taking the ferry from Ribandar to Divar right now. Will reach in 10 minutes.',
    timestamp: '2026-10-03T10:48:00Z',
    isRead: true,
  },
  // Customer <-> Delivery Partner chat for ord-1002
  {
    id: 'msg-3',
    conversationId: 'ord-1002-customer',
    orderId: 'ord-1002',
    senderId: 'user-customer-demo',
    senderRole: 'customer',
    senderName: 'Sumedh Dessai',
    text: 'Hi Rohan, please ring the bell at House 42 or leave with security at the gate if I am on a call.',
    timestamp: '2026-10-03T10:50:00Z',
    isRead: false,
  },
];

export const INITIAL_ISSUES: SupportIssue[] = [
  {
    id: 'iss-101',
    orderId: 'ord-prev-09',
    orderNumber: 'RTF-98310',
    customerId: 'user-customer-demo',
    customerName: 'Sumedh Dessai',
    vendorId: 'v-salcete-confectionery',
    vendorName: 'Salcete Heritage Confectioners',
    issueType: 'damaged_item',
    description: 'One packet of Bolinhas arrived crushed during transit.',
    requestedRefundAmount: 220,
    status: 'OPEN',
    createdAt: '2026-10-01T15:20:00Z',
  },
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'stl-501',
    vendorId: 'v-maria-foods',
    vendorName: "Maria's Traditional Foods",
    orderId: 'ord-1001',
    orderNumber: 'RTF-98421',
    orderAmount: 560,
    platformCommission: 28, // 5%
    vendorPayable: 532,
    status: 'SETTLED',
    deliveredAt: '2026-10-02T12:45:00Z',
    settledAt: '2026-10-02T18:00:00Z',
  },
  {
    id: 'stl-502',
    vendorId: 'v-divar-shg',
    vendorName: 'Divar Island Mahila Mandal SHG',
    orderId: 'ord-1002',
    orderNumber: 'RTF-98422',
    orderAmount: 700,
    platformCommission: 35,
    vendorPayable: 665,
    status: 'PENDING',
    deliveredAt: '',
  },
];
