import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { TALUKAS } from '../../data/locations';
import { CATEGORIES } from '../../data/categories';
import { VendorDocument } from '../../types';
import {
  Store,
  Upload,
  FileText,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

export const VendorRegisterPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState('Guirim');
  const [taluka, setTaluka] = useState('Bardez');
  const [district, setDistrict] = useState<'North Goa' | 'South Goa'>('North Goa');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('Goan Sweets & Delicacies');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Goan Sweets']);
  const [isShg, setIsShg] = useState(false);
  const [shgName, setShgName] = useState('');

  // Mock uploaded documents
  const [documents, setDocuments] = useState<VendorDocument[]>([
    {
      id: 'doc-panchayat',
      name: 'Panchayat NOC / Trade Permission',
      type: 'panchayat_noc',
      fileName: 'village_panchayat_noc_2026.pdf',
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    },
    {
      id: 'doc-fssai',
      name: 'FSSAI Food Safety Registration',
      type: 'fssai',
      fileName: 'fssai_reg_cert.pdf',
      fileSize: '2.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const handleSimulateDocUpload = (type: VendorDocument['type'], name: string) => {
    const newDoc: VendorDocument = {
      id: `doc-${Date.now()}`,
      name,
      type,
      fileName: `${type}_scanned_document.pdf`,
      fileSize: '1.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    };
    setDocuments([...documents, newDoc]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Ensure vendor user exists in mock auth
      let currentUserId = user?.id;
      if (!user) {
        const dummyVendorUser = await login(email || 'vendor@demo.rootify');
        currentUserId = dummyVendorUser.id;
      }

      const newVendor = await vendorService.registerVendor({
        userId: currentUserId || 'user-vendor-maria',
        businessName,
        ownerName,
        email,
        phone,
        village,
        taluka,
        district,
        description,
        story,
        category,
        productCategories: selectedCategories,
        isShgOrMahilaMandal: isShg,
        shgName: isShg ? shgName : undefined,
        documents,
      });

      setSubmittedSuccess(true);
    } catch (e) {
      console.error('Registration failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-950">
            Producer Application Submitted!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Thank you for applying to ROOTIFY. Your traditional kitchen details and documents have been submitted to the Rootify Admin team for verification.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-sand-100 border border-sand-300 text-xs text-gray-700 max-w-md mx-auto text-left space-y-1.5">
          <p>Status: <strong className="text-amber-700 font-bold uppercase">Pending Verification</strong></p>
          <p>Estimated review time: <strong>24 to 48 hours</strong></p>
          <p className="text-[11px] text-gray-500">You can log into the Admin portal using the Role Switcher to review and approve this application!</p>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            to="/vendor/dashboard"
            className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md"
          >
            Open Vendor Dashboard
          </Link>
          <Link
            to="/"
            className="px-5 py-3 rounded-xl bg-white border border-sand-300 text-charcoal-700 font-bold text-xs hover:bg-sand-50"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-sand-300">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
          <Store className="w-3.5 h-3.5 text-brand-700" />
          <span>Goan Local Producer & SHG Onboarding</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
          Vendor & SHG Registration
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600">
          Join Rootify to sell your authentic Goan confections, spices, pickles, and artisanal food products.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Business Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-900 pb-2 border-b border-sand-200">
            1. Business & Owner Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Producer / Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Maria's Traditional Foods"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Owner / Master Artisan Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Maria Fernandes"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@demo.rootify"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone / WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98221 45012"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Mahila Mandal Checkbox */}
          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isShg}
                onChange={(e) => setIsShg(e.target.checked)}
                className="w-4 h-4 rounded text-brand-700 focus:ring-brand-600 accent-brand-700"
              />
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-700" />
                This is a registered Mahila Mandal / Self Help Group (SHG) / Women's Cooperative
              </span>
            </label>

            {isShg && (
              <div>
                <label className="text-xs font-semibold text-charcoal-700 block mb-1">SHG / Mandal Registered Name</label>
                <input
                  type="text"
                  value={shgName}
                  onChange={(e) => setShgName(e.target.value)}
                  placeholder="e.g. Divar Pragati Mahila Mandal SHG"
                  className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none bg-white focus:ring-1 focus:ring-brand-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Regional Location in Goa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-900 pb-2 border-b border-sand-200">
            2. Production Location & Regional Heritage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Village / Ward *</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Guirim / Raia / Divar"
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Taluka *</label>
              <select
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 bg-white"
              >
                {TALUKAS.map((t) => (
                  <option key={t} value={t}>{t} Taluka</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">District *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 bg-white"
              >
                <option value="North Goa">North Goa</option>
                <option value="South Goa">South Goa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Short Business Bio *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Heirloom Goan confections and multi-layered Bebinca baked with fresh coconut milk..."
              className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Heritage Story & Traditional Technique *</label>
            <textarea
              required
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe your family recipe lineage, clay oven techniques, local ingredient sourcing..."
              className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-2">Product Categories You Sell</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCategory(c.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    selectedCategories.includes(c.name)
                      ? 'bg-brand-700 text-white border-brand-700 shadow-2xs'
                      : 'bg-sand-50 text-charcoal-700 border-sand-300 hover:bg-sand-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Document Verification (Metadata Simulation) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sand-200">
            <div>
              <h2 className="font-display font-bold text-base text-charcoal-900">
                3. Verification & Compliance Documents
              </h2>
              <p className="text-xs text-charcoal-500">
                Submit Panchayat NOC, Trade License, FSSAI, or SHG registration metadata
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-700 shrink-0" />
                  <div>
                    <span className="font-bold text-charcoal-900 block">{doc.name}</span>
                    <span className="text-[11px] text-charcoal-500">{doc.fileName} ({doc.fileSize})</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Attached
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSimulateDocUpload('trade_license', 'Municipal Trade License')}
              className="px-3 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-semibold text-charcoal-700 border border-sand-300 flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> + Attach Trade License
            </button>
            <button
              type="button"
              onClick={() => handleSimulateDocUpload('business_photo', 'Traditional Workshop Photo')}
              className="px-3 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-semibold text-charcoal-700 border border-sand-300 flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" /> + Attach Kitchen Photo
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{isSubmitting ? 'Submitting Registration...' : 'Submit Application for Admin Review'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
