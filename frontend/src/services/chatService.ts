import { ChatMessage, SupportIssue, SettlementRecord, User } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_MESSAGES, INITIAL_ISSUES, INITIAL_SETTLEMENTS } from '../data/messages';
import { DEMO_USERS } from '../data/users';

export interface IChatService {
  getMessagesByOrder(orderId: string): Promise<ChatMessage[]>;
  getMessagesByConversation(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): Promise<ChatMessage>;
  markAsRead(conversationId: string, currentUserId: string): Promise<void>;
}

class MockChatService implements IChatService {
  async getMessagesByOrder(orderId: string): Promise<ChatMessage[]> {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.orderId === orderId);
  }

  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.conversationId === conversationId);
  }

  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>): Promise<ChatMessage> {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const updated = [...all, newMsg];
    setStoredItem(STORAGE_KEYS.MESSAGES, updated);
    return newMsg;
  }

  async markAsRead(conversationId: string, currentUserId: string): Promise<void> {
    const all = getStoredItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const updated = all.map((m) => {
      if (m.conversationId === conversationId && m.senderId !== currentUserId) {
        return { ...m, isRead: true };
      }
      return m;
    });
    setStoredItem(STORAGE_KEYS.MESSAGES, updated);
  }
}

export const chatService = new MockChatService();

export interface IAdminService {
  getAllUsers(): Promise<User[]>;
  getSupportIssues(): Promise<SupportIssue[]>;
  resolveIssue(issueId: string, resolution: 'REFUNDED' | 'RESOLVED_NO_REFUND' | 'REJECTED', note?: string): Promise<SupportIssue>;
  getSettlements(): Promise<SettlementRecord[]>;
  settleVendorPayout(settlementId: string): Promise<SettlementRecord>;
}

class MockAdminService implements IAdminService {
  async getAllUsers(): Promise<User[]> {
    return getStoredItem<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
  }

  async getSupportIssues(): Promise<SupportIssue[]> {
    return getStoredItem<SupportIssue[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
  }

  async resolveIssue(
    issueId: string,
    resolution: 'REFUNDED' | 'RESOLVED_NO_REFUND' | 'REJECTED',
    note?: string
  ): Promise<SupportIssue> {
    const issues = await this.getSupportIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');

    const updated: SupportIssue = {
      ...issues[index],
      status: resolution,
      resolutionNote: note || `Resolved as ${resolution}`,
    };

    issues[index] = updated;
    setStoredItem(STORAGE_KEYS.ISSUES, issues);
    return updated;
  }

  async getSettlements(): Promise<SettlementRecord[]> {
    return getStoredItem<SettlementRecord[]>(STORAGE_KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
  }

  async settleVendorPayout(settlementId: string): Promise<SettlementRecord> {
    const settlements = await this.getSettlements();
    const index = settlements.findIndex((s) => s.id === settlementId);
    if (index === -1) throw new Error('Settlement record not found');

    const updated: SettlementRecord = {
      ...settlements[index],
      status: 'SETTLED',
      settledAt: new Date().toISOString(),
    };

    settlements[index] = updated;
    setStoredItem(STORAGE_KEYS.SETTLEMENTS, settlements);
    return updated;
  }
}

export const adminService = new MockAdminService();
