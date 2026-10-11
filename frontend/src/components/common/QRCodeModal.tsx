import React, { useState, useEffect } from 'react';
import { passportService } from '../../services/passportService';
import {
  X,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  destinationUrl: string;
  badgeLabel?: string;
  batchInfo?: {
    batchNumber: string;
    productName: string;
    vendorName: string;
    productionDate: string;
    bestBeforeDate?: string;
  };
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  destinationUrl,
  badgeLabel = 'Rootify Verified Origin',
  batchInfo,
}) => {
  const [pngUrl, setPngUrl] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const generateCodes = async () => {
      try {
        const fullUrl = destinationUrl.startsWith('http')
          ? destinationUrl
          : `${window.location.origin}${destinationUrl}`;

        const png = await passportService.generatePNG(fullUrl, 1024);
        const svg = await passportService.generateSVG(fullUrl);

        if (isMounted) {
          setPngUrl(png);
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to generate QR code in modal:', err);
        if (isMounted) setLoading(false);
      }
    };

    generateCodes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, destinationUrl]);

  if (!isOpen) return null;

  const fullUrl = destinationUrl.startsWith('http')
    ? destinationUrl
    : `${window.location.origin}${destinationUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!pngUrl) return;
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `ROOTIFY-QR-${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ROOTIFY-QR-${title.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Generator & Printable Label Preview"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-sand-50 rounded-3xl shadow-modal border border-sand-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-brand-700 text-white px-6 py-4 flex items-center justify-between border-b border-brand-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-200 border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-white">{title}</h3>
              <p className="text-xs text-emerald-100">{subtitle || 'Digital Authenticity Passport QR'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-emerald-100 hover:text-white hover:bg-brand-800/60 p-1.5 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Printable Packaging Label Card Preview */}
          <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-brand-300 shadow-sm flex flex-col items-center text-center space-y-4 printable-label">
            
            {/* Label Branding Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-sand-200">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-brand-700 text-white text-xs font-black flex items-center justify-center font-display">
                  R
                </span>
                <span className="font-extrabold text-xs tracking-wider text-charcoal-900 font-display">
                  ROOTIFY GOA
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {badgeLabel}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="relative p-3 bg-white rounded-2xl border border-sand-200 shadow-xs">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-charcoal-400">
                  <Sparkles className="w-6 h-6 animate-spin text-brand-600 mb-2" />
                  Generating high-res QR...
                </div>
              ) : pngUrl ? (
                <img
                  src={pngUrl}
                  alt={`QR Code for ${title}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-red-500">
                  Failed to generate QR
                </div>
              )}
            </div>

            {/* Label Batch Data */}
            {batchInfo && (
              <div className="w-full bg-sand-50 rounded-xl p-3 text-left text-xs space-y-1 border border-sand-200">
                <div className="flex justify-between font-bold text-charcoal-900">
                  <span>{batchInfo.productName}</span>
                  <span className="text-brand-800 font-mono text-[11px]">{batchInfo.batchNumber}</span>
                </div>
                <div className="text-charcoal-600 text-[11px] flex justify-between">
                  <span>Producer: <strong>{batchInfo.vendorName}</strong></span>
                  <span>Packed: <strong>{batchInfo.productionDate}</strong></span>
                </div>
                {batchInfo.bestBeforeDate && (
                  <div className="text-[10px] text-terracotta-700 font-semibold pt-0.5">
                    Best Before: {batchInfo.bestBeforeDate}
                  </div>
                )}
              </div>
            )}

            <p className="text-[11px] text-charcoal-500 max-w-xs">
              Scan with any mobile camera to verify producer heritage, ingredients, and traditional Goan process.
            </p>
          </div>

          {/* Destination URL & Copy Bar */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-charcoal-700">Digital Passport Destination:</span>
            <div className="flex items-center gap-2 bg-sand-100 border border-sand-300 rounded-xl p-2 text-xs text-charcoal-700">
              <span className="truncate flex-1 font-mono text-[11px]">{fullUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 bg-white hover:bg-brand-50 border border-sand-300 text-charcoal-800 hover:text-brand-800 px-2.5 py-1 rounded-lg font-semibold text-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={loading || !pngUrl}
              className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              PNG Label (1024px)
            </button>

            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={loading || !svgContent}
              className="flex items-center justify-center gap-1.5 bg-sand-200 hover:bg-sand-300 text-charcoal-900 font-bold text-xs py-2.5 px-3 rounded-xl border border-sand-300 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Vector SVG
            </button>

            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-white hover:bg-sand-100 text-charcoal-900 font-bold text-xs py-2.5 px-3 rounded-xl border border-sand-300 transition"
            >
              <ExternalLink className="w-4 h-4 text-brand-600" />
              Preview Page
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
