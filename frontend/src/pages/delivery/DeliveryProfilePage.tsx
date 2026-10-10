import React from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Bike,
  Star,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
} from 'lucide-react';

export const DeliveryProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <PortalLayout
      portalType="delivery"
      title="Delivery Partner Profile"
      subtitle="Goa Dispatch Hub & Operational Status"
    >
      <div className="max-w-3xl space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
              />
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal-950">
                  {user?.name || 'Rohan Naik'}
                </h2>
                <p className="text-xs text-charcoal-500">{user?.email || 'delivery@demo.rootify'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-300">
                    Active & Available
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.95 Partner Rating
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-charcoal-500 block">Assigned Delivery Hub</span>
              <span className="text-xs font-bold text-charcoal-900 block">North Goa Central (Porvorim)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Vehicle Model</span>
              <span className="font-bold text-charcoal-900">{user?.vehicleType || 'Honda Activa 6G Hybrid'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Registration No.</span>
              <span className="font-bold text-charcoal-900">{user?.vehicleNumber || 'GA 07 AA 4590'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Completed Deliveries</span>
              <span className="font-bold text-brand-700 font-display text-base">148 Trips</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Verified Regional Carrier:</strong>
              <p>
                Authorized to transport sealed artisanal food packages across Bardez, Tiswadi, Ponda, and Salcete Talukas in compliance with hygiene & food transit norms.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
