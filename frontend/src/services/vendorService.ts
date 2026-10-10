import { Vendor, VendorStatus, VendorDocument } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_VENDORS } from '../data/vendors';

export interface IVendorService {
  getAllVendors(): Promise<Vendor[]>;
  getVendorById(id: string): Promise<Vendor | null>;
  getVendorByUserId(userId: string): Promise<Vendor | null>;
  registerVendor(data: {
    userId: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    village: string;
    taluka: string;
    district: 'North Goa' | 'South Goa';
    description: string;
    story: string;
    category: string;
    productCategories: string[];
    isShgOrMahilaMandal: boolean;
    shgName?: string;
    documents: VendorDocument[];
  }): Promise<Vendor>;
  resubmitApplication(vendorId: string, updates: Partial<Vendor>): Promise<Vendor>;
  approveVendor(vendorId: string): Promise<Vendor>;
  rejectVendor(vendorId: string, reason: string): Promise<Vendor>;
  updateVendorProfile(vendorId: string, updates: Partial<Vendor>): Promise<Vendor>;
}

class MockVendorService implements IVendorService {
  async getAllVendors(): Promise<Vendor[]> {
    return getStoredItem<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  }

  async getVendorById(id: string): Promise<Vendor | null> {
    const vendors = await this.getAllVendors();
    return vendors.find((v) => v.id === id) || null;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | null> {
    const vendors = await this.getAllVendors();
    return vendors.find((v) => v.userId === userId) || null;
  }

  async registerVendor(data: {
    userId: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    village: string;
    taluka: string;
    district: 'North Goa' | 'South Goa';
    description: string;
    story: string;
    category: string;
    productCategories: string[];
    isShgOrMahilaMandal: boolean;
    shgName?: string;
    documents: VendorDocument[];
  }): Promise<Vendor> {
    const vendors = await this.getAllVendors();
    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      userId: data.userId,
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      village: data.village,
      taluka: data.taluka,
      district: data.district,
      description: data.description,
      story: data.story,
      category: data.category,
      productCategories: data.productCategories,
      bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      rating: 5.0,
      reviewCount: 0,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      documents: data.documents,
      isShgOrMahilaMandal: data.isShgOrMahilaMandal,
      shgName: data.shgName,
      serviceableTalukas: [data.taluka],
      vendorScore: {
        overall: 80,
        certificationScore: 85,
        ratingScore: 80,
        consistencyScore: 80,
        originAuthenticityScore: 85,
      },
    };

    const updated = [newVendor, ...vendors];
    setStoredItem(STORAGE_KEYS.VENDORS, updated);
    return newVendor;
  }

  async resubmitApplication(vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    const vendors = await this.getAllVendors();
    const index = vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) throw new Error('Vendor not found');

    const updated: Vendor = {
      ...vendors[index],
      ...updates,
      status: 'pending',
      rejectionReason: undefined,
      submittedAt: new Date().toISOString(),
    };

    vendors[index] = updated;
    setStoredItem(STORAGE_KEYS.VENDORS, vendors);
    return updated;
  }

  async approveVendor(vendorId: string): Promise<Vendor> {
    const vendors = await this.getAllVendors();
    const index = vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) throw new Error('Vendor not found');

    const updated: Vendor = {
      ...vendors[index],
      status: 'approved',
      rejectionReason: undefined,
      approvedAt: new Date().toISOString(),
      documents: vendors[index].documents.map((d) => ({ ...d, verified: true })),
    };

    vendors[index] = updated;
    setStoredItem(STORAGE_KEYS.VENDORS, vendors);
    return updated;
  }

  async rejectVendor(vendorId: string, reason: string): Promise<Vendor> {
    const vendors = await this.getAllVendors();
    const index = vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) throw new Error('Vendor not found');

    const updated: Vendor = {
      ...vendors[index],
      status: 'rejected',
      rejectionReason: reason,
    };

    vendors[index] = updated;
    setStoredItem(STORAGE_KEYS.VENDORS, vendors);
    return updated;
  }

  async updateVendorProfile(vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    const vendors = await this.getAllVendors();
    const index = vendors.findIndex((v) => v.id === vendorId);
    if (index === -1) throw new Error('Vendor not found');

    const updated = { ...vendors[index], ...updates };
    vendors[index] = updated;
    setStoredItem(STORAGE_KEYS.VENDORS, vendors);
    return updated;
  }
}

export const vendorService = new MockVendorService();
