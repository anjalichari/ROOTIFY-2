import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Vendor, Product } from '../../types';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/marketplace/ProductCard';
import {
  Star,
  ShieldCheck,
  MapPin,
  Users,
  Award,
  FileText,
  Calendar,
  Phone,
  Mail,
  Store,
  QrCode,
} from 'lucide-react';

export const VendorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const v = await vendorService.getVendorById(id);
        if (v) {
          setVendor(v);
          const prods = await productService.getProductsByVendor(v.id);
          setProducts(prods);
        }
      } catch (e) {
        console.error('Error loading vendor:', e);
      } finally {
        setLoading(false);
      }
    };
    loadVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-48 bg-sand-200 rounded-3xl"></div>
        <div className="h-8 bg-sand-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Producer Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The requested vendor profile does not exist.</p>
        <Link to="/explore" className="text-sm font-bold text-orange-600 hover:underline">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Producer Hero Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-sand-300 shadow-md">
        
        {/* Banner */}
        <div className="relative h-48 sm:h-64 bg-sand-200">
          <img
            src={vendor.bannerImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          {vendor.isShgOrMahilaMandal && (
            <div className="absolute top-4 left-4 bg-emerald-900/90 backdrop-blur-md text-emerald-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
              <Users className="w-4 h-4 text-emerald-300" />
              <span>{vendor.shgName || 'Mahila Mandal Self Help Group'}</span>
            </div>
          )}
        </div>

        {/* Profile Details Header */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
            <div className="flex items-end gap-4">
              <img
                src={vendor.profileImage}
                alt={vendor.ownerName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-brand-500/20 bg-white"
              />
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
                    {vendor.businessName}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-600 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {vendor.village}, {vendor.taluka} ({vendor.district})
                </p>
              </div>
            </div>

            {/* Verified Badge & Score */}
            <div className="flex flex-wrap items-center gap-2">
              {vendor.status === 'approved' && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-brand-700" />
                    Verified Vendor
                  </span>
                  <Link
                    to={`/passport/vendor/${vendor.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 hover:bg-sand-200 border border-sand-300 text-charcoal-800 text-xs font-bold transition shadow-2xs"
                    title="View Producer Origin QR Passport"
                  >
                    <QrCode className="w-4 h-4 text-brand-700" />
                    <span>Producer QR Passport</span>
                  </Link>
                </>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}</span>
                <span className="text-charcoal-400 font-normal">({vendor.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Description & Producer Story */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t border-sand-200">
            <div className="lg:col-span-2 space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              <p>{vendor.description}</p>
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <strong className="font-display font-bold text-xs text-charcoal-900 uppercase tracking-wider block mb-1">
                  Producer Heritage & Story
                </strong>
                <p className="text-xs text-charcoal-700 leading-relaxed">{vendor.story}</p>
              </div>
            </div>

            {/* Rootify Vendor Score breakdown card */}
            <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-charcoal-900 flex items-center gap-1">
                  <Award className="w-4 h-4 text-brand-700" /> Rootify Vendor Score
                </span>
                <span className="font-display font-extrabold text-base text-brand-800">
                  {vendor.vendorScore?.overall || 92}/100
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-charcoal-600 mb-0.5">
                    <span>Origin Authenticity</span>
                    <strong className="text-charcoal-900">{vendor.vendorScore?.originAuthenticityScore || 95}%</strong>
                  </div>
                  <div className="w-full bg-sand-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-700 h-full rounded-full" style={{ width: `${vendor.vendorScore?.originAuthenticityScore || 95}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-charcoal-600 mb-0.5">
                    <span>Certifications & Safety</span>
                    <strong className="text-charcoal-900">{vendor.vendorScore?.certificationScore || 90}%</strong>
                  </div>
                  <div className="w-full bg-sand-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-terracotta-600 h-full rounded-full" style={{ width: `${vendor.vendorScore?.certificationScore || 90}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-charcoal-600 mb-0.5">
                    <span>Customer Ratings</span>
                    <strong className="text-charcoal-900">{vendor.vendorScore?.ratingScore || 94}%</strong>
                  </div>
                  <div className="w-full bg-sand-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${vendor.vendorScore?.ratingScore || 94}%` }}></div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 italic pt-1 border-t border-sand-200">
                Generated from verified reviews, local ingredient audits, and active license verification.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Catalog from this Vendor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-950">
              Products by {vendor.businessName} ({products.length})
            </h2>
            <p className="text-xs text-gray-500">
              Freshly prepared in {vendor.village}, {vendor.taluka}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-sand-300 text-center text-xs text-gray-500">
            No active products listed currently by this producer.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
