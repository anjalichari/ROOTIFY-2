import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { passportService } from '../../services/passportService';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import {
  ProductBatch,
  OriginPassport,
  Vendor,
  Product,
  PassportMedia,
} from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MapPin,
  Calendar,
  Layers,
  Award,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Share2,
  CheckCircle2,
  Clock,
  Play,
  Film,
  Camera,
  FileText,
  AlertOctagon,
  ArrowRight,
  Info,
} from 'lucide-react';

interface OriginPassportPageProps {
  type?: 'batch' | 'vendor' | 'auto';
}

export const OriginPassportPage: React.FC<OriginPassportPageProps> = ({ type = 'auto' }) => {
  const { code, id } = useParams<{ code?: string; id?: string }>();
  const identifier = code || id || '';

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<ProductBatch | null>(null);
  const [passport, setPassport] = useState<OriginPassport | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [mediaList, setMediaList] = useState<PassportMedia[]>([]);
  const [statusType, setStatusType] = useState<'verified' | 'pending' | 'revoked' | 'unknown'>('verified');
  const [copied, setCopied] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPassportData = async () => {
      setLoading(true);
      try {
        if (!identifier) {
          setStatusType('unknown');
          setLoading(false);
          return;
        }

        // 1. Try to find batch by batch code or ID
        const matchedBatch =
          (await passportService.getBatchByCode(identifier)) ||
          (await passportService.getBatchById(identifier));

        if (matchedBatch) {
          setBatch(matchedBatch);
          // Log QR scan for audit & analytics
          passportService.logScan('batch', matchedBatch.batchCode);

          // Determine status
          if (matchedBatch.status === 'revoked') {
            setStatusType('revoked');
          } else if (matchedBatch.status === 'pending' || matchedBatch.status === 'draft') {
            setStatusType('pending');
          } else {
            setStatusType('verified');
          }

          // Fetch passport
          const pass = await passportService.getPassportByBatchId(matchedBatch.id);
          setPassport(pass);

          // Fetch vendor
          const v = await vendorService.getVendorById(matchedBatch.vendorId);
          setVendor(v);

          // Fetch product
          const p = await productService.getProductById(matchedBatch.productId);
          setProduct(p);

          // Fetch media
          const batchMedia = await passportService.getMediaByOwner('batch', matchedBatch.id);
          const vendorMedia = await passportService.getMediaByVendor(matchedBatch.vendorId);
          setMediaList([...batchMedia, ...vendorMedia].filter((m) => m.isPublic && m.moderationStatus === 'approved'));

          setLoading(false);
          return;
        }

        // 2. If not a batch, check if it's a Vendor ID / Vendor QR
        const matchedVendor = await vendorService.getVendorById(identifier);
        if (matchedVendor) {
          setVendor(matchedVendor);
          passportService.logScan('vendor', matchedVendor.id);

          if (matchedVendor.status === 'approved') {
            setStatusType('verified');
          } else if (matchedVendor.status === 'rejected') {
            setStatusType('revoked');
          } else {
            setStatusType('pending');
          }

          // Fetch vendor batches and media
          const vBatches = await passportService.getBatchesByVendor(matchedVendor.id);
          if (vBatches.length > 0) {
            setBatch(vBatches[0]);
            const pass = await passportService.getPassportByBatchId(vBatches[0].id);
            setPassport(pass);
          }

          const vMedia = await passportService.getMediaByVendor(matchedVendor.id);
          setMediaList(vMedia.filter((m) => m.isPublic && m.moderationStatus === 'approved'));

          setLoading(false);
          return;
        }

        // 3. Not found
        setStatusType('unknown');
      } catch (err) {
        console.error('Error loading Origin Passport:', err);
        setStatusType('unknown');
      } finally {
        setLoading(false);
      }
    };

    loadPassportData();
  }, [identifier]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-xl text-charcoal-900">Verifying ROOTIFY Origin Passport...</h2>
        <p className="text-xs text-charcoal-500">Checking registry signatures, batch records, and audited Goan origin claims.</p>
      </div>
    );
  }

  // ============================================================================
  // UNKNOWN / COUNTERFEIT WARNING STATE
  // ============================================================================
  if (statusType === 'unknown' || (!batch && !vendor)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
          <AlertOctagon className="w-10 h-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            Unregistered QR Identifier
          </span>
          <h1 className="font-display font-extrabold text-2xl text-charcoal-900">
            Origin Passport Not Found
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed max-w-lg mx-auto">
            The scanned QR code <code className="bg-sand-200 px-2 py-0.5 rounded font-mono font-bold text-charcoal-900">{identifier}</code> does not match any verified product batch or approved producer in the official ROOTIFY Goan Registry.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-700" />
            <span>Possible Causes & Advisory:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-800">
            <li>The physical label may be counterfeit, duplicated, or misprinted.</li>
            <li>The batch record has not yet been registered or published by the producer.</li>
            <li>The QR code link may have been entered with a typographical error.</li>
          </ul>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xs transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Verified Goan Marketplace
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sand-200 hover:bg-sand-300 text-charcoal-900 font-bold text-sm transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // REVOKED STATUS STATE
  // ============================================================================
  if (statusType === 'revoked') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 border-2 border-red-300 flex items-center justify-center text-red-600 shadow-sm">
          <XCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-900 bg-red-100 px-3 py-1 rounded-full border border-red-200">
            Passport Revoked by Administration
          </span>
          <h1 className="font-display font-extrabold text-2xl text-charcoal-900">
            Batch Certification Revoked
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed max-w-lg mx-auto">
            This QR code record ({batch?.batchCode || identifier}) was explicitly revoked by ROOTIFY Platform Operations and is no longer certified as authentic.
          </p>
        </div>

        {batch?.revocationReason && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left text-xs text-red-950">
            <strong className="block mb-1 font-bold text-red-900">Revocation Notice:</strong>
            <p className="leading-relaxed">{batch.revocationReason}</p>
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xs transition"
          >
            Explore Active Verified Products
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ACTIVE / VERIFIED ORIGIN PASSPORT VIEW
  // ============================================================================
  const isPending = statusType === 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Official Header Certificate Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-modal border ${
          isPending
            ? 'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 border-amber-600'
            : 'bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 border-brand-600'
        }`}
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-emerald-300 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2 py-0.5 rounded-full font-mono">
                  ROOTIFY PASSPORT
                </span>
                <span className="text-xs text-emerald-200">#GOA-ORIGIN</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
                {batch?.productName || vendor?.businessName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition active:scale-95 border border-white/20"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied' : 'Share'}
            </button>
          </div>
        </div>

        {/* Status Verification Badge Row */}
        <div className="relative z-10 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Status</span>
            <span className="font-extrabold text-sm flex items-center gap-1 text-white">
              {isPending ? (
                <>
                  <Clock className="w-4 h-4 text-amber-300" />
                  Audit Pending
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Verified Origin
                </>
              )}
            </span>
          </div>

          {batch && (
            <div>
              <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Batch Code</span>
              <span className="font-mono font-bold text-sm text-white tracking-wide">{batch.batchCode}</span>
            </div>
          )}

          <div>
            <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Regional Origin</span>
            <span className="font-bold text-sm text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta-300" />
              {passport?.originVillage || vendor?.village}, {passport?.originTaluka || vendor?.taluka}
            </span>
          </div>

          {batch && (
            <div>
              <span className="text-emerald-200/80 text-[10px] uppercase font-bold block">Packed Date</span>
              <span className="font-bold text-sm text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                {batch.productionDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Producer Heritage & Village Location Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
          <div className="flex items-center gap-4">
            {vendor?.profileImage ? (
              <img
                src={vendor.profileImage}
                alt={vendor.ownerName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center font-bold text-brand-800 text-xl font-display">
                {vendor?.ownerName?.slice(0, 2) || 'GO'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  Certified Producer
                </span>
                {vendor?.isShgOrMahilaMandal && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Women's SHG Cooperative
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-xl text-charcoal-900 mt-0.5">
                {vendor?.businessName}
              </h2>
              <p className="text-xs text-charcoal-600 font-medium">
                Lead Artisan: <strong>{vendor?.ownerName}</strong> • {vendor?.village}, {vendor?.taluka} ({vendor?.district})
              </p>
            </div>
          </div>

          <Link
            to={`/vendor/${vendor?.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sand-100 hover:bg-brand-50 text-charcoal-900 hover:text-brand-900 border border-sand-300 text-xs font-bold transition"
          >
            <span>View Full Producer Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-700" />
          </Link>
        </div>

        {/* Producer Heritage Story */}
        <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2 text-xs leading-relaxed text-charcoal-800">
          <h3 className="font-display font-bold text-sm text-brand-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-warmOrange-500" />
            Heritage Story & Background:
          </h3>
          <p className="text-charcoal-700 text-sm">{vendor?.story || vendor?.description}</p>
        </div>
      </section>

      {/* 3. Batch Lot & Production Timestamps */}
      {batch && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-700" />
              <h3 className="font-display font-bold text-base text-charcoal-900">
                Batch Registry & Lot Details
              </h3>
            </div>
            <span className="text-xs font-mono text-charcoal-500">
              Verified Scan #{batch.scanCount}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Lot Identifier</span>
              <strong className="text-charcoal-900 font-mono text-xs">{batch.batchNumber}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Harvest / Sourcing</span>
              <strong className="text-charcoal-900 text-xs">{batch.harvestDate}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Packed Date</span>
              <strong className="text-charcoal-900 text-xs">{batch.productionDate}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Best Before</span>
              <strong className="text-terracotta-700 text-xs">{batch.bestBeforeDate || '14 Days'}</strong>
            </div>
          </div>
        </section>
      )}

      {/* 4. Traditional Production Process (Step-by-Step) */}
      {passport?.traditionalMethodSteps && passport.traditionalMethodSteps.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sand-200">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Audited Traditional Production Method
              </h3>
              <p className="text-xs text-charcoal-500">Step-by-step traditional Goan craft verified during physical inspection</p>
            </div>
          </div>

          <div className="space-y-3">
            {passport.traditionalMethodSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex items-start gap-4 transition hover:border-brand-300"
              >
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-display font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm text-charcoal-900">{step.title}</h4>
                    {step.duration && (
                      <span className="text-[10px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                        {step.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Provenance & Ingredient Sourcing */}
      {passport?.ingredientsSourcing && passport.ingredientsSourcing.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sand-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Ingredient Provenance & Sourcing Map
              </h3>
              <p className="text-xs text-charcoal-500">Full disclosure of regional origins for key ingredients</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {passport.ingredientsSourcing.map((ing, i) => (
              <div key={i} className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex items-start justify-between gap-3 text-xs">
                <div>
                  <strong className="text-sm font-display font-bold text-charcoal-900 block">{ing.ingredient}</strong>
                  <p className="text-charcoal-600 mt-0.5">
                    Source: <strong>{ing.sourceVillage}</strong> ({ing.sourceTaluka}, Goa)
                  </p>
                  {ing.harvestSeason && (
                    <span className="text-[10px] text-charcoal-500 block mt-1">
                      Harvest: {ing.harvestSeason}
                    </span>
                  )}
                </div>
                {ing.isLocalGoan && (
                  <span className="shrink-0 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-1 rounded-full border border-emerald-300">
                    100% Goan
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Audited Certifications & Documented Evidence */}
      {passport?.claimsReviewed && passport.claimsReviewed.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sand-200">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Audited Claims & Government Evidence
              </h3>
              <p className="text-xs text-charcoal-500">Which claims have been physically audited and certified by inspectors</p>
            </div>
          </div>

          <div className="space-y-3">
            {passport.claimsReviewed.map((claim, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex items-start gap-3.5 text-xs"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  claim.verified ? 'bg-emerald-600 text-white' : 'bg-sand-300 text-charcoal-600'
                }`}>
                  {claim.verified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-charcoal-900 font-display">{claim.claimName}</h4>
                    {claim.certificateNumber && (
                      <span className="font-mono text-[10px] bg-white border border-sand-300 px-2 py-0.5 rounded text-charcoal-700">
                        License: {claim.certificateNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal-600 leading-relaxed">{claim.evidenceSummary}</p>
                  {claim.reviewerName && (
                    <div className="text-[10px] text-brand-800 font-medium pt-1">
                      Audited by: <strong>{claim.reviewerName}</strong> {claim.reviewDate && `on ${claim.reviewDate}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Independent Testing Transparency Box */}
          <div className="p-4 rounded-2xl bg-sand-100/80 border border-sand-300 text-xs text-charcoal-800 space-y-1">
            <span className="font-bold text-charcoal-900 block flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-700" />
              Independent Testing Disclosure:
            </span>
            <p className="leading-relaxed text-charcoal-600">
              {passport.independentTestingStatus || 'Physical workshop inspected by Rootify field team. Independent laboratory chemical testing is not claimed for this artisanal lot.'}
            </p>
          </div>
        </section>
      )}

      {/* 7. Photo & Video Media Studio */}
      {mediaList.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sand-200">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-200">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Verified Workshop & Production Media
              </h3>
              <p className="text-xs text-charcoal-500">Visual proof of authentic clay ovens, workshops, and traditional craft</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="group relative rounded-2xl overflow-hidden border border-sand-300 bg-sand-50 shadow-xs flex flex-col"
              >
                {m.mediaType === 'video' ? (
                  <div className="relative aspect-video bg-black flex items-center justify-center cursor-pointer">
                    {m.thumbnailUrl ? (
                      <img src={m.thumbnailUrl} alt={m.caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-900 flex items-center justify-center text-white" />
                    )}
                    <button
                      onClick={() => setActiveVideoUrl(m.url)}
                      aria-label="Play video"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 text-brand-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      </div>
                    </button>
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Film className="w-3 h-3" /> Video
                    </span>
                  </div>
                ) : (
                  <div className="aspect-video bg-sand-100 overflow-hidden">
                    <img
                      src={m.url}
                      alt={m.altText || m.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-3 text-xs space-y-0.5 flex-1">
                  <h4 className="font-bold text-charcoal-900 line-clamp-1">{m.caption}</h4>
                  {m.description && <p className="text-[11px] text-charcoal-500 line-clamp-2">{m.description}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Video Modal Player (no autoplay with sound) */}
          {activeVideoUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="absolute top-3 right-3 z-10 text-white hover:text-sand-200 bg-black/50 p-2 rounded-full"
                >
                  <XCircle className="w-6 h-6" />
                </button>
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay={false}
                  className="w-full max-h-[70vh] rounded-2xl"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* 8. Anti-Counterfeiting & Tamper Disclaimer */}
      <section className="bg-sand-100/90 rounded-3xl p-6 sm:p-7 border border-sand-300 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-charcoal-900 text-sm">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>Anti-Counterfeiting Advisory: What Does This QR Code Verify?</span>
        </div>
        <p className="text-charcoal-700 leading-relaxed">
          {passport?.antiTamperDisclaimer ||
            'This QR code verifies the digital database record, registered producer identity, and audited Goan origin claims on Rootify. While digital signatures guarantee authentic registry data, a copied physical label alone cannot prove a physical container has not been refilled or tampered with. Please inspect the tamper-evident packaging seal on the physical product before consumption.'}
        </p>
      </section>

      {/* 9. Next Steps / Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-sand-300 shadow-xs">
        <div>
          <h4 className="font-display font-bold text-base text-charcoal-900">
            Want to order directly from {vendor?.businessName}?
          </h4>
          <p className="text-xs text-charcoal-500">All products prepared fresh in Goan village kitchens.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/vendor/${vendor?.id}`}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition"
          >
            Browse Producer Menu
          </Link>
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-xl bg-sand-200 hover:bg-sand-300 text-charcoal-900 text-xs font-bold transition"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>

    </div>
  );
};
