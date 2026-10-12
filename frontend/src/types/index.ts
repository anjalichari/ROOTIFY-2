// User & Authentication Types
export type UserRole = 'guest' | 'customer' | 'vendor' | 'delivery' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  // Customer specific
  defaultAddress?: Address;
  addresses?: Address[];
  // Vendor specific
  vendorId?: string;
  // Delivery specific
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable?: boolean;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  landmark?: string;
  villageOrTown: string;
  taluka: string;
  pincode: string;
  isDefault?: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  itemCount: number;
}

// Location Types
export interface GoaLocation {
  id: string;
  name: string; // e.g. Panaji, Mapusa, Margao, Ponda, Vasco, Calangute, Porvorim, Candolim
  taluka: 'Bardez' | 'Tiswadi' | 'Salcete' | 'Ponda' | 'Mormugao' | 'Pernem' | 'Bicholim' | 'Sattari' | 'Quepem' | 'Sanguem' | 'Canacona' | 'Dharbandora';
  district: 'North Goa' | 'South Goa';
  isServiceable: boolean;
  estimatedDeliveryMin: number;
}

// Product Types
export type TrustBadgeLevel = 'Self-declared' | 'Evidence added' | 'Verified';

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  vendorTaluka: string;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. "500g", "1 pack (8 pcs)", "250ml", "1 kg"
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isVerifiedOrigin: boolean;
  trustBadge?: TrustBadgeLevel;
  originDetails: {
    village: string;
    taluka: string;
    traditionalMethod: string;
    ingredients: string[];
    shelfLife: string;
    certifications: string[]; // e.g. "FSSAI Registered", "SHG Certified", "Traditional Goan Recipe"
    storySnippet?: string;
    storageTips?: string;
    steps?: string[];
  };
  moderationStatus?: 'active' | 'needs_attention' | 'under_review';
  isPopular?: boolean;
  isRecommended?: boolean;
}

// Vendor Types
export type VendorStatus = 'pending' | 'approved' | 'rejected';

export interface VendorDocument {
  id: string;
  name: string;
  type: 'panchayat_noc' | 'trade_license' | 'fssai' | 'business_photo' | 'shg_certificate' | 'other';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  verified: boolean;
}

export interface VendorScore {
  overall: number; // 0 to 100
  certificationScore: number;
  ratingScore: number;
  consistencyScore: number;
  originAuthenticityScore: number;
}

export interface Vendor {
  id: string;
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
  bannerImage: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  status: VendorStatus;
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  documents: VendorDocument[];
  vendorScore: VendorScore;
  isShgOrMahilaMandal: boolean;
  shgName?: string;
  serviceableTalukas: string[];
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface Cart {
  items: CartItem[];
  vendorId?: string; // For single-vendor checkout clarity
  vendorName?: string;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
}

// Order & Delivery Types
export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
  updatedByRole?: UserRole;
}

export type PaymentMethod = 'UPI' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: Address;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  timeline: OrderTimelineStep[];
  placedAt: string;
  updatedAt: string;
  deliveredAt?: string;
  rejectionReason?: string;
  customerNote?: string;
  isReviewed?: boolean;
}

// Review Types
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  vendorId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

// Chat Types for Delivery Partner
export interface ChatMessage {
  id: string;
  conversationId: string; // e.g. "order-101-vendor" or "order-101-customer"
  orderId: string;
  senderId: string;
  senderRole: 'delivery' | 'vendor' | 'customer';
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

// Admin Issue & Refund Types
export interface SupportIssue {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  issueType: 'damaged_item' | 'missing_item' | 'quality_issue' | 'delivery_delay' | 'wrong_item';
  description: string;
  requestedRefundAmount: number;
  status: 'OPEN' | 'INVESTIGATING' | 'REFUNDED' | 'RESOLVED_NO_REFUND' | 'REJECTED';
  createdAt: string;
  resolutionNote?: string;
}

// Settlement Types
export interface SettlementRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  orderId: string;
  orderNumber: string;
  orderAmount: number;
  platformCommission: number; // e.g. 5%
  vendorPayable: number;
  status: 'PENDING' | 'ELIGIBLE' | 'SETTLED';
  deliveredAt: string;
  settledAt?: string;
}

// Origin Passport & Product Traceability Types
export type BatchStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'revoked';
export type VerificationStatus = 'unverified' | 'pending_review' | 'verified_with_evidence' | 'rejected' | 'revoked';

export interface ProductBatch {
  id: string;
  batchCode: string; // Unique unpredictable identifier e.g. RTF-BEB-2026M01
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  batchNumber: string;
  harvestDate: string;
  productionDate: string;
  bestBeforeDate?: string;
  unitsProduced: number;
  status: BatchStatus;
  qrCodeUrl: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  revocationReason?: string;
  scanCount: number;
  createdAt: string;
}

export interface TraditionalMethodStep {
  stepNumber: number;
  title: string;
  description: string;
  duration?: string;
}

export interface IngredientSourcing {
  ingredient: string;
  sourceVillage: string;
  sourceTaluka: string;
  isLocalGoan: boolean;
  harvestSeason?: string;
}

export interface ClaimReviewed {
  claimType: 'GI_TAG' | 'FSSAI' | 'SHG_CERT' | 'TRADITIONAL_RECIPE' | 'PANCHAYAT_NOC' | 'ORGANIC_PRACTICE';
  claimName: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  verified: boolean;
  reviewDate?: string;
  reviewerName?: string;
  evidenceSummary: string;
}

export interface OriginPassport {
  id: string;
  batchId: string;
  batchCode: string;
  productId: string;
  vendorId: string;
  verificationStatus: VerificationStatus;
  originVillage: string;
  originTaluka: string;
  originDistrict: 'North Goa' | 'South Goa';
  traditionalMethodSteps: TraditionalMethodStep[];
  ingredientsSourcing: IngredientSourcing[];
  claimsReviewed: ClaimReviewed[];
  independentTestingStatus?: string;
  antiTamperDisclaimer: string;
  publicNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PassportMedia {
  id: string;
  ownerType: 'vendor' | 'batch' | 'product';
  ownerId: string;
  vendorId: string;
  mediaType: 'image' | 'video';
  category: 'profile' | 'farm_workspace' | 'making_process' | 'final_product' | 'artisan_interview';
  url: string;
  thumbnailUrl?: string;
  caption: string;
  description?: string;
  altText: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface QRScanLog {
  id: string;
  qrType: 'vendor' | 'batch';
  identifier: string;
  scannedAt: string;
  ipHash?: string;
  deviceType?: string;
  talukaDetected?: string;
  scanSequenceNumber: number;
  isFlaggedForReview: boolean;
  flagReason?: string;
}

