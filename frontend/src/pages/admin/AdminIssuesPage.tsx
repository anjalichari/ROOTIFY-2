import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { adminService } from '../../services/adminService';
import { SupportIssue } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  DollarSign,
} from 'lucide-react';

export const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<SupportIssue[]>([]);
  const { showToast } = useToast();

  const loadIssues = async () => {
    const all = await adminService.getSupportIssues();
    setIssues(all);
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleResolve = async (
    issueId: string,
    resolution: 'REFUNDED' | 'RESOLVED_NO_REFUND' | 'REJECTED'
  ) => {
    await adminService.resolveIssue(issueId, resolution);
    showToast(`Dispute resolved as ${resolution.replace(/_/g, ' ')}`, 'success');
    loadIssues();
  };

  return (
    <PortalLayout
      portalType="admin"
      title="Customer Disputes & Refund Requests"
      subtitle="Handle damaged goods, delivery transit issues, and customer refund claims"
    >
      <div className="space-y-6">
        
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          {issues.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-12 text-center">No active dispute claims recorded.</p>
          ) : (
            <div className="divide-y divide-sand-200">
              {issues.map((iss) => (
                <div key={iss.id} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-charcoal-950">
                          {iss.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                            iss.status === 'REFUNDED'
                              ? 'bg-brand-50 text-brand-800 border-brand-300'
                              : iss.status === 'OPEN'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-sand-100 text-charcoal-700'
                          }`}
                        >
                          {iss.status}
                        </span>
                        <span className="text-xs font-semibold text-rose-600">
                          Claim: ₹{iss.requestedRefundAmount}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        Customer: <strong>{iss.customerName}</strong> • Producer: <strong>{iss.vendorName}</strong>
                      </p>
                    </div>

                    {iss.status === 'OPEN' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolve(iss.id, 'REFUNDED')}
                          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Approve Refund (₹{iss.requestedRefundAmount})
                        </button>
                        <button
                          onClick={() => handleResolve(iss.id, 'REJECTED')}
                          className="px-3.5 py-1.5 bg-sand-100 hover:bg-sand-200 text-charcoal-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Reject Claim
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 text-xs">
                    <span className="font-bold text-charcoal-900 block mb-1">
                      Reported Issue ({iss.issueType.replace(/_/g, ' ')}):
                    </span>
                    <p className="text-charcoal-700 leading-relaxed">{iss.description}</p>
                    {iss.resolutionNote && (
                      <div className="mt-2 pt-2 border-t border-sand-200 text-[11px] text-brand-800 font-semibold">
                        Resolution Note: {iss.resolutionNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
};
