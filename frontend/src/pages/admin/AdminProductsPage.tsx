import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { productService } from '../../services/productService';
import { Product, TrustBadgeLevel } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  AlertCircle,
  Eye,
  Filter,
  ExternalLink,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'needs_attention' | 'under_review'>('all');
  const { showToast } = useToast();

  const loadProducts = async () => {
    const prods = await productService.getAllProducts();
    setProducts(prods);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: 'active' | 'needs_attention' | 'under_review'
  ) => {
    await productService.updateModerationStatus(id, status);
    showToast(`Product moderation status updated to ${status.replace('_', ' ')}`, 'info');
    loadProducts();
  };

  const handleUpdateTrustBadge = async (id: string, badge: TrustBadgeLevel) => {
    await productService.updateTrustBadge(id, badge);
    showToast(`Trust badge updated to "${badge}". ${badge === 'Verified' ? 'Product marked as Verified Origin.' : ''}`, 'success');
    loadProducts();
  };

  const filtered = products.filter((p) => {
    if (filter === 'all') return true;
    return (p.moderationStatus || 'active') === filter;
  });

  return (
    <PortalLayout
      portalType="admin"
      title="Product Catalog Moderation"
      subtitle="Monitor recipe compliance, quality reviews, and origin authenticity across all dishes"
    >
      <div className="space-y-6">
        
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sand-300 overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: 'all', label: 'All Catalog Dishes', count: products.length },
            { id: 'active', label: 'Active & Verified', count: products.filter((p) => (p.moderationStatus || 'active') === 'active').length },
            { id: 'needs_attention', label: 'Needs Attention', count: products.filter((p) => p.moderationStatus === 'needs_attention').length },
            { id: 'under_review', label: 'Under Review', count: products.filter((p) => p.moderationStatus === 'under_review').length },
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

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Product & Dish</th>
                  <th className="py-3.5 px-4">Producer</th>
                  <th className="py-3.5 px-4">Price / Unit</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Moderation Status</th>
                  <th className="py-3.5 px-4">Origin Trust Badge</th>
                  <th className="py-3.5 px-4">Public Story</th>
                  <th className="py-3.5 px-6 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {filtered.map((p) => {
                  const currentBadge = p.trustBadge || (p.isVerifiedOrigin ? 'Verified' : 'Self-declared');
                  return (
                    <tr key={p.id} className="hover:bg-sand-50/50">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-sand-200 shrink-0"
                        />
                        <div>
                          <span className="font-display font-bold text-sm text-charcoal-900 block truncate max-w-xs">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-charcoal-500">{p.categoryName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                        {p.vendorName}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-charcoal-950 font-display">
                        ₹{p.price} <span className="text-[10px] text-charcoal-400 font-normal">/ {p.unit}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {p.rating.toFixed(1)} ({p.reviewCount})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                            p.moderationStatus === 'under_review'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : p.moderationStatus === 'needs_attention'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-brand-50 text-brand-800 border-brand-300'
                          }`}
                        >
                          {p.moderationStatus || 'active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={currentBadge}
                          onChange={(e) => handleUpdateTrustBadge(p.id, e.target.value as TrustBadgeLevel)}
                          className={`px-2 py-1 text-xs border rounded-lg font-bold outline-none cursor-pointer ${
                            currentBadge === 'Verified'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : currentBadge === 'Evidence added'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="Self-declared">Self-declared</option>
                          <option value="Evidence added">Evidence added</option>
                          <option value="Verified">Verified (Admin)</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/p/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sand-100 hover:bg-brand-50 text-brand-800 text-xs font-bold transition border border-sand-300"
                          title="Preview Public Product Story"
                        >
                          <span>View Story</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <select
                          value={p.moderationStatus || 'active'}
                          onChange={(e) => handleUpdateStatus(p.id, e.target.value as any)}
                          className="px-2.5 py-1 text-xs border border-sand-300 rounded-lg bg-white outline-none font-semibold text-charcoal-700 cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="needs_attention">Needs Attention</option>
                          <option value="under_review">Under Review</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
