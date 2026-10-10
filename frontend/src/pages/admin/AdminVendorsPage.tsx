import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { vendorService } from '../../services/vendorService';
import { Vendor } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  ShieldCheck,
  Check,
  X,
  FileText,
  AlertTriangle,
  Users,
  Eye,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react';

export const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadVendors = async () => {
    setLoading(true);
    try {
      const all = await vendorService.getAllVendors();
      setVendors(all);
    } catch (e) {
      console.error('Error loading vendors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleApprove = async (vendorId: string) => {
    try {
      const updated = await vendorService.approveVendor(vendorId);
      showToast(`Approved ${updated.businessName}! Vendor is now active.`, 'success');
      setSelectedVendor(null);
      loadVendors();
    } catch (e) {
      console.error('Approval failed:', e);
    }
  };

  const handleReject = async (vendorId: string) => {
    const reason = window.prompt(
      'Enter rejection reason for vendor (e.g. Blurry FSSAI certificate or incomplete trade license):'
    );
    if (!reason) return;

    try {
      const updated = await vendorService.rejectVendor(vendorId, reason);
      showToast(`Application for ${updated.businessName} rejected. Reason sent to vendor.`, 'info');
      setSelectedVendor(null);
      loadVendors();
    } catch (e) {
      console.error('Rejection failed:', e);
    }
  };

  const filtered = vendors.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  return (
    <PortalLayout
      portalType="admin"
      title="Producer & SHG Verification"
      subtitle="Review trade licenses, FSSAI certificates, and approve Goan village producers"
    >
      <div className="space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sand-300 overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: 'all', label: 'All Producers', count: vendors.length },
            { id: 'pending', label: 'Pending Review', count: vendors.filter((v) => v.status === 'pending').length },
            { id: 'approved', label: 'Approved & Active', count: vendors.filter((v) => v.status === 'approved').length },
            { id: 'rejected', label: 'Rejected / Needs Changes', count: vendors.filter((v) => v.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filter === tab.id ? 'bg-brand-700 text-white' : 'bg-sand-200 text-charcoal-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Vendors List Table */}
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Producer & Village</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-6 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-sand-50/50 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={v.profileImage}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-sand-300 shrink-0"
                      />
                      <div>
                        <span className="font-display font-bold text-sm text-charcoal-900 block">
                          {v.businessName}
                        </span>
                        <span className="text-charcoal-500 text-[11px] flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-terracotta-500" /> {v.village}, {v.taluka}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium">
                      {v.isShgOrMahilaMandal ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                          <Users className="w-3 h-3 text-brand-600" /> Mahila Mandal
                        </span>
                      ) : (
                        <span className="text-charcoal-600 text-xs">Artisanal Bakery</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-charcoal-900 block">{v.ownerName}</span>
                      <span className="text-charcoal-400 text-[11px]">{v.email}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          v.status === 'approved'
                            ? 'bg-brand-50 text-brand-800 border-brand-300'
                            : v.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-charcoal-600">
                      <span className="font-bold text-charcoal-900">{v.documents.length}</span> files attached
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVendor(v)}
                          className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-charcoal-800 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </button>

                        {v.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(v.id)}
                              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(v.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1 border border-rose-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Inspect Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-sand-300 overflow-hidden">
            
            <div className="p-5 border-b border-sand-200 flex items-center justify-between bg-sand-50 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedVendor.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                />
                <div>
                  <h3 className="font-display font-bold text-base text-charcoal-900">
                    {selectedVendor.businessName}
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    {selectedVendor.village}, {selectedVendor.taluka} • Owner: {selectedVendor.ownerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <span className="font-bold text-charcoal-700 uppercase tracking-wider block mb-1">
                  Heritage Story & Kitchen Methods
                </span>
                <p className="text-charcoal-600 leading-relaxed bg-sand-50 p-3 rounded-xl border border-sand-200">
                  {selectedVendor.story}
                </p>
              </div>

              <div>
                <span className="font-bold text-charcoal-700 uppercase tracking-wider block mb-2">
                  Attached Compliance Documents
                </span>
                <div className="space-y-2">
                  {selectedVendor.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-sand-50 rounded-xl border border-sand-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-terracotta-600" />
                        <div>
                          <span className="font-bold text-charcoal-900 block">{doc.name}</span>
                          <span className="text-[10px] text-charcoal-500">{doc.fileName} ({doc.fileSize})</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-200 text-charcoal-700">
                        Mock Metadata Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVendor.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <strong className="font-bold block">Current Rejection Reason:</strong>
                  <span>{selectedVendor.rejectionReason}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-sand-200 flex items-center justify-between shrink-0 bg-sand-50/50">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 text-xs font-bold text-charcoal-600 hover:bg-sand-100 rounded-xl cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReject(selectedVendor.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 cursor-pointer"
                >
                  Reject with Reason
                </button>
                <button
                  onClick={() => handleApprove(selectedVendor.id)}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Approve Application
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </PortalLayout>
  );
};
