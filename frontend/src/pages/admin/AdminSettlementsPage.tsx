import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { adminService } from '../../services/adminService';
import { SettlementRecord } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AdminSettlementsPage: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [isSettlingId, setIsSettlingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadSettlements = async () => {
    const all = await adminService.getSettlements();
    setSettlements(all);
  };

  useEffect(() => {
    loadSettlements();
  }, []);

  const handleSettle = async (id: string) => {
    setIsSettlingId(id);
    try {
      await adminService.settleVendorPayout(id);
      showToast('Payout settled to vendor bank account!', 'success');
      loadSettlements();
    } catch (e) {
      console.error('Settlement failed:', e);
    } finally {
      setIsSettlingId(null);
    }
  };

  const totalGMV = settlements.reduce((sum, s) => sum + s.orderAmount, 0);
  const platformRevenue = settlements.reduce((sum, s) => sum + s.platformCommission, 0);
  const vendorPayables = settlements.reduce((sum, s) => sum + s.vendorPayable, 0);
  const settledTotal = settlements
    .filter((s) => s.status === 'SETTLED')
    .reduce((sum, s) => sum + s.vendorPayable, 0);

  return (
    <PortalLayout
      portalType="admin"
      title="Vendor Settlement Management"
      subtitle="Track platform commissions (5%) and execute direct producer bank payouts"
    >
      <div className="space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Gross GMV</span>
            <div className="font-display font-extrabold text-2xl text-charcoal-950">₹{totalGMV}</div>
            <span className="text-[11px] text-charcoal-400">Total customer order payments</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-brand-700 uppercase">Platform Revenue</span>
            <div className="font-display font-extrabold text-2xl text-brand-600">₹{platformRevenue}</div>
            <span className="text-[11px] text-charcoal-400">5% fair platform fee</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-terracotta-700 uppercase">Total Producer Share</span>
            <div className="font-display font-extrabold text-2xl text-terracotta-600">₹{vendorPayables}</div>
            <span className="text-[11px] text-charcoal-400">95% net payable to producers</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-brand-800 uppercase">Settled to Bank</span>
            <div className="font-display font-extrabold text-2xl text-brand-700">₹{settledTotal}</div>
            <span className="text-[11px] text-charcoal-400">Transfers completed</span>
          </div>

        </div>

        {/* Settlements Table */}
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-sand-200">
            <h3 className="font-display font-bold text-base text-charcoal-950">
              Producer Payout Queue
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-4">Producer Name</th>
                  <th className="py-3.5 px-4">Order Gross</th>
                  <th className="py-3.5 px-4">Commission (5%)</th>
                  <th className="py-3.5 px-4">Producer Payable</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-sand-50/50">
                    <td className="py-3.5 px-6 font-bold text-charcoal-900">{s.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal-800">{s.vendorName}</td>
                    <td className="py-3.5 px-4 text-charcoal-800">₹{s.orderAmount}</td>
                    <td className="py-3.5 px-4 text-brand-700 font-bold">₹{s.platformCommission}</td>
                    <td className="py-3.5 px-4 font-extrabold text-charcoal-950 font-display text-sm">
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
                    <td className="py-3.5 px-6 text-right">
                      {s.status === 'ELIGIBLE' ? (
                        <button
                          onClick={() => handleSettle(s.id)}
                          disabled={isSettlingId === s.id}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Execute Payout
                        </button>
                      ) : s.status === 'SETTLED' ? (
                        <span className="text-[11px] text-brand-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Payout Settled
                        </span>
                      ) : (
                        <span className="text-[11px] text-charcoal-400 italic">Pending Delivery</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
