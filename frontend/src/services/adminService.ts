import { SupportIssue, SettlementRecord, User } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_ISSUES, INITIAL_SETTLEMENTS } from '../data/messages';
import { DEMO_USERS } from '../data/users';

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
