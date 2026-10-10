import React from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Award,
  Star,
  CheckCircle2,
  Bike,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const categorySales = [
    { name: 'Goan Sweets & Bebinca', share: 38, sales: '₹28,400', color: 'bg-brand-600' },
    { name: 'Traditional Foods (Choriz, Poee)', share: 26, sales: '₹19,500', color: 'bg-terracotta-600' },
    { name: 'Spices & Stone-Ground Masalas', share: 18, sales: '₹13,200', color: 'bg-amber-600' },
    { name: 'Canacona Forest Kokum & Syrups', share: 11, sales: '₹8,100', color: 'bg-brand-700' },
    { name: 'Pickles & Preserves', share: 7, sales: '₹5,200', color: 'bg-brand-900' },
  ];

  const topTalukas = [
    { name: 'Bardez Taluka', orderCount: 64, rating: '4.9★' },
    { name: 'Tiswadi Taluka', orderCount: 52, rating: '4.8★' },
    { name: 'Salcete Taluka', orderCount: 38, rating: '4.8★' },
    { name: 'Ponda Taluka', orderCount: 22, rating: '4.9★' },
    { name: 'Canacona Taluka', orderCount: 14, rating: '4.95★' },
  ];

  return (
    <PortalLayout
      portalType="admin"
      title="Regional Marketplace Analytics"
      subtitle="Goa sales performance, category trends, and regional fulfillment metrics"
    >
      <div className="space-y-6">
        
        {/* Category Share Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-950">
                Sales by Goan Food Category
              </h3>
              <p className="text-xs text-charcoal-500">Regional customer demand and volume</p>
            </div>
            <span className="font-display font-bold text-sm text-charcoal-900">Total: ₹74,400</span>
          </div>

          <div className="space-y-4">
            {categorySales.map((cat) => (
              <div key={cat.name} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-charcoal-800">{cat.name}</span>
                  <div className="space-x-3">
                    <span className="text-charcoal-400">{cat.share}%</span>
                    <strong className="text-charcoal-900">{cat.sales}</strong>
                  </div>
                </div>
                <div className="w-full bg-sand-200 h-2.5 rounded-full overflow-hidden">
                  <div className={`${cat.color} h-full rounded-full transition-all duration-500`} style={{ width: `${cat.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Hubs & Fulfillment Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-200">
              <MapPin className="w-5 h-5 text-terracotta-600" />
              <h3 className="font-display font-bold text-base text-charcoal-950">Top Performing Talukas</h3>
            </div>

            <div className="divide-y divide-sand-200 text-xs">
              {topTalukas.map((t) => (
                <div key={t.name} className="py-2.5 first:pt-0 flex items-center justify-between">
                  <span className="font-bold text-charcoal-900">{t.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-charcoal-600">{t.orderCount} Orders</span>
                    <span className="font-bold text-amber-600">{t.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-sand-200">
              <Bike className="w-5 h-5 text-brand-600" />
              <h3 className="font-display font-bold text-base text-charcoal-950">Fulfillment & SLA Health</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 flex justify-between items-center">
                <span className="text-charcoal-700">Avg. Doorstep Delivery Time</span>
                <strong className="text-sm font-display font-bold text-charcoal-900">34 Mins</strong>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 flex justify-between items-center">
                <span className="text-charcoal-700">Delivery Completion Rate</span>
                <strong className="text-sm font-display font-bold text-brand-700">99.2%</strong>
              </div>

              <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 flex justify-between items-center">
                <span className="text-charcoal-700">Average Verified Rating</span>
                <strong className="text-sm font-display font-bold text-amber-600">4.88 ★</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PortalLayout>
  );
};
