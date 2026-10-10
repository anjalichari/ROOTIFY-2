import React from 'react';
import { Link } from 'react-router-dom';
import { Vendor } from '../../types';
import { Star, ShieldCheck, MapPin, Users, Award, ChevronRight } from 'lucide-react';

interface VendorCardProps {
  vendor: Vendor;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <Link
      to={`/vendor/${vendor.id}`}
      className="group bg-white rounded-2xl border border-sand-300 hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Banner */}
      <div className="relative h-28 sm:h-32 bg-sand-200 overflow-hidden">
        <img
          src={vendor.bannerImage}
          alt={vendor.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* SHG / Mandal Badge */}
        {vendor.isShgOrMahilaMandal && (
          <div className="absolute top-2.5 left-2.5 bg-brand-900/90 backdrop-blur-md text-brand-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-brand-500/30">
            <Users className="w-3 h-3 text-brand-300" />
            <span>Mahila Mandal / SHG</span>
          </div>
        )}

        {/* Score pill */}
        <div className="absolute top-2.5 right-2.5 bg-brand-800/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-brand-600/30">
          <Award className="w-3 h-3 text-brand-300" />
          <span>Score {vendor.vendorScore?.overall || 90}/100</span>
        </div>
      </div>

      {/* Body with overlapping profile avatar */}
      <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-end justify-between -mt-6 mb-2">
            <img
              src={vendor.profileImage}
              alt={vendor.ownerName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md ring-2 ring-brand-500/20"
            />
            {vendor.status === 'approved' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-700" /> Verified Vendor
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-charcoal-900 text-base group-hover:text-brand-700 transition">
            {vendor.businessName}
          </h3>

          <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {vendor.village}, {vendor.taluka}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-charcoal-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
            </span>
          </div>

          <p className="text-xs text-charcoal-600 mt-2 line-clamp-2 leading-relaxed">
            {vendor.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between text-xs">
          <span className="text-charcoal-500 font-medium">
            {vendor.productCategories.slice(0, 2).join(', ')}
          </span>
          <span className="text-brand-700 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            View Products <ChevronRight className="w-3.5 h-3.5 text-brand-600" />
          </span>
        </div>
      </div>
    </Link>
  );
};
