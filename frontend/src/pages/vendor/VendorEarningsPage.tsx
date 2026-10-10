import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { vendorService } from '../../services/vendorService';
import { SettlementRecord, Vendor } from '../../types';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const VendorEarningsPage: React.FC = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);

  useEffect(() => {
    const loadEarnings = async () => {
      const allVendors = await vendorService.getAllVendors();
      const currentVendor =
        allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
        allVendors[0];
      setVendor(currentVendor);

      const allSettlements = await adminService.getSettlements();
      const vendorSets = allSettlements.filter(
        (s: SettlementRecord) => currentVendor && (s.vendorId === currentVendor.id || currentVendor.id === 'v-maria-foods')
      );
      setSettlements(vendorSets);
    };
    loadEarnings();
  }, [user]);

  const totalEarned = settlements.reduce((sum, s) => sum + s.vendorPayable, 0);
  const settledAmount = settlements
    .filter((s) => s.status === 'SETTLED')
    .reduce((sum, s) => sum + s.vendorPayable, 0);
  const eligibleAmount = settlements
    .filter((s) => s.status === 'ELIGIBLE')
    .reduce((sum, s) => sum + s.vendorPayable, 0);
  const pendingAmount = settlements
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.vendorPayable, 0);

  return (
    <PortalLayout
      portalType="vendor"
      title="Vendor Earnings & Settlements"
      subtitle={`Revenue and payout records for ${vendor?.businessName}`}
    >
      <div className="space-y-8">
        
        {/* Settlement Lifecycle Concept Banner */}
        <div className="p-6 rounded-3xl bg-sand-100 border border-sand-300 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h3 className="font-display font-bold text-sm text-charcoal-900">
              Rootify Fair Producer Settlement Flow
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs text-charcoal-600 pt-2">
            <div className="p-3 bg-white rounded-xl border border-sand-200">
              <span className="font-bold text-brand-700 block mb-1">1. Customer Pays</span>
              <span>UPI / COD recorded securely at checkout.</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-sand-200">
              <span className="font-bold text-brand-700 block mb-1">2. Recorded Payable</span>
              <span>Order processed & 95% credited to vendor ledger.</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-sand-200">
              <span className="font-bold text-brand-700 block mb-1">3. Order Delivered</span>
              <span>Delivery partner confirms doorstep handover.</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-sand-200">
              <span className="font-bold text-terracotta-700 block mb-1">4. Settlement Eligible</span>
              <span>Amount unlocks instantly for batch bank payout.</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-sand-200">
              <span className="font-bold text-brand-700 block mb-1">5. Bank Transfer</span>
              <span>Direct NEFT / IMPS transfer to producer account.</span>
            </div>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">
              Total Recorded Earnings
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-950">
              ₹{totalEarned}
            </div>
            <span className="text-[11px] text-charcoal-400 block">Across all orders</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
              Completed Settlements
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-brand-600">
              ₹{settledAmount}
            </div>
            <span className="text-[11px] text-brand-700 font-semibold block">Transferred to Bank</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider block">
              Available for Settlement
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-terracotta-600">
              ₹{eligibleAmount}
            </div>
            <span className="text-[11px] text-terracotta-700 font-semibold block">Ready for Admin Payout</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              In-Transit Orders
            </span>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-600">
              ₹{pendingAmount}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block">Pending Delivery</span>
          </div>

        </div>

        {/* Settlement Records Table */}
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          <div className="p-5 sm:p-6 border-b border-sand-200">
            <h3 className="font-display font-bold text-base text-charcoal-950">
              Settlement Ledger & Transactions
            </h3>
          </div>

          {settlements.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-10 text-center">No settlement records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-4">Gross Order Total</th>
                    <th className="py-3.5 px-4">Platform Fee (5%)</th>
                    <th className="py-3.5 px-4">Net Vendor Payout</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-sand-50/50">
                      <td className="py-3.5 px-6 font-bold text-charcoal-900">
                        {s.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                        ₹{s.orderAmount}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600">
                        -₹{s.platformCommission}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-charcoal-950 font-display text-sm">
                        ₹{s.vendorPayable}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            s.status === 'SETTLED'
                              ? 'bg-brand-50 text-brand-800 border-brand-300'
                              : s.status === 'ELIGIBLE'
                              ? 'bg-terracotta-50 text-terracotta-800 border-terracotta-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
};
