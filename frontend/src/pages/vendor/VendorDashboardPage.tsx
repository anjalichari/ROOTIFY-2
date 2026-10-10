import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { Vendor, Product, Order } from '../../types';
import {
  Store,
  Package,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  RotateCcw,
} from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Resubmit state for rejected vendors
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitDescription, setResubmitDescription] = useState('');
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    const loadVendorData = async () => {
      setLoading(true);
      try {
        const allVendors = await vendorService.getAllVendors();
        // Match user's vendor record, or default to Maria's Foods for demo
        const currentVendor =
          allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
          allVendors[0];

        setVendor(currentVendor);
        if (currentVendor) {
          const prods = await productService.getProductsByVendor(currentVendor.id);
          setProducts(prods);
        }
      } catch (e) {
        console.error('Error loading vendor data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, [user]);

  const vendorOrders = orders.filter(
    (o) => o.vendorId === vendor?.id || vendor?.id === 'v-maria-foods'
  );

  const pendingOrders = vendorOrders.filter(
    (o) => o.status === 'PLACED' || o.status === 'ACCEPTED' || o.status === 'PREPARING'
  );

  const readyOrders = vendorOrders.filter((o) => o.status === 'READY_FOR_PICKUP');
  const completedOrders = vendorOrders.filter((o) => o.status === 'DELIVERED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const handleResubmit = async () => {
    if (!vendor) return;
    setResubmitting(true);
    try {
      const updated = await vendorService.resubmitApplication(vendor.id, {
        description: resubmitDescription || vendor.description,
      });
      setVendor(updated);
      setShowResubmitModal(false);
    } catch (e) {
      console.error('Resubmit failed:', e);
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalType="vendor"
      title={vendor?.businessName || "Vendor Dashboard"}
      subtitle={`Artisanal kitchen in ${vendor?.village || 'Guirim'}, ${vendor?.taluka || 'Bardez'}`}
      actionButton={
        vendor?.status === 'approved' ? (
          <Link
            to="/vendor/products?action=new"
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Dish / Product
          </Link>
        ) : null
      }
    >
      <div className="space-y-8">
        
        {/* Verification Alert Banner */}
        {vendor?.status === 'pending' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold block text-sm">Application Under Admin Review</strong>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Your producer registration is currently being verified by the Rootify administration. Once approved, your products will go live on the public marketplace.
              </p>
              <p className="mt-1 text-[11px] font-semibold text-amber-900">
                Tip: You can switch to the Admin role using the Demo Switcher bar above to approve this application.
              </p>
            </div>
          </div>
        )}

        {vendor?.status === 'rejected' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-bold block text-sm">Application Requires Changes</strong>
                <p className="mt-0.5 text-rose-800">
                  Reason provided by Admin: <span className="font-semibold">{vendor.rejectionReason}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowResubmitModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Resubmit Details
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Pending Kitchen Orders</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-900">
              {pendingOrders.length}
            </div>
            <Link to="/vendor/orders" className="text-xs text-brand-700 font-bold hover:underline block">
              Manage Orders →
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Ready for Pickup</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-900">
              {readyOrders.length}
            </div>
            <span className="text-[11px] text-charcoal-400 block">Awaiting partner dispatch</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Active Catalog Dishes</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center font-bold border border-brand-100">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-900">
              {products.length}
            </div>
            <Link to="/vendor/products" className="text-xs text-brand-800 font-bold hover:underline block">
              View Catalog →
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Total Gross Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-900">
              ₹{totalRevenue}
            </div>
            <Link to="/vendor/earnings" className="text-xs text-amber-700 font-bold hover:underline block">
              Settlements →
            </Link>
          </div>

        </div>

        {/* Incoming Orders Preview */}
        <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h2 className="font-display font-bold text-base text-charcoal-900">
                Recent Orders Received
              </h2>
              <p className="text-xs text-charcoal-500">Live order queue for {vendor?.businessName}</p>
            </div>
            <Link
              to="/vendor/orders"
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              All Orders ({vendorOrders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {vendorOrders.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-6 text-center">No orders received yet.</p>
          ) : (
            <div className="divide-y divide-sand-200">
              {vendorOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-charcoal-900">{order.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sand-100 text-charcoal-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Customer: <strong>{order.customerName}</strong> ({order.deliveryAddress.villageOrTown}) • {order.items.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-display font-extrabold text-sm text-charcoal-900">₹{order.subtotal}</span>
                    <Link
                      to="/vendor/orders"
                      className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-brand-50 hover:text-brand-800 text-xs font-bold transition"
                    >
                      Process Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Resubmit Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h3 className="font-display font-bold text-lg text-charcoal-900">Resubmit Application</h3>
            <p className="text-xs text-charcoal-500">
              Update your kitchen details or upload new documents for admin review.
            </p>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Updated Notes / Details</label>
              <textarea
                rows={3}
                value={resubmitDescription}
                onChange={(e) => setResubmitDescription(e.target.value)}
                placeholder="Describe changes made..."
                className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResubmitModal(false)}
                className="px-4 py-2 text-xs text-charcoal-600 hover:bg-sand-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResubmit}
                disabled={resubmitting}
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {resubmitting ? 'Submitting...' : 'Resubmit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
