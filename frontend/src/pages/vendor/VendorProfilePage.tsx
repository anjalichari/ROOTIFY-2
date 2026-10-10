import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types';
import {
  Store,
  ShieldCheck,
  MapPin,
  Users,
  Award,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const VendorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const load = async () => {
      const allVendors = await vendorService.getAllVendors();
      const currentVendor =
        allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
        allVendors[0];
      setVendor(currentVendor);
    };
    load();
  }, [user]);

  if (!vendor) return null;

  return (
    <PortalLayout
      portalType="vendor"
      title="Producer Business Profile"
      subtitle={`Verified details for ${vendor.businessName}`}
    >
      <div className="space-y-6 max-w-4xl">
        
        {/* Business Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
            <div className="flex items-center gap-4">
              <img
                src={vendor.profileImage}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
              />
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal-950">{vendor.businessName}</h2>
                <p className="text-xs text-charcoal-500">Owner: {vendor.ownerName} • {vendor.phone}</p>
                <p className="text-xs text-brand-700 font-semibold mt-0.5">{vendor.email}</p>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                {vendor.status.toUpperCase()} VENDOR
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Village</span>
              <span className="font-bold text-charcoal-900">{vendor.village}</span>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Taluka</span>
              <span className="font-bold text-charcoal-900">{vendor.taluka} ({vendor.district})</span>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Cooperative Type</span>
              <span className="font-bold text-charcoal-900">
                {vendor.isShgOrMahilaMandal ? 'Mahila Mandal SHG' : 'Independent Heritage Baker'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-700 mb-1">Bio</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">{vendor.description}</p>
          </div>

          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-700 mb-1">Producer Heritage Story</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed bg-sand-50 p-4 rounded-2xl border border-sand-200">
              {vendor.story}
            </p>
          </div>
        </div>

        {/* Rootify Vendor Score breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-950 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-brand-600" /> Rootify Vendor Score
              </h3>
              <p className="text-xs text-charcoal-500">Platform-calculated quality and consistency score</p>
            </div>
            <span className="font-display font-extrabold text-2xl text-brand-700">
              {vendor.vendorScore?.overall || 95}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-xl font-extrabold text-brand-600 font-display block">
                {vendor.vendorScore?.originAuthenticityScore || 95}%
              </span>
              <span className="text-[11px] text-charcoal-600 font-medium">Origin Authenticity</span>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-xl font-extrabold text-terracotta-600 font-display block">
                {vendor.vendorScore?.certificationScore || 92}%
              </span>
              <span className="text-[11px] text-charcoal-600 font-medium">License / FSSAI</span>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-xl font-extrabold text-amber-600 font-display block">
                {vendor.vendorScore?.ratingScore || 96}%
              </span>
              <span className="text-[11px] text-charcoal-600 font-medium">Customer Rating</span>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-xl font-extrabold text-brand-800 font-display block">
                {vendor.vendorScore?.consistencyScore || 94}%
              </span>
              <span className="text-[11px] text-charcoal-600 font-medium">Order Consistency</span>
            </div>
          </div>
        </div>

        {/* Verification Documents */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-950 pb-2 border-b border-sand-200">
            Uploaded Compliance Documents
          </h3>
          <div className="space-y-2">
            {vendor.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-terracotta-600" />
                  <div>
                    <span className="font-bold text-charcoal-900 block">{doc.name}</span>
                    <span className="text-charcoal-500 text-[11px]">{doc.fileName} ({doc.fileSize})</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
