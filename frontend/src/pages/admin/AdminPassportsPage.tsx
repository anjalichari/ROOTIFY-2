import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { passportService } from '../../services/passportService';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { ProductBatch, OriginPassport, PassportMedia, QRScanLog } from '../../types';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Video,
  Activity,
  Calendar,
  MapPin,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Check,
  X,
} from 'lucide-react';

export const AdminPassportsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [passports, setPassports] = useState<OriginPassport[]>([]);
  const [mediaList, setMediaList] = useState<PassportMedia[]>([]);
  const [scanLogs, setScanLogs] = useState<QRScanLog[]>([]);
  const [flaggedScans, setFlaggedScans] = useState<QRScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'batches' | 'claims' | 'media' | 'scans'
  const [activeTab, setActiveTab] = useState<'batches' | 'claims' | 'media' | 'scans'>('batches');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'revoked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Batch for Audit Modal
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [selectedPassport, setSelectedPassport] = useState<OriginPassport | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // QR Modal
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    destinationUrl: string;
    badgeLabel?: string;
    batchInfo?: {
      batchNumber: string;
      productName: string;
      vendorName: string;
      productionDate: string;
      bestBeforeDate?: string;
    };
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    destinationUrl: '',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allBatches, allPassports, allMedia, allScans, flagged] = await Promise.all([
        passportService.getAllBatches(),
        passportService.getAllPassports(),
        passportService.getAllMedia(),
        passportService.getScanLogs(),
        passportService.getFlaggedScans(),
      ]);

      setBatches(allBatches);
      setPassports(allPassports);
      setMediaList(allMedia);
      setScanLogs(allScans);
      setFlaggedScans(flagged);
    } catch (err) {
      console.error('Error loading admin passport data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Approve Batch
  const handleApproveBatch = async (batchId: string) => {
    setIsProcessing(true);
    try {
      const reviewer = user?.name || 'Rootify Lead Auditor';
      await passportService.approveBatch(batchId, reviewer, auditNotes);
      showToast('Batch approved! Origin Passport is now Active & Verified.', 'success');
      setSelectedBatch(null);
      setSelectedPassport(null);
      setAuditNotes('');
      await loadAllData();
    } catch (err) {
      showToast('Failed to approve batch', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Revoke Batch
  const handleRevokeBatch = async (batchId: string) => {
    const reason = window.prompt(
      'Enter reason for QR Revocation (e.g., Label tampering report, batch recall, unverified chemical residue):'
    );
    if (!reason) return;

    setIsProcessing(true);
    try {
      const reviewer = user?.name || 'Rootify Compliance Officer';
      await passportService.revokeBatch(batchId, reviewer, reason);
      showToast(`Batch QR revoked: "${reason}". Customer passport will show Revoked warning.`, 'info');
      setSelectedBatch(null);
      setSelectedPassport(null);
      await loadAllData();
    } catch (err) {
      showToast('Failed to revoke batch', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Media Moderation
  const handleModerateMedia = async (mediaId: string, status: 'approved' | 'rejected') => {
    try {
      const reviewer = user?.name || 'Rootify Content Moderator';
      await passportService.moderateMedia(mediaId, status, reviewer);
      showToast(
        status === 'approved' ? 'Media approved for public Origin Passport!' : 'Media rejected from public display.',
        status === 'approved' ? 'success' : 'info'
      );
      await loadAllData();
    } catch (err) {
      showToast('Failed to update media status', 'error');
    }
  };

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesQuery =
      searchQuery === '' ||
      b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <PortalLayout
      portalType="admin"
      title="Origin Passports & Authenticity Audits"
      subtitle="Audit Goan producer heritage claims, verify product batches, moderate origin media, and monitor scan integrity"
    >
      <div className="space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-sand-300 shadow-2xs">
            <div className="flex items-center justify-between text-charcoal-500 mb-1">
              <span className="text-xs font-semibold">Total Batches</span>
              <Layers className="w-4 h-4 text-brand-700" />
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-900">{batches.length}</div>
            <div className="text-[11px] text-charcoal-400 mt-0.5">Across registered Goan producers</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-300 shadow-2xs">
            <div className="flex items-center justify-between text-charcoal-500 mb-1">
              <span className="text-xs font-semibold">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-display font-extrabold text-2xl text-amber-700">
              {batches.filter((b) => b.status === 'pending').length}
            </div>
            <div className="text-[11px] text-charcoal-400 mt-0.5">Awaiting audit approval</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-300 shadow-2xs">
            <div className="flex items-center justify-between text-charcoal-500 mb-1">
              <span className="text-xs font-semibold">Verified Active</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-display font-extrabold text-2xl text-emerald-700">
              {batches.filter((b) => b.status === 'active').length}
            </div>
            <div className="text-[11px] text-charcoal-400 mt-0.5">Live QR labels on physical products</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sand-300 shadow-2xs">
            <div className="flex items-center justify-between text-charcoal-500 mb-1">
              <span className="text-xs font-semibold">Scan Velocity Alerts</span>
              <Activity className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-display font-extrabold text-2xl text-rose-700">{flaggedScans.length}</div>
            <div className="text-[11px] text-charcoal-400 mt-0.5">High scan volume warnings (&gt;50)</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-sand-300 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'batches'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Product Batches & QRs ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'claims'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Origin Claims & Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Origin Media Moderation ({mediaList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scans'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Anti-Counterfeiting & Scans ({scanLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT BATCHES & QRS */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-sand-300">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by product, producer, or batch code (e.g. RTF-BEB)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'pending', 'active', 'revoked'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
                    }`}
                  >
                    {st === 'all' ? 'All Batches' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Table */}
            <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Batch Code & Product</th>
                      <th className="py-3.5 px-4">Producer / Village</th>
                      <th className="py-3.5 px-4">Dates & Volume</th>
                      <th className="py-3.5 px-4">Audit Status</th>
                      <th className="py-3.5 px-4">Audited By</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 text-charcoal-700">
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-charcoal-400">
                          No batches found matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBatches.map((batch) => {
                        const passport = passports.find((p) => p.batchId === batch.id);

                        return (
                          <tr key={batch.id} className="hover:bg-sand-50/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-brand-800 text-[11px]">
                                {batch.batchCode}
                              </div>
                              <div className="font-bold text-charcoal-900 mt-0.5">{batch.productName}</div>
                              <div className="text-[10px] text-charcoal-400">Batch #{batch.batchNumber}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-charcoal-900">{batch.vendorName}</div>
                              <div className="text-[10px] text-charcoal-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-brand-600" />
                                {passport?.originVillage || 'Goa'}, {passport?.originTaluka || 'Tiswadi'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div>Prod: {batch.productionDate}</div>
                              {batch.bestBeforeDate && (
                                <div className="text-[10px] text-charcoal-400">Exp: {batch.bestBeforeDate}</div>
                              )}
                              <div className="text-[10px] text-charcoal-500 font-medium">
                                {batch.unitsProduced} units • {batch.scanCount} scans
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  batch.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : batch.status === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {batch.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                {batch.status === 'pending' && <Clock className="w-3 h-3" />}
                                {batch.status === 'revoked' && <ShieldAlert className="w-3 h-3" />}
                                <span className="capitalize">{batch.status}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {batch.reviewedBy ? (
                                <div>
                                  <div className="font-semibold text-charcoal-800">{batch.reviewedBy}</div>
                                  <div className="text-[10px] text-charcoal-400">
                                    {batch.reviewedAt?.slice(0, 10)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-charcoal-400 italic">Unreviewed</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedBatch(batch);
                                    setSelectedPassport(passport || null);
                                    setAuditNotes(batch.reviewNotes || '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal-800 font-bold text-[11px] transition flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Audit</span>
                                </button>

                                <button
                                  onClick={() =>
                                    setQrModalData({
                                      isOpen: true,
                                      title: `${batch.productName} Packaging Label`,
                                      subtitle: `Batch: ${batch.batchCode} • ${batch.vendorName}`,
                                      destinationUrl: batch.qrCodeUrl,
                                      badgeLabel: 'Rootify Verified Batch',
                                      batchInfo: {
                                        batchNumber: batch.batchNumber,
                                        productName: batch.productName,
                                        vendorName: batch.vendorName,
                                        productionDate: batch.productionDate,
                                        bestBeforeDate: batch.bestBeforeDate,
                                      },
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal-700 transition"
                                  title="View & Download QR Code"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>

                                <Link
                                  to={`/passport/batch/${batch.batchCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal-700 transition"
                                  title="Open Live Public Origin Passport"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORIGIN CLAIMS & EVIDENCE */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-sand-300">
              <h3 className="font-display font-bold text-sm text-charcoal-900">
                Independent Heritage Claims & Certification Register
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Claims must not be marked authentic unless corroborated by verifiable certificates, GI registrations, or SHG records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passports.flatMap((p) =>
                p.claimsReviewed.map((c, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    className="bg-white rounded-3xl p-5 border border-sand-300 shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                          {p.batchCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            c.verified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {c.verified ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{c.verified ? 'Verified & Audited' : 'Pending Corroboration'}</span>
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-charcoal-900 text-sm">{c.claimName}</h4>
                      <p className="text-xs text-charcoal-600 mt-1">{c.evidenceSummary}</p>

                      {c.certificateNumber && (
                        <div className="mt-2 text-[11px] font-mono bg-sand-50 p-2 rounded-xl border border-sand-200 text-charcoal-700">
                          Certificate / Registration: <strong>{c.certificateNumber}</strong>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-sand-200 text-[11px] text-charcoal-500 flex items-center justify-between">
                      <span>Auditor: {c.reviewerName || 'Unassigned'}</span>
                      <span>Date: {c.reviewDate || 'Pending'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA MODERATION */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-sand-300">
              <h3 className="font-display font-bold text-sm text-charcoal-900">
                Producer Photos & Videos Moderation Queue
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Review photos and videos submitted by Goan producers for inclusion on public Origin Passports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl overflow-hidden border border-sand-300 shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative aspect-video sm:aspect-4/3 bg-sand-100 overflow-hidden">
                    {m.mediaType === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" controls preload="metadata" />
                    ) : (
                      <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" />
                    )}

                    <span
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                        m.moderationStatus === 'approved'
                          ? 'bg-emerald-800/90 text-white'
                          : m.moderationStatus === 'rejected'
                          ? 'bg-rose-800/90 text-white'
                          : 'bg-amber-800/90 text-white'
                      }`}
                    >
                      {m.moderationStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                        {m.category.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-semibold text-charcoal-900 truncate">
                        {m.caption || 'No caption provided'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-sand-200">
                      <button
                        onClick={() => handleModerateMedia(m.id, 'approved')}
                        disabled={m.moderationStatus === 'approved'}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleModerateMedia(m.id, 'rejected')}
                        disabled={m.moderationStatus === 'rejected'}
                        className="flex-1 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANTI-COUNTERFEITING & SCAN VELOCITY MONITOR */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            
            {/* Warning banner regarding anti-counterfeiting */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-amber-900">
                <h4 className="font-bold">Anti-Counterfeiting Audit Advisory</h4>
                <p className="mt-0.5 text-amber-800">
                  Every QR code verifies a digital database entry and reviewed claims. However, high repeat scans across disparate talukas may indicate duplicated photocopy labels. Unusual scan velocity is flagged here for field investigation.
                </p>
              </div>
            </div>

            {/* Scan Activity Table */}
            <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-sand-200 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-charcoal-900">
                    Real-time Consumer Scan Audit Log
                  </h4>
                  <p className="text-xs text-charcoal-500">
                    Privacy-preserved scan logging with IP-free taluka detection and velocity monitoring.
                  </p>
                </div>
                <span className="text-xs font-bold text-charcoal-600 bg-sand-100 px-3 py-1 rounded-full">
                  {scanLogs.length} Scans Logged
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Identifier / Code</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Detected Taluka</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Scan Velocity</th>
                      <th className="py-3 px-4 text-right">Integrity Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 text-charcoal-700">
                    {scanLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-charcoal-400">
                          No consumer scans recorded yet. Scan a batch QR code to see live logging.
                        </td>
                      </tr>
                    ) : (
                      scanLogs.map((log) => (
                        <tr
                          key={log.id}
                          className={log.isFlaggedForReview ? 'bg-rose-50/50' : 'hover:bg-sand-50/50'}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-brand-800">
                            {log.identifier}
                          </td>
                          <td className="py-3 px-4 text-charcoal-600">
                            {new Date(log.scannedAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-charcoal-800">
                              <MapPin className="w-3 h-3 text-brand-600" />
                              {log.talukaDetected}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-charcoal-600">{log.deviceType}</td>
                          <td className="py-3 px-4 font-bold text-charcoal-800">
                            #{log.scanSequenceNumber}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.isFlaggedForReview ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>High Velocity (&gt;50)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Normal Consumer Scan</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BATCH AUDIT MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-sand-300 shadow-2xl my-8 relative">
            <button
              onClick={() => {
                setSelectedBatch(null);
                setSelectedPassport(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-sand-100 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pb-4 border-b border-sand-200">
              <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {selectedBatch.batchCode}
              </span>
              <h3 className="font-display font-bold text-xl text-charcoal-900 mt-2">
                Audit Batch: {selectedBatch.productName}
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Produced by <strong>{selectedBatch.vendorName}</strong> • {selectedBatch.unitsProduced} units
              </p>
            </div>

            <div className="space-y-4 text-xs text-charcoal-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-sand-50 border border-sand-200">
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Production Date</span>
                  <span className="font-semibold">{selectedBatch.productionDate}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Best Before</span>
                  <span className="font-semibold">{selectedBatch.bestBeforeDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Origin Village</span>
                  <span className="font-semibold">{selectedPassport?.originVillage || 'Goa'}, {selectedPassport?.originTaluka}</span>
                </div>
              </div>

              {selectedPassport && (
                <div className="space-y-3">
                  <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                    Traditional Preparation Steps Reviewed
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPassport.traditionalMethodSteps.map((s) => (
                      <div key={s.stepNumber} className="p-2.5 rounded-xl bg-sand-50/70 border border-sand-200 flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {s.stepNumber}
                        </span>
                        <div>
                          <p className="font-bold text-charcoal-900">{s.title}</p>
                          <p className="text-charcoal-600 mt-0.5">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider pt-2">
                    Ingredient Provenance
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPassport.ingredientsSourcing.map((ing, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-sand-300 text-charcoal-800 text-[11px]">
                        <strong>{ing.ingredient}</strong> ({ing.sourceVillage}, {ing.sourceTaluka})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Auditor Decision Notes & Field Remarks
                </label>
                <textarea
                  rows={3}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Notes explaining approval reason, inspection results, or correction requests..."
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 bg-sand-50/50 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-sand-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleRevokeBatch(selectedBatch.id)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition border border-rose-200 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Revoke Passport</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBatch(null);
                      setSelectedPassport(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-sand-300 text-xs font-bold text-charcoal-700 hover:bg-sand-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveBatch(selectedBatch.id)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Activate QR Passport</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ ...qrModalData, isOpen: false })}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        destinationUrl={qrModalData.destinationUrl}
        badgeLabel={qrModalData.badgeLabel}
        batchInfo={qrModalData.batchInfo}
      />
    </PortalLayout>
  );
};
