import QRCode from 'qrcode';
import {
  ProductBatch,
  OriginPassport,
  PassportMedia,
  QRScanLog,
  BatchStatus,
  VerificationStatus,
} from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_BATCHES, INITIAL_ORIGIN_PASSPORTS, INITIAL_PASSPORT_MEDIA } from '../data/passports';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CreateBatchInput {
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  batchNumber: string;
  harvestDate: string;
  productionDate: string;
  bestBeforeDate?: string;
  unitsProduced: number;
  originVillage: string;
  originTaluka: string;
  originDistrict: 'North Goa' | 'South Goa';
  traditionalMethodSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  ingredientsSourcing: Array<{
    ingredient: string;
    sourceVillage: string;
    sourceTaluka: string;
    isLocalGoan: boolean;
    harvestSeason?: string;
  }>;
  claims: Array<{
    claimType: 'GI_TAG' | 'FSSAI' | 'SHG_CERT' | 'TRADITIONAL_RECIPE' | 'PANCHAYAT_NOC' | 'ORGANIC_PRACTICE';
    claimName: string;
    certificateNumber?: string;
    evidenceSummary: string;
  }>;
  publicNotes?: string;
}

class PassportService {
  // ============================================================================
  // 1. QR CODE GENERATION (High-Res PNG & Vector SVG)
  // ============================================================================

  // Generate high-resolution PNG data URL for printing on packaging labels
  async generatePNG(text: string, width = 1024): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width,
        margin: 2,
        color: {
          dark: '#155E52', // ROOTIFY Deep Forest Green
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // Highest error correction for packaging
      });
    } catch (err) {
      console.error('Error generating PNG QR:', err);
      throw err;
    }
  }

  // Generate scalable Vector SVG string for professional packaging print
  async generateSVG(text: string): Promise<string> {
    try {
      return await QRCode.toString(text, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#155E52',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
    } catch (err) {
      console.error('Error generating SVG QR:', err);
      throw err;
    }
  }

  // Generate unique unpredictable batch code
  private generateSecureBatchCode(productName: string): string {
    const prefix = productName
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'RTF';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const datePart = new Date().toISOString().slice(2, 7).replace('-', '');
    return `RTF-${prefix}-${datePart}${rand}`;
  }

  // Get stable public URL for a QR code
  getBatchPassportUrl(batchCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rootify.goa';
    return `${origin}/passport/batch/${batchCode}`;
  }

  getVendorPassportUrl(vendorId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rootify.goa';
    return `${origin}/passport/vendor/${vendorId}`;
  }

  // ============================================================================
  // 2. PRODUCT BATCHES
  // ============================================================================

  async getAllBatches(): Promise<ProductBatch[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('product_batches')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as ProductBatch[];
    }
    return getStoredItem<ProductBatch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  }

  async getBatchesByVendor(vendorId: string): Promise<ProductBatch[]> {
    const batches = await this.getAllBatches();
    return batches.filter((b) => b.vendorId === vendorId);
  }

  async getBatchByCode(batchCode: string): Promise<ProductBatch | null> {
    const batches = await this.getAllBatches();
    return batches.find((b) => b.batchCode.toLowerCase() === batchCode.toLowerCase()) || null;
  }

  async getBatchById(id: string): Promise<ProductBatch | null> {
    const batches = await this.getAllBatches();
    return batches.find((b) => b.id === id) || null;
  }

  // Approved vendor creates a product batch and requests Origin Passport QR
  async createBatch(input: CreateBatchInput): Promise<{ batch: ProductBatch; passport: OriginPassport }> {
    const batches = await this.getAllBatches();
    const passports = await this.getAllPassports();

    // Generate unique batch code
    let batchCode = this.generateSecureBatchCode(input.productName);
    while (batches.some((b) => b.batchCode === batchCode)) {
      batchCode = this.generateSecureBatchCode(input.productName);
    }

    const batchId = `batch-${Date.now()}`;
    const passportId = `pass-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newBatch: ProductBatch = {
      id: batchId,
      batchCode,
      productId: input.productId,
      productName: input.productName,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      batchNumber: input.batchNumber,
      harvestDate: input.harvestDate,
      productionDate: input.productionDate,
      bestBeforeDate: input.bestBeforeDate,
      unitsProduced: input.unitsProduced,
      status: 'pending', // Requires admin review
      qrCodeUrl: this.getBatchPassportUrl(batchCode),
      scanCount: 0,
      createdAt: timestamp,
    };

    const newPassport: OriginPassport = {
      id: passportId,
      batchId,
      batchCode,
      productId: input.productId,
      vendorId: input.vendorId,
      verificationStatus: 'pending_review',
      originVillage: input.originVillage,
      originTaluka: input.originTaluka,
      originDistrict: input.originDistrict,
      traditionalMethodSteps: input.traditionalMethodSteps,
      ingredientsSourcing: input.ingredientsSourcing,
      claimsReviewed: input.claims.map((c) => ({
        claimType: c.claimType,
        claimName: c.claimName,
        certificateNumber: c.certificateNumber,
        verified: false,
        evidenceSummary: c.evidenceSummary,
      })),
      independentTestingStatus: 'Under initial administrative review by Rootify field audit team.',
      antiTamperDisclaimer:
        'This QR code verifies Rootify digital batch records and reviewed heritage claims. Please inspect the tamper-evident physical seal on the container before opening.',
      publicNotes: input.publicNotes,
      createdAt: timestamp,
    };

    // Save locally
    const updatedBatches = [newBatch, ...batches];
    const updatedPassports = [newPassport, ...passports];
    setStoredItem(STORAGE_KEYS.BATCHES, updatedBatches);
    setStoredItem(STORAGE_KEYS.PASSPORTS, updatedPassports);

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('product_batches').insert([newBatch]);
      await supabase.from('origin_passports').insert([newPassport]);
    }

    return { batch: newBatch, passport: newPassport };
  }

  // Admin approves batch and activates QR passport
  async approveBatch(
    batchId: string,
    reviewerName: string,
    notes?: string
  ): Promise<{ batch: ProductBatch; passport: OriginPassport }> {
    const batches = await this.getAllBatches();
    const batchIndex = batches.findIndex((b) => b.id === batchId);
    if (batchIndex === -1) throw new Error('Batch not found');

    const timestamp = new Date().toISOString();
    const updatedBatch: ProductBatch = {
      ...batches[batchIndex],
      status: 'active',
      reviewedBy: reviewerName,
      reviewedAt: timestamp,
      reviewNotes: notes || 'Origin claims and preparation verification approved by Rootify auditor.',
    };
    batches[batchIndex] = updatedBatch;
    setStoredItem(STORAGE_KEYS.BATCHES, batches);

    // Update passport status
    const passports = await this.getAllPassports();
    const passportIndex = passports.findIndex((p) => p.batchId === batchId);
    let updatedPassport: OriginPassport;
    if (passportIndex !== -1) {
      updatedPassport = {
        ...passports[passportIndex],
        verificationStatus: 'verified_with_evidence',
        updatedAt: timestamp,
        claimsReviewed: passports[passportIndex].claimsReviewed.map((c) => ({
          ...c,
          verified: true,
          reviewDate: timestamp.slice(0, 10),
          reviewerName,
        })),
      };
      passports[passportIndex] = updatedPassport;
      setStoredItem(STORAGE_KEYS.PASSPORTS, passports);
    } else {
      throw new Error('Passport record missing for batch');
    }

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('product_batches').update(updatedBatch).eq('id', batchId);
      await supabase.from('origin_passports').update(updatedPassport).eq('id', updatedPassport.id);
    }

    return { batch: updatedBatch, passport: updatedPassport };
  }

  // Admin revokes batch QR due to tamper/recall
  async revokeBatch(
    batchId: string,
    reviewerName: string,
    reason: string
  ): Promise<{ batch: ProductBatch; passport?: OriginPassport }> {
    const batches = await this.getAllBatches();
    const batchIndex = batches.findIndex((b) => b.id === batchId);
    if (batchIndex === -1) throw new Error('Batch not found');

    const timestamp = new Date().toISOString();
    const updatedBatch: ProductBatch = {
      ...batches[batchIndex],
      status: 'revoked',
      reviewedBy: reviewerName,
      reviewedAt: timestamp,
      revocationReason: reason,
    };
    batches[batchIndex] = updatedBatch;
    setStoredItem(STORAGE_KEYS.BATCHES, batches);

    const passports = await this.getAllPassports();
    const passportIndex = passports.findIndex((p) => p.batchId === batchId);
    let updatedPassport: OriginPassport | undefined;
    if (passportIndex !== -1) {
      updatedPassport = {
        ...passports[passportIndex],
        verificationStatus: 'revoked',
        updatedAt: timestamp,
      };
      passports[passportIndex] = updatedPassport;
      setStoredItem(STORAGE_KEYS.PASSPORTS, passports);
    }

    return { batch: updatedBatch, passport: updatedPassport };
  }

  // ============================================================================
  // 3. ORIGIN PASSPORTS
  // ============================================================================

  async getAllPassports(): Promise<OriginPassport[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('origin_passports').select('*');
      if (!error && data) return data as OriginPassport[];
    }
    return getStoredItem<OriginPassport[]>(STORAGE_KEYS.PASSPORTS, INITIAL_ORIGIN_PASSPORTS);
  }

  async getPassportByBatchCode(batchCode: string): Promise<OriginPassport | null> {
    const passports = await this.getAllPassports();
    return passports.find((p) => p.batchCode.toLowerCase() === batchCode.toLowerCase()) || null;
  }

  async getPassportByBatchId(batchId: string): Promise<OriginPassport | null> {
    const passports = await this.getAllPassports();
    return passports.find((p) => p.batchId === batchId) || null;
  }

  // ============================================================================
  // 4. PASSPORT MEDIA (Photos & Videos)
  // ============================================================================

  async getAllMedia(): Promise<PassportMedia[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('passport_media').select('*');
      if (!error && data) return data as PassportMedia[];
    }
    return getStoredItem<PassportMedia[]>(STORAGE_KEYS.MEDIA, INITIAL_PASSPORT_MEDIA);
  }

  async getMediaByOwner(ownerType: 'vendor' | 'batch' | 'product', ownerId: string): Promise<PassportMedia[]> {
    const all = await this.getAllMedia();
    return all.filter((m) => m.ownerType === ownerType && m.ownerId === ownerId);
  }

  async getMediaByVendor(vendorId: string): Promise<PassportMedia[]> {
    const all = await this.getAllMedia();
    return all.filter((m) => m.vendorId === vendorId);
  }

  async uploadMedia(mediaData: Omit<PassportMedia, 'id' | 'createdAt' | 'moderationStatus'>): Promise<PassportMedia> {
    const all = await this.getAllMedia();
    const newMedia: PassportMedia = {
      ...mediaData,
      id: `media-${Date.now()}`,
      moderationStatus: 'pending', // Requires admin moderation
      createdAt: new Date().toISOString(),
    };
    const updated = [newMedia, ...all];
    setStoredItem(STORAGE_KEYS.MEDIA, updated);
    return newMedia;
  }

  async moderateMedia(mediaId: string, status: 'approved' | 'rejected', reviewerName: string): Promise<PassportMedia> {
    const all = await this.getAllMedia();
    const idx = all.findIndex((m) => m.id === mediaId);
    if (idx === -1) throw new Error('Media not found');

    const updated: PassportMedia = {
      ...all[idx],
      moderationStatus: status,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      isPublic: status === 'approved',
    };
    all[idx] = updated;
    setStoredItem(STORAGE_KEYS.MEDIA, all);
    return updated;
  }

  // ============================================================================
  // 5. QR SCAN AUDIT LOGS & MISUSE PREVENTION
  // ============================================================================

  async logScan(
    qrType: 'vendor' | 'batch',
    identifier: string,
    meta?: { taluka?: string; device?: string }
  ): Promise<QRScanLog> {
    const logs = getStoredItem<QRScanLog[]>(STORAGE_KEYS.SCAN_LOGS, []);
    const batches = await this.getAllBatches();
    const batch = batches.find((b) => b.batchCode === identifier);

    const currentCount = (batch?.scanCount || 0) + 1;
    if (batch) {
      batch.scanCount = currentCount;
      setStoredItem(STORAGE_KEYS.BATCHES, batches);
    }

    // Flag unusual scan velocity (> 50 scans)
    const isFlagged = currentCount > 50;
    const flagReason = isFlagged ? 'High scan volume (>50 scans): Possible duplicate/reused label packaging' : undefined;

    const logEntry: QRScanLog = {
      id: `scan-${Date.now()}`,
      qrType,
      identifier,
      scannedAt: new Date().toISOString(),
      deviceType: meta?.device || (typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop'),
      talukaDetected: meta?.taluka || 'Tiswadi',
      scanSequenceNumber: currentCount,
      isFlaggedForReview: isFlagged,
      flagReason,
    };

    const updatedLogs = [logEntry, ...logs.slice(0, 100)];
    setStoredItem(STORAGE_KEYS.SCAN_LOGS, updatedLogs);
    return logEntry;
  }

  async getScanLogs(identifier?: string): Promise<QRScanLog[]> {
    const logs = getStoredItem<QRScanLog[]>(STORAGE_KEYS.SCAN_LOGS, []);
    return identifier ? logs.filter((l) => l.identifier === identifier) : logs;
  }

  async getFlaggedScans(): Promise<QRScanLog[]> {
    const logs = getStoredItem<QRScanLog[]>(STORAGE_KEYS.SCAN_LOGS, []);
    return logs.filter((l) => l.isFlaggedForReview);
  }
}

export const passportService = new PassportService();
