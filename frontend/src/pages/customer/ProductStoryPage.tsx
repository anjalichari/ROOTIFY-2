import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import { Product, Vendor, TrustBadgeLevel } from '../../types';
import {
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  MapPin,
  Clock,
  Archive,
  ArrowRight,
  Share2,
  Check,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  Award,
  Users,
} from 'lucide-react';

export const ProductStoryPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadStory = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const prod = await productService.getProductById(productId);
        if (prod) {
          setProduct(prod);
          const vend = await vendorService.getVendorById(prod.vendorId);
          setVendor(vend);
        }
      } catch (err) {
        console.error('Error loading product story:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [productId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-8 px-4 flex justify-center">
        <div className="w-full max-w-lg space-y-6 animate-pulse">
          <div className="h-10 bg-sand-200 rounded-2xl w-1/3"></div>
          <div className="aspect-square bg-sand-200 rounded-3xl"></div>
          <div className="h-8 bg-sand-200 rounded-xl w-3/4"></div>
          <div className="h-20 bg-sand-200 rounded-2xl"></div>
          <div className="h-40 bg-sand-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sand-100 flex items-center justify-center text-charcoal-400">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-charcoal-900">Product Story Not Found</h1>
            <p className="text-xs text-charcoal-600 mt-1">
              We couldn't locate a verified origin story for product ID <code className="bg-sand-100 px-1.5 py-0.5 rounded font-mono font-bold text-brand-900">{productId}</code>.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse All Goan Marketplace Dishes</span>
          </Link>
        </div>
      </div>
    );
  }

  const badgeLevel: TrustBadgeLevel =
    product.trustBadge ||
    (product.isVerifiedOrigin ? 'Verified' : 'Self-declared');

  // Trust badge display styles & descriptions
  const getBadgeDetails = (level: TrustBadgeLevel) => {
    switch (level) {
      case 'Verified':
        return {
          label: 'Verified',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
          containerCls: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
          badgePillCls: 'bg-emerald-600 text-white',
          title: 'Audited & Verified Origin',
          description:
            'Audited by ROOTIFY Admin team through physical workshop inspection or certified Goan origin documentation. Ingredients and traditional methods independently corroborated.',
        };
      case 'Evidence added':
        return {
          label: 'Evidence added',
          icon: <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />,
          containerCls: 'bg-blue-50/90 border-blue-300 text-blue-950',
          badgePillCls: 'bg-blue-600 text-white',
          title: 'Evidence Added by Producer',
          description:
            'The producer has uploaded corroborating evidence (Panchayat trade NOC, FSSAI certificate, SHG registration, or ancestral recipe documentation) on record.',
        };
      case 'Self-declared':
      default:
        return {
          label: 'Self-declared',
          icon: <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />,
          containerCls: 'bg-amber-50/90 border-amber-300 text-amber-950',
          badgePillCls: 'bg-amber-600 text-white',
          title: 'Self-declared by Producer',
          description:
            'Preparation details, shelf life, and ingredients are self-declared by the local village artisan. Under administrative review for field verification.',
        };
    }
  };

  const badgeInfo = getBadgeDetails(badgeLevel);

  // Fallback steps if product has traditionalMethod string but no explicit steps array
  const stepsList: string[] =
    product.originDetails.steps && product.originDetails.steps.length > 0
      ? product.originDetails.steps
      : product.originDetails.traditionalMethod
      ? [product.originDetails.traditionalMethod]
      : ['Prepared using traditional Goan village culinary methods.'];

  const shortStory =
    product.originDetails.storySnippet ||
    vendor?.story ||
    vendor?.description ||
    'Crafted with ancestral passion by a verified local producer in Goa.';

  return (
    <div className="min-h-screen bg-sand-100 text-charcoal-900 pb-20 selection:bg-brand-100 selection:text-brand-900">
      
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sand-300 px-4 py-3 shadow-2xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            to={`/product/${product.id}`}
            className="flex items-center gap-1 text-xs font-bold text-charcoal-700 hover:text-brand-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Marketplace</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-brand-700 text-white text-[11px] font-black flex items-center justify-center font-display">
              R
            </span>
            <span className="font-display font-extrabold text-xs tracking-wider text-brand-900">
              ROOTIFY STORY
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product story"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-800 text-xs font-semibold transition active:scale-95 border border-sand-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Mobile-First Story Container */}
      <main className="max-w-lg mx-auto px-4 pt-5 space-y-6">

        {/* 1. Hero Product Card */}
        <section className="bg-white rounded-3xl overflow-hidden border border-sand-300 shadow-sm">
          {/* Photo */}
          <div className="relative aspect-4/3 w-full bg-sand-200">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Price & Unit Pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-sand-200 flex items-baseline gap-1">
              <span className="font-display font-black text-sm text-charcoal-900">
                ₹{product.price}
              </span>
              <span className="text-[10px] text-charcoal-500 font-medium">
                / {product.unit}
              </span>
            </div>

            {/* Category tag */}
            <div className="absolute top-3 right-3 bg-charcoal-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.categoryName}
            </div>
          </div>

          {/* Product Header & Title */}
          <div className="p-5 sm:p-6 space-y-2">
            <h1 className="font-display font-black text-xl sm:text-2xl text-charcoal-950 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </section>

        {/* 2. Trust Badge Card */}
        <section
          className={`rounded-3xl p-5 border shadow-2xs space-y-3 transition ${badgeInfo.containerCls}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {badgeInfo.icon}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-500 block">
                  Authenticity Verification
                </span>
                <span className="font-display font-bold text-sm text-charcoal-900">
                  {badgeInfo.title}
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-2xs shrink-0 ${badgeInfo.badgePillCls}`}
            >
              {badgeInfo.label}
            </span>
          </div>

          <p className="text-xs leading-relaxed opacity-90 pt-1 border-t border-black/5">
            {badgeInfo.description}
          </p>

          <div className="text-[10px] text-charcoal-500 pt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand-600" />
            <span>
              Trust badge can only be verified and awarded by authorized ROOTIFY platform administrators.
            </span>
          </div>
        </section>

        {/* 3. Who Made It (Producer Section) */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-sand-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center border border-brand-200">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-base text-charcoal-900">
                Who Made It
              </h2>
            </div>
            {vendor?.isShgOrMahilaMandal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
                SHG Cooperative
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Link
                to={`/vendor/${product.vendorId}`}
                className="font-display font-bold text-base text-brand-800 hover:text-brand-900 hover:underline flex items-center gap-1"
              >
                <span>{product.vendorName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
              </Link>
              {vendor?.ownerName && (
                <p className="text-xs text-charcoal-500 font-medium">
                  Artisan / Lead Cook: <strong className="text-charcoal-700">{vendor.ownerName}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-charcoal-700 bg-sand-50 p-2.5 rounded-xl border border-sand-200">
              <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
              <span>
                Village: <strong>{product.originDetails.village}</strong>, {product.originDetails.taluka || product.vendorTaluka} Taluka (Goa)
              </span>
            </div>

            <div className="bg-sand-50/80 p-3.5 rounded-2xl border border-sand-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
                Artisan Heritage Story
              </span>
              <p className="text-xs text-charcoal-700 leading-relaxed italic">
                "{shortStory}"
              </p>
            </div>
          </div>
        </section>

        {/* 4. How It Is Made (Ingredients & Step-by-Step) */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-sand-300 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-sand-200">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center border border-brand-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-charcoal-900">
                How It Is Made
              </h2>
              <p className="text-[11px] text-charcoal-500">
                Traditional Goan ancestral preparation process
              </p>
            </div>
          </div>

          {/* Key Ingredients */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 block">
              Pure Ingredients
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.originDetails.ingredients.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-sand-50 text-charcoal-800 text-xs font-semibold border border-sand-300 shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Step-by-Step Cards */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 block">
              Step-by-Step Process ({stepsList.length} Steps)
            </span>
            <div className="space-y-2">
              {stepsList.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-sand-50/70 border border-sand-200 text-xs text-charcoal-800 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-700 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                    {idx + 1}
                  </span>
                  <div className="pt-0.5">
                    <p>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Shelf Life & Storage Tips */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-sand-300 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-900 pb-2 border-b border-sand-200">
            Care & Freshness Guide
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {/* Shelf Life */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-8 h-8 rounded-xl bg-white text-brand-800 flex items-center justify-center border border-sand-300 shrink-0 shadow-2xs">
                <Clock className="w-4 h-4 text-brand-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                  Shelf Life
                </span>
                <span className="text-xs font-bold text-charcoal-900">
                  {product.originDetails.shelfLife}
                </span>
              </div>
            </div>

            {/* Storage Tips */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="w-8 h-8 rounded-xl bg-white text-terracotta-700 flex items-center justify-center border border-sand-300 shrink-0 shadow-2xs">
                <Archive className="w-4 h-4 text-terracotta-600" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                  Storage Tips
                </span>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  {product.originDetails.storageTips ||
                    'Store in a cool, dry place in an airtight container away from direct sunlight.'}
                </p>
              </div>
            </div>
          </div>

          {/* Certifications row if present */}
          {product.originDetails.certifications && product.originDetails.certifications.length > 0 && (
            <div className="pt-2 border-t border-sand-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                Declared Certifications
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.originDetails.certifications.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-900 bg-brand-50/80 px-2 py-0.5 rounded-md border border-brand-200"
                  >
                    <Award className="w-3 h-3 text-brand-600" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 6. Buy / Marketplace Action CTA */}
        <section className="bg-gradient-to-br from-brand-900 to-brand-800 text-white rounded-3xl p-6 shadow-modal space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
              Fresh Local Delivery Across Goa
            </span>
            <h3 className="font-display font-black text-lg text-white">
              Want to enjoy this authentic taste?
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Order directly from {product.vendorName} on ROOTIFY. Prepared fresh and delivered to your doorstep in Goa.
            </p>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-white hover:bg-emerald-50 text-brand-900 font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-brand-700" />
              <span>View Product & Order (₹{product.price})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/explore"
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition text-center border border-white/20"
            >
              Explore All Dishes
            </Link>
          </div>
        </section>

        {/* Subtle footer credit */}
        <footer className="text-center text-[11px] text-charcoal-400 pt-2 pb-6 space-y-1">
          <p>© ROOTIFY Goa — Empowering village artisans, SHGs, and traditional food makers.</p>
          <p>Scan verified packaging QR stickers to confirm authentic culinary origin.</p>
        </footer>

      </main>

    </div>
  );
};

export default ProductStoryPage;
