import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { passportService, CreateBatchInput } from '../../services/passportService';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { Vendor, Product, ProductBatch, PassportMedia } from '../../types';
import {
  QrCode,
  ShieldCheck,
  Plus,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck,
  Image as ImageIcon,
  Video,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Upload,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  X,
} from 'lucide-react';

export const VendorPassportsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [mediaList, setMediaList] = useState<PassportMedia[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'batches' | 'vendor-qr' | 'story' | 'media'
  const [activeTab, setActiveTab] = useState<'batches' | 'vendor-qr' | 'story' | 'media'>('batches');

  // Modal states
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [showUploadMediaModal, setShowUploadMediaModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    destinationUrl: string;
    badgeLabel?: string;
    batchInfo?: {
      batchNumber: string;
      productName: string;
      vendorName: string;
      productionDate: string;
      bestBeforeDate?: string;
    };
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    destinationUrl: '',
  });

  // Story Form State
  const [storyForm, setStoryForm] = useState({
    businessName: '',
    ownerName: '',
    description: '',
    village: '',
    taluka: '',
    fssaiLicense: '',
  });
  const [savingStory, setSavingStory] = useState(false);

  // Batch Form State
  const [batchForm, setBatchForm] = useState<CreateBatchInput>({
    productId: '',
    productName: '',
    vendorId: '',
    vendorName: '',
    batchNumber: '',
    harvestDate: new Date().toISOString().slice(0, 10),
    productionDate: new Date().toISOString().slice(0, 10),
    bestBeforeDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    unitsProduced: 100,
    originVillage: '',
    originTaluka: '',
    originDistrict: 'North Goa',
    traditionalMethodSteps: [
      { stepNumber: 1, title: 'Harvest & Sourcing', description: 'Hand-picked raw ingredients from local Goan smallholders.' },
      { stepNumber: 2, title: 'Artisanal Preparation', description: 'Traditional slow-cooking in copper vessel without synthetic additives.' },
    ],
    ingredientsSourcing: [
      { ingredient: 'Main Ingredient', sourceVillage: 'Local Village', sourceTaluka: 'Tiswadi', isLocalGoan: true },
    ],
    claims: [
      { claimType: 'TRADITIONAL_RECIPE', claimName: 'Heritage Goan Recipe', evidenceSummary: 'Prepared using ancestral methods passed down through generations.' },
    ],
    publicNotes: 'Crafted with pride in Goa under traditional hygienic conditions.',
  });
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Media Upload State
  const [mediaForm, setMediaForm] = useState<{
    mediaType: 'image' | 'video';
    category: PassportMedia['category'];
    url: string;
    caption: string;
    altText: string;
  }>({
    mediaType: 'image',
    category: 'making_process',
    url: '',
    caption: '',
    altText: '',
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Load Vendor Data
  const loadData = async () => {
    setLoading(true);
    try {
      const allVendors = await vendorService.getAllVendors();
      const currentVendor =
        allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
        allVendors[0];

      if (currentVendor) {
        setVendor(currentVendor);
        setStoryForm({
          businessName: currentVendor.businessName,
          ownerName: currentVendor.ownerName,
          description: currentVendor.description,
          village: currentVendor.village,
          taluka: currentVendor.taluka,
          fssaiLicense: currentVendor.documents.find((d) => d.type === 'fssai')?.name || '',
        });

        // Load Products
        const prods = await productService.getProductsByVendor(currentVendor.id);
        setProducts(prods);

        // Load Batches
        const vendorBatches = await passportService.getBatchesByVendor(currentVendor.id);
        setBatches(vendorBatches);

        // Load Media
        const vMedia = await passportService.getMediaByVendor(currentVendor.id);
        setMediaList(vMedia);

        // Pre-fill batch form vendor info
        setBatchForm((prev) => ({
          ...prev,
          vendorId: currentVendor.id,
          vendorName: currentVendor.businessName,
          originVillage: currentVendor.village,
          originTaluka: currentVendor.taluka,
          productId: prods[0]?.id || '',
          productName: prods[0]?.name || '',
          batchNumber: `B-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        }));
      }
    } catch (err) {
      console.error('Error loading vendor passport data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Save Story
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setSavingStory(true);
    try {
      const updated = await vendorService.updateVendorProfile(vendor.id, {
        businessName: storyForm.businessName,
        ownerName: storyForm.ownerName,
        description: storyForm.description,
        village: storyForm.village,
        taluka: storyForm.taluka,
      });
      setVendor(updated);
      showToast('Producer story & public profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile story', 'error');
    } finally {
      setSavingStory(false);
    }
  };

  // Handle Create Batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    if (vendor.status !== 'approved') {
      showToast('Only approved vendors can create Origin Passport batches.', 'error');
      return;
    }
    if (!batchForm.productId) {
      showToast('Please select a product for this batch.', 'error');
      return;
    }

    setCreatingBatch(true);
    try {
      const { batch } = await passportService.createBatch(batchForm);
      showToast(`Batch ${batch.batchNumber} submitted for Origin Passport review!`, 'success');
      setShowCreateBatchModal(false);
      await loadData();
      // Auto open QR modal for convenience
      setQrModalData({
        isOpen: true,
        title: `${batch.productName} Packaging QR`,
        subtitle: `Batch ${batch.batchNumber} (Pending Admin Verification)`,
        destinationUrl: batch.qrCodeUrl,
        badgeLabel: 'Rootify Batch QR',
        batchInfo: {
          batchNumber: batch.batchNumber,
          productName: batch.productName,
          vendorName: batch.vendorName,
          productionDate: batch.productionDate,
          bestBeforeDate: batch.bestBeforeDate,
        },
      });
    } catch (err) {
      showToast('Failed to create product batch', 'error');
    } finally {
      setCreatingBatch(false);
    }
  };

  // Handle Add Media
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    if (!mediaForm.url.trim()) {
      showToast('Please provide an image or video URL', 'error');
      return;
    }

    setUploadingMedia(true);
    try {
      await passportService.uploadMedia({
        vendorId: vendor.id,
        ownerType: 'vendor',
        ownerId: vendor.id,
        mediaType: mediaForm.mediaType,
        category: mediaForm.category,
        url: mediaForm.url.trim(),
        caption: mediaForm.caption,
        altText: mediaForm.altText,
        isPublic: false, // Default pending moderation
      });
      showToast('Media uploaded! It will be reviewed by admin for Origin Passport display.', 'success');
      setShowUploadMediaModal(false);
      setMediaForm({
        mediaType: 'image',
        category: 'making_process',
        url: '',
        caption: '',
        altText: '',
      });
      await loadData();
    } catch (err) {
      showToast('Failed to upload media', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const isApprovedVendor = vendor?.status === 'approved';

  return (
    <PortalLayout
      portalType="vendor"
      title="My Story & QR Passports"
      subtitle="Manage your Goan origin heritage, create verifiable product batches, and download packaging QR codes"
      actionButton={
        <div className="flex items-center gap-2">
          {vendor && (
            <button
              onClick={() =>
                setQrModalData({
                  isOpen: true,
                  title: `${vendor.businessName} Producer QR`,
                  subtitle: `Public Goan Village Producer Profile & Story (${vendor.village}, ${vendor.taluka})`,
                  destinationUrl: passportService.getVendorPassportUrl(vendor.id),
                  badgeLabel: 'Rootify Verified Producer',
                })
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-sand-300 text-charcoal-800 text-xs font-bold hover:bg-sand-50 transition shadow-2xs"
            >
              <QrCode className="w-4 h-4 text-brand-700" />
              <span>Vendor Profile QR</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!isApprovedVendor) {
                showToast('Your vendor application is pending approval. Origin batches will be unlocked once approved.', 'info');
                return;
              }
              setShowCreateBatchModal(true);
            }}
            disabled={!isApprovedVendor}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isApprovedVendor
                ? 'bg-brand-700 hover:bg-brand-800 text-white'
                : 'bg-sand-200 text-charcoal-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Product Batch QR</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Vendor Approval Status Alert Banner */}
        {!isApprovedVendor && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-amber-900">Producer Account Status: Pending Approval</h4>
              <p className="text-amber-800 mt-0.5">
                Your business registration and supporting documents are currently being audited by the ROOTIFY admin team.
                Batch Origin Passport creation will unlock as soon as your producer profile is approved.
              </p>
            </div>
          </div>
        )}

        {isApprovedVendor && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                Verified Goan Producer
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  QR Issuance Authorized
                </span>
              </h4>
              <p className="text-emerald-800 mt-0.5">
                You can generate tamper-traceable packaging QR codes for your product batches. Each batch QR carries an audited Origin Passport for consumers.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-sand-300 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'batches'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Product Batches & Passports ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendor-qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vendor-qr'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Vendor QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'story'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>My Producer Story</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photos & Videos ({mediaList.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT BATCHES & PASSPORTS */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sand-300">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal-900">
                  Batches Eligible for Origin Passports
                </h3>
                <p className="text-xs text-charcoal-500">
                  Each batch receives a tamper-resistant QR code with audited harvest and traditional method records.
                </p>
              </div>

              {isApprovedVendor && (
                <button
                  onClick={() => setShowCreateBatchModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 text-xs font-bold hover:bg-brand-100 transition self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Batch</span>
                </button>
              )}
            </div>

            {batches.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-300">
                <QrCode className="w-12 h-12 text-sand-400 mx-auto mb-3" />
                <h4 className="font-display font-bold text-base text-charcoal-800">No Product Batches Created Yet</h4>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
                  Register your first production run to generate high-resolution QR stickers for your jars, bottles, or packaging.
                </p>
                {isApprovedVendor && (
                  <button
                    onClick={() => setShowCreateBatchModal(true)}
                    className="px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition"
                  >
                    Create First Batch
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => {
                  const getStatusBadge = () => {
                    switch (batch.status) {
                      case 'active':
                        return {
                          label: 'Active & Verified',
                          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        };
                      case 'pending':
                        return {
                          label: 'Pending Admin Review',
                          icon: <Clock className="w-3.5 h-3.5" />,
                          cls: 'bg-amber-50 text-amber-800 border-amber-200',
                        };
                      case 'revoked':
                        return {
                          label: 'Passport Revoked',
                          icon: <ShieldAlert className="w-3.5 h-3.5" />,
                          cls: 'bg-rose-50 text-rose-800 border-rose-200',
                        };
                      default:
                        return {
                          label: 'Inactive',
                          icon: <AlertTriangle className="w-3.5 h-3.5" />,
                          cls: 'bg-sand-100 text-charcoal-600 border-sand-300',
                        };
                    }
                  };

                  const badge = getStatusBadge();

                  return (
                    <div
                      key={batch.id}
                      className="bg-white rounded-3xl p-5 border border-sand-300 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                            {batch.batchCode}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-charcoal-900 text-base leading-snug">
                            {batch.productName}
                          </h4>
                          <p className="text-xs text-charcoal-500 font-medium mt-0.5">
                            Batch #{batch.batchNumber} • {batch.unitsProduced} units
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-sand-50/80 border border-sand-200 text-xs space-y-1 text-charcoal-600">
                          <div className="flex items-center justify-between">
                            <span className="text-charcoal-500">Produced:</span>
                            <span className="font-semibold text-charcoal-800">{batch.productionDate}</span>
                          </div>
                          {batch.bestBeforeDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-charcoal-500">Best Before:</span>
                              <span className="font-semibold text-charcoal-800">{batch.bestBeforeDate}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-sand-200/60">
                            <span className="text-charcoal-500">QR Scans:</span>
                            <span className="font-bold text-brand-700">{batch.scanCount} scans logged</span>
                          </div>
                        </div>

                        {batch.reviewNotes && (
                          <p className="text-[11px] text-charcoal-500 italic bg-sand-50 p-2 rounded-xl border border-sand-200">
                            Auditor Note: {batch.reviewNotes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-3 border-t border-sand-200 flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQrModalData({
                              isOpen: true,
                              title: `${batch.productName} Packaging Label`,
                              subtitle: `Batch Code: ${batch.batchCode} • Units: ${batch.unitsProduced}`,
                              destinationUrl: batch.qrCodeUrl,
                              badgeLabel: 'Rootify Batch QR',
                              batchInfo: {
                                batchNumber: batch.batchNumber,
                                productName: batch.productName,
                                vendorName: batch.vendorName,
                                productionDate: batch.productionDate,
                                bestBeforeDate: batch.bestBeforeDate,
                              },
                            })
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Get Label QR</span>
                        </button>

                        <Link
                          to={`/passport/batch/${batch.batchCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-700 transition"
                          title="Preview Customer Origin Passport"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VENDOR QR CODE */}
        {activeTab === 'vendor-qr' && vendor && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sand-200">
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  Vendor Origin Profile QR Code
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
                  A permanent, high-resolution QR code representing your artisanal workshop or Self Help Group.
                  You can safely edit your story and catalogue; this QR destination remains permanent and stable.
                </p>
              </div>

              <button
                onClick={() =>
                  setQrModalData({
                    isOpen: true,
                    title: `${vendor.businessName} Producer QR`,
                    subtitle: `Public Goan Village Producer Profile & Story (${vendor.village}, ${vendor.taluka})`,
                    destinationUrl: passportService.getVendorPassportUrl(vendor.id),
                    badgeLabel: 'Rootify Verified Producer',
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition shadow-xs self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Open Print & Download Studio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 text-center flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl border-2 border-brand-200 shadow-sm flex items-center justify-center mb-4">
                  <QrCode className="w-36 h-36 text-brand-800" />
                </div>
                <span className="text-xs font-mono font-bold text-brand-900 bg-brand-100/60 px-3 py-1 rounded-full border border-brand-300">
                  ID: {vendor.id}
                </span>
                <p className="text-[11px] text-charcoal-500 mt-2">
                  Destination URL:
                  <br />
                  <span className="font-mono text-charcoal-700 break-all">
                    {passportService.getVendorPassportUrl(vendor.id)}
                  </span>
                </p>
              </div>

              <div className="md:col-span-2 space-y-4 text-xs text-charcoal-700">
                <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-2">
                  <h4 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Packaging & Stall Display Guidelines
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-charcoal-600 leading-relaxed">
                    <li>Place this QR code on your market stalls, retail counters, or corporate gift boxes.</li>
                    <li>Consumers scanning this QR view your verified Goan village address, heritage story, and photo gallery.</li>
                    <li>Available in both 1024px PNG (raster) and pure vector SVG (for vinyl cutting or label printers).</li>
                    <li>Tamper-safe: Changing your address or products does NOT invalidate this printed QR code.</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/passport/vendor/${vendor.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-800 font-bold transition"
                  >
                    <Eye className="w-4 h-4 text-brand-700" />
                    <span>Preview Public Profile Page</span>
                  </Link>

                  <Link
                    to={`/vendor/${vendor.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-800 font-bold transition"
                  >
                    <ExternalLink className="w-4 h-4 text-brand-700" />
                    <span>View Marketplace Storefront</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCER STORY & PUBLIC PROFILE */}
        {activeTab === 'story' && vendor && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Edit Producer Story & Public Profile
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                This story is displayed on your customer-facing Origin Passport and vendor QR landing page.
              </p>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Artisanal Enterprise / SHG Name
                  </label>
                  <input
                    type="text"
                    value={storyForm.businessName}
                    onChange={(e) => setStoryForm({ ...storyForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Lead Producer / Master Artisan Name
                  </label>
                  <input
                    type="text"
                    value={storyForm.ownerName}
                    onChange={(e) => setStoryForm({ ...storyForm, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={storyForm.village}
                    onChange={(e) => setStoryForm({ ...storyForm, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Taluka</label>
                  <input
                    type="text"
                    value={storyForm.taluka}
                    onChange={(e) => setStoryForm({ ...storyForm, taluka: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">FSSAI / Registration #</label>
                  <input
                    type="text"
                    value={storyForm.fssaiLicense}
                    onChange={(e) => setStoryForm({ ...storyForm, fssaiLicense: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    placeholder="e.g. 10622001000142"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Producer Story & Heritage Background
                </label>
                <textarea
                  rows={4}
                  value={storyForm.description}
                  onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  placeholder="Tell customers how your recipes were passed down, your family or SHG roots, and traditional methods used..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingStory}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition disabled:opacity-50 shadow-xs"
                >
                  {savingStory ? 'Saving Story...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: PHOTOS & VIDEOS GALLERY */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sand-300">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal-900">
                  Origin Photos, Farm Videos & Making-of Clips
                </h3>
                <p className="text-xs text-charcoal-500">
                  Upload images of your workshop, ingredients, traditional cookware, or producer video introduction.
                </p>
              </div>

              <button
                onClick={() => setShowUploadMediaModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition shadow-2xs self-start sm:self-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Media</span>
              </button>
            </div>

            {mediaList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-sand-300">
                <ImageIcon className="w-12 h-12 text-sand-400 mx-auto mb-3" />
                <h4 className="font-display font-bold text-base text-charcoal-800">No Media Uploaded Yet</h4>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
                  Add photos of your workshop and videos showing traditional methods to enrich your customer Origin Passport.
                </p>
                <button
                  onClick={() => setShowUploadMediaModal(true)}
                  className="px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition"
                >
                  Upload First Photo / Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl overflow-hidden border border-sand-300 shadow-2xs group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video sm:aspect-4/3 bg-sand-100 overflow-hidden">
                      {m.mediaType === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/80 text-white relative">
                          <video src={m.url} className="w-full h-full object-cover" controls preload="metadata" />
                          <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <Video className="w-3 h-3 text-red-400" />
                            <span>Video</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt={m.altText || m.caption || 'Producer media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}

                      {/* Moderation Badge */}
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                          m.moderationStatus === 'approved'
                            ? 'bg-emerald-800/90 text-white'
                            : m.moderationStatus === 'rejected'
                            ? 'bg-rose-800/90 text-white'
                            : 'bg-amber-800/90 text-white'
                        }`}
                      >
                        {m.moderationStatus === 'approved'
                          ? 'Approved for Passport'
                          : m.moderationStatus === 'rejected'
                          ? 'Rejected'
                          : 'Pending Audit'}
                      </span>
                    </div>

                    <div className="p-3">
                      <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block mb-0.5">
                        {m.category.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-semibold text-charcoal-900 truncate">
                        {m.caption || 'No caption provided'}
                      </p>
                      <p className="text-[10px] text-charcoal-400 mt-1">
                        Added: {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE BATCH MODAL */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-sand-300 shadow-2xl my-8 relative">
            <button
              onClick={() => setShowCreateBatchModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-sand-100 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  Register Product Batch for Origin Passport
                </h3>
              </div>
              <p className="text-xs text-charcoal-500">
                Input batch harvest, traditional preparation steps, and sourcing claims to request an authenticated QR code.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Select Product *
                  </label>
                  <select
                    value={batchForm.productId}
                    onChange={(e) => {
                      const selProd = products.find((p) => p.id === e.target.value);
                      setBatchForm({
                        ...batchForm,
                        productId: e.target.value,
                        productName: selProd?.name || '',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Batch Identifier / Code *
                  </label>
                  <input
                    type="text"
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Production Date *
                  </label>
                  <input
                    type="date"
                    value={batchForm.productionDate}
                    onChange={(e) => setBatchForm({ ...batchForm, productionDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Best Before Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.bestBeforeDate}
                    onChange={(e) => setBatchForm({ ...batchForm, bestBeforeDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Units Produced *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batchForm.unitsProduced}
                    onChange={(e) => setBatchForm({ ...batchForm, unitsProduced: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Production Village (Goa) *
                  </label>
                  <input
                    type="text"
                    value={batchForm.originVillage}
                    onChange={(e) => setBatchForm({ ...batchForm, originVillage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Taluka *
                  </label>
                  <input
                    type="text"
                    value={batchForm.originTaluka}
                    onChange={(e) => setBatchForm({ ...batchForm, originTaluka: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Heritage Claims & Supporting Evidence
                </label>
                <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={batchForm.claims[0]?.claimType || 'TRADITIONAL_RECIPE'}
                      onChange={(e) => {
                        const updated = [...batchForm.claims];
                        updated[0] = {
                          ...updated[0],
                          claimType: e.target.value as any,
                          claimName: e.target.options[e.target.selectedIndex].text,
                        };
                        setBatchForm({ ...batchForm, claims: updated });
                      }}
                      className="w-1/2 px-2.5 py-2 rounded-lg border border-sand-300 text-xs bg-white"
                    >
                      <option value="TRADITIONAL_RECIPE">Ancestral Traditional Recipe</option>
                      <option value="GI_TAG">Geographical Indication (GI) Registered</option>
                      <option value="SHG_CERT">Goan Mahila Mandal SHG Certified</option>
                      <option value="FSSAI">FSSAI Artisanal License</option>
                      <option value="ORGANIC_PRACTICE">No Chemical Pesticides / Pure Organic</option>
                      <option value="PANCHAYAT_NOC">Village Panchayat NOC</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Certificate / NOC number (optional)"
                      value={batchForm.claims[0]?.certificateNumber || ''}
                      onChange={(e) => {
                        const updated = [...batchForm.claims];
                        updated[0] = { ...updated[0], certificateNumber: e.target.value };
                        setBatchForm({ ...batchForm, claims: updated });
                      }}
                      className="w-1/2 px-2.5 py-2 rounded-lg border border-sand-300 text-xs bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Brief explanation of evidence (e.g. Grandma's recipe book, local Panchayat letter)..."
                    value={batchForm.claims[0]?.evidenceSummary || ''}
                    onChange={(e) => {
                      const updated = [...batchForm.claims];
                      updated[0] = { ...updated[0], evidenceSummary: e.target.value };
                      setBatchForm({ ...batchForm, claims: updated });
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-sand-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Public Consumer Notes
                </label>
                <textarea
                  rows={2}
                  value={batchForm.publicNotes}
                  onChange={(e) => setBatchForm({ ...batchForm, publicNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  placeholder="Notes shown on the Origin Passport (e.g., store in cool place, handmade in small batches)..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowCreateBatchModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-sand-300 text-xs font-bold text-charcoal-700 hover:bg-sand-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingBatch}
                  className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition disabled:opacity-50 shadow-xs"
                >
                  {creatingBatch ? 'Registering...' : 'Register Batch & Request QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MEDIA MODAL */}
      {showUploadMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-sand-300 shadow-2xl relative">
            <button
              onClick={() => setShowUploadMediaModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-sand-100 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="font-display font-bold text-base text-charcoal-900">
                Upload Origin Photo or Video
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Will be submitted to ROOTIFY admin team for passport verification.
              </p>
            </div>

            <form onSubmit={handleUploadMedia} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Format</label>
                  <select
                    value={mediaForm.mediaType}
                    onChange={(e) => setMediaForm({ ...mediaForm, mediaType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs"
                  >
                    <option value="image">Photograph (JPG/PNG)</option>
                    <option value="video">Video (MP4 / WebM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Category</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs"
                  >
                    <option value="making_process">Production Process</option>
                    <option value="profile">Producer Profile</option>
                    <option value="farm_workspace">Farm / Workshop</option>
                    <option value="artisan_interview">Artisan Interview</option>
                    <option value="final_product">Finished Product</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Media Direct URL *
                </label>
                <input
                  type="url"
                  placeholder="https://... image or video URL"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">Caption / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stirring the copper uruli in Chorao..."
                  value={mediaForm.caption}
                  onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  placeholder="Descriptive text for screen readers"
                  value={mediaForm.altText}
                  onChange={(e) => setMediaForm({ ...mediaForm, altText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowUploadMediaModal(false)}
                  className="px-4 py-2 rounded-xl border border-sand-300 text-xs font-bold text-charcoal-700 hover:bg-sand-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploadingMedia}
                  className="px-5 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition disabled:opacity-50"
                >
                  {uploadingMedia ? 'Uploading...' : 'Submit Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PRINT & PACKAGING MODAL */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ ...qrModalData, isOpen: false })}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        destinationUrl={qrModalData.destinationUrl}
        badgeLabel={qrModalData.badgeLabel}
        batchInfo={qrModalData.batchInfo}
      />
    </PortalLayout>
  );
};
