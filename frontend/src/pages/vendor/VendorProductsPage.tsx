import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import { CATEGORIES } from '../../data/categories';
import { TALUKAS } from '../../data/locations';
import { Product, Vendor, TrustBadgeLevel } from '../../types';
import { useToast } from '../../context/ToastContext';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  ShieldCheck,
  X,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ExternalLink,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';

export const VendorProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // QR Modal State
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    destinationUrl: string;
    badgeLabel?: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    destinationUrl: '',
  });

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('sweets');
  const [price, setPrice] = useState<number>(350);
  const [originalPrice, setOriginalPrice] = useState<number>(380);
  const [unit, setUnit] = useState('500g Box');
  const [stockCount, setStockCount] = useState<number>(20);
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [village, setVillage] = useState('Guirim');
  const [taluka, setTaluka] = useState('Bardez');
  const [traditionalMethod, setTraditionalMethod] = useState('');
  const [stepsStr, setStepsStr] = useState('');
  const [ingredientsStr, setIngredientsStr] = useState('');
  const [certificationsStr, setCertificationsStr] = useState('FSSAI Registered, Verified Local Farm');
  const [shelfLife, setShelfLife] = useState('14 Days');
  const [storageTips, setStorageTips] = useState('');
  const [trustBadge, setTrustBadge] = useState<TrustBadgeLevel>('Self-declared');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const allVendors = await vendorService.getAllVendors();
      const currentVendor =
        allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
        allVendors[0];

      setVendor(currentVendor);
      if (currentVendor) {
        setVillage(currentVendor.village);
        setTaluka(currentVendor.taluka);
        const prods = await productService.getProductsByVendor(currentVendor.id);
        setProducts(prods);
      }
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new') {
      handleOpenNew();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [user]);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId('sweets');
    setPrice(300);
    setOriginalPrice(340);
    setUnit('500g Box');
    setStockCount(25);
    setInStock(true);
    setImageUrl('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80');
    setTraditionalMethod('Slow baked layer-by-layer over coconut husk firewood ovens.');
    setStepsStr('Extract first-press coconut milk\nWhisk egg yolks with ghee and nutmeg\nBake each layer over charcoal embers for 5 hours');
    setIngredientsStr('Fresh Coconut Milk, Palm Jaggery, Nutmeg, Cardamom, Pure Cow Ghee');
    setCertificationsStr('FSSAI Registered, Heritage Goan Baker Guild');
    setShelfLife('14 Days at room temperature');
    setStorageTips('Store in an airtight container away from direct sunlight. Do not refrigerate.');
    setTrustBadge('Self-declared');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setUnit(p.unit);
    setStockCount(p.stockCount);
    setInStock(p.inStock);
    setImageUrl(p.images[0] || '');
    setVillage(p.originDetails.village);
    setTaluka(p.originDetails.taluka || p.vendorTaluka);
    setTraditionalMethod(p.originDetails.traditionalMethod);
    setStepsStr(p.originDetails.steps?.join('\n') || p.originDetails.traditionalMethod || '');
    setIngredientsStr(p.originDetails.ingredients.join(', '));
    setCertificationsStr(p.originDetails.certifications.join(', '));
    setShelfLife(p.originDetails.shelfLife);
    setStorageTips(p.originDetails.storageTips || '');
    setTrustBadge(p.trustBadge || (p.isVerifiedOrigin ? 'Verified' : 'Self-declared'));
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to remove this dish/product from your catalog?')) {
      return;
    }
    await productService.deleteProduct(productId);
    showToast('Product removed from catalog', 'info');
    loadData();
  };

  const handleToggleStock = async (p: Product) => {
    await productService.updateProduct(p.id, { inStock: !p.inStock });
    showToast(`${p.name} marked as ${!p.inStock ? 'In Stock' : 'Out of Stock'}`, 'info');
    loadData();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setIsSaving(true);
    try {
      const catObj = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
      const ingredients = ingredientsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const certifications = certificationsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const steps = stepsStr.split('\n').map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);

      // Security rule: Only an admin can set Verified, not the vendor.
      const finalBadge: TrustBadgeLevel =
        editingProduct?.trustBadge === 'Verified'
          ? 'Verified'
          : trustBadge === 'Evidence added'
          ? 'Evidence added'
          : 'Self-declared';

      const isVerified = finalBadge === 'Verified';

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name,
          description,
          categoryId,
          categoryName: catObj.name,
          price: Number(price),
          originalPrice: Number(originalPrice),
          unit,
          stockCount: Number(stockCount),
          inStock,
          images: [imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
          isVerifiedOrigin: isVerified,
          trustBadge: finalBadge,
          originDetails: {
            village,
            taluka,
            traditionalMethod,
            steps: steps.length > 0 ? steps : [traditionalMethod],
            ingredients,
            shelfLife,
            storageTips,
            certifications,
            storySnippet: editingProduct.originDetails.storySnippet || description,
          },
        });
        showToast('Product updated successfully!', 'success');
      } else {
        await productService.addProduct({
          name,
          description,
          categoryId,
          categoryName: catObj.name,
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorLocation: `${village}, ${taluka}`,
          vendorTaluka: taluka,
          price: Number(price),
          originalPrice: Number(originalPrice),
          unit,
          stockCount: Number(stockCount),
          inStock,
          images: [imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'],
          isVerifiedOrigin: false,
          trustBadge: finalBadge,
          originDetails: {
            village,
            taluka,
            traditionalMethod,
            steps: steps.length > 0 ? steps : [traditionalMethod],
            ingredients,
            shelfLife,
            storageTips,
            certifications,
            storySnippet: description,
          },
        });
        showToast('New product added to catalog!', 'success');
      }

      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error('Failed to save product:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout
      portalType="vendor"
      title="Product Catalog Management"
      subtitle={`Manage dishes & confections offered by ${vendor?.businessName}`}
      actionButton={
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      }
    >
      <div className="space-y-6">
        
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-sand-300 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-brand-600 mx-auto opacity-70" />
            <h3 className="font-display font-bold text-lg text-charcoal-900">No Products in Catalog</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Add your first authentic Goan dish, preserve, or baked item to make it available for local customers.
            </p>
            <button
              onClick={handleOpenNew}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Add Product Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-50/80 border-b border-sand-200 text-charcoal-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Product & Image</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price / Unit</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Origin Verified</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-sand-50/50 transition">
                      <td className="py-3.5 px-4 sm:px-6 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-sand-200 shrink-0"
                        />
                        <div>
                          <span className="font-display font-bold text-sm text-charcoal-900 block truncate max-w-xs">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {p.rating.toFixed(1)} ({p.reviewCount} reviews)
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-charcoal-700">
                        {p.categoryName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-display font-bold text-charcoal-900 block">₹{p.price}</span>
                        <span className="text-[10px] text-charcoal-400">{p.unit}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                            p.inStock
                              ? 'bg-brand-50 text-brand-800 border-brand-300 hover:bg-brand-100'
                              : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {p.inStock ? `In Stock (${p.stockCount})` : 'Out of Stock'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            p.trustBadge === 'Verified' || (!p.trustBadge && p.isVerifiedOrigin)
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : p.trustBadge === 'Evidence added'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {p.trustBadge === 'Verified' || (!p.trustBadge && p.isVerifiedOrigin) ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          ) : p.trustBadge === 'Evidence added' ? (
                            <FileCheck2 className="w-3 h-3 text-blue-600" />
                          ) : (
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{p.trustBadge || (p.isVerifiedOrigin ? 'Verified' : 'Self-declared')}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setQrModalData({
                                isOpen: true,
                                title: `${p.name} Packaging Label`,
                                subtitle: `Public Product Story QR (${p.trustBadge || 'Self-declared'})`,
                                destinationUrl: `/p/${p.id}`,
                                badgeLabel: p.trustBadge ? `Rootify ${p.trustBadge}` : 'Rootify Story QR',
                              })
                            }
                            className="p-1.5 rounded-lg text-brand-700 hover:text-brand-900 hover:bg-brand-50 transition cursor-pointer"
                            title="Get Product Story QR code for packaging stickers"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/p/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-brand-700 hover:bg-sand-100 transition cursor-pointer"
                            title="Preview public story page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-charcoal-600 hover:text-brand-600 hover:bg-brand-50 transition cursor-pointer"
                            title="Edit dish"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal with Safe Internal Scroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-sand-300 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-sand-200 flex items-center justify-between bg-sand-50 shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {editingProduct ? 'Edit Product Details' : 'Add New Dish to Catalog'}
                </h3>
                <p className="text-xs text-charcoal-500">
                  Include authentic Goan origin, ingredients, and traditional method
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Product / Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal 7-Layer Goan Bebinca"
                    className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Unit / Packaging *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. 500g Box"
                    className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Product Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe taste, aroma, and occasion..."
                  className="w-full px-3 py-2 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 resize-none bg-white"
                ></textarea>
              </div>

              {/* Origin & Traditional Heritage */}
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <span className="font-bold text-brand-800 uppercase tracking-wider block">
                  Rootify Origin & Traceability Specs
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">Village of Origin</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">Taluka</label>
                    <select
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                    >
                      {TALUKAS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Traditional Preparation Method</label>
                  <input
                    type="text"
                    value={traditionalMethod}
                    onChange={(e) => setTraditionalMethod(e.target.value)}
                    placeholder="e.g. Slow baked layer by layer in firewood clay ovens"
                    className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={ingredientsStr}
                    onChange={(e) => setIngredientsStr(e.target.value)}
                    placeholder="Coconut milk, Egg yolk, Ghee, Nutmeg"
                    className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Preparation Steps (one step per line)</label>
                  <textarea
                    rows={3}
                    value={stepsStr}
                    onChange={(e) => setStepsStr(e.target.value)}
                    placeholder="Step 1: Extract coconut milk&#10;Step 2: Whisk with ghee&#10;Step 3: Slow bake each layer"
                    className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">Shelf Life</label>
                    <input
                      type="text"
                      value={shelfLife}
                      onChange={(e) => setShelfLife(e.target.value)}
                      placeholder="e.g. 14 Days"
                      className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-charcoal-700 block mb-1">Storage Tips</label>
                    <input
                      type="text"
                      value={storageTips}
                      onChange={(e) => setStorageTips(e.target.value)}
                      placeholder="e.g. Keep airtight at room temp"
                      className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Certifications & Badges (comma separated)</label>
                  <input
                    type="text"
                    value={certificationsStr}
                    onChange={(e) => setCertificationsStr(e.target.value)}
                    placeholder="FSSAI Registered, SHG Certified"
                    className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white"
                  />
                </div>

                {/* Trust Badge Level (Vendor cannot set Verified) */}
                <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-1.5">
                  <label className="font-bold text-charcoal-800 block text-[11px] uppercase tracking-wider">
                    Origin Trust Badge
                  </label>
                  {editingProduct?.trustBadge === 'Verified' ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verified by ROOTIFY Admin
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                        Admin Locked
                      </span>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={trustBadge === 'Verified' ? 'Evidence added' : trustBadge}
                        onChange={(e) => setTrustBadge(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-sand-300 rounded-lg bg-white font-semibold text-xs"
                      >
                        <option value="Self-declared">Self-declared (Standard artisan declaration)</option>
                        <option value="Evidence added">Evidence added (Certificates / trade license uploaded)</option>
                        <option value="Verified" disabled>
                          Verified (Admin Only — requires physical kitchen audit)
                        </option>
                      </select>
                      <p className="text-[10px] text-charcoal-500 mt-1">
                        * "Verified" status is reserved for ROOTIFY Admin after food inspection and document verification.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 font-bold text-charcoal-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 accent-brand-600"
                    />
                    <span>Available for Orders</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-charcoal-600 hover:bg-sand-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Product Story QR Modal */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        destinationUrl={qrModalData.destinationUrl}
        badgeLabel={qrModalData.badgeLabel}
      />

    </PortalLayout>
  );
};
