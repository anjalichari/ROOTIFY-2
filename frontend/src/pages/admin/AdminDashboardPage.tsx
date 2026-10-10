import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useOrders } from '../../context/OrderContext';
import { vendorService } from '../../services/vendorService';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Vendor, Product, SupportIssue, SettlementRecord } from '../../types';
import {
  BarChart3,
  Users,
  Store,
  Package,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Bike,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<SupportIssue[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const v = await vendorService.getAllVendors();
      setVendors(v);
      const p = await productService.getAllProducts();
      setProducts(p);
      const iss = await adminService.getSupportIssues();
      setIssues(iss);
      const stl = await adminService.getSettlements();
      setSettlements(stl);
    };
    load();
  }, []);

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const openIssues = issues.filter((i) => i.status === 'OPEN');
  const eligibleSettlements = settlements.filter((s) => s.status === 'ELIGIBLE');

  return (
    <PortalLayout
      portalType="admin"
      title="Platform Operations Overview"
      subtitle="Goa Regional Marketplace Metrics & Health"
    >
      <div className="space-y-8">
        
        {/* Pending Action Alerts */}
        {(pendingVendors.length > 0 || openIssues.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingVendors.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="font-bold block text-sm">
                      {pendingVendors.length} Pending Vendor Applications
                    </strong>
                    <span>Mahila Mandals / Bakers awaiting document review</span>
                  </div>
                </div>
                <Link
                  to="/admin/vendors"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shrink-0 transition"
                >
                  Review
                </Link>
              </div>
            )}

            {openIssues.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3 text-xs text-rose-900">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <strong className="font-bold block text-sm">
                      {openIssues.length} Customer Support Dispute
                    </strong>
                    <span>Transit damage / refund claim reported</span>
                  </div>
                </div>
                <Link
                  to="/admin/issues"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shrink-0 transition"
                >
                  Resolve
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Active Orders Stream</span>
              <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-950">
              {activeOrders.length}
            </div>
            <Link to="/admin/orders" className="text-xs text-terracotta-600 font-bold hover:underline block">
              Dispatch Monitor →
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Verified Producers & SHGs</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-950">
              {vendors.filter((v) => v.status === 'approved').length}
            </div>
            <Link to="/admin/vendors" className="text-xs text-brand-700 font-bold hover:underline block">
              Manage Vendors →
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Active Dishes / Catalog</span>
              <div className="w-8 h-8 rounded-xl bg-sand-100 text-brand-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-950">
              {products.length}
            </div>
            <Link to="/admin/products" className="text-xs text-brand-700 font-bold hover:underline block">
              Catalog Moderation →
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-sand-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-charcoal-500 text-xs">
              <span>Platform GMV (Total Orders)</span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display font-extrabold text-2xl text-charcoal-950">
              ₹{totalRevenue}
            </div>
            <Link to="/admin/settlements" className="text-xs text-brand-800 font-bold hover:underline block">
              Settlements Ledger →
            </Link>
          </div>

        </div>

        {/* Live Orders Requiring Partner Dispatch */}
        <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h2 className="font-display font-bold text-base text-charcoal-950">
                Live Order Flow & Dispatch Monitor
              </h2>
              <p className="text-xs text-charcoal-500">Assign delivery partners & inspect active lifecycle stages</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Full Order Stream ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-sand-200">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-charcoal-900">{order.orderNumber}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sand-100 text-charcoal-800 uppercase">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-charcoal-900 font-display">₹{order.totalAmount}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Producer: <strong>{order.vendorName}</strong> → Customer: <strong>{order.customerName}</strong> ({order.deliveryAddress.villageOrTown})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {order.deliveryPartnerName ? (
                    <span className="text-xs text-brand-800 bg-brand-50 px-2.5 py-1 rounded-xl border border-brand-200 flex items-center gap-1 font-medium">
                      <Bike className="w-3.5 h-3.5 text-brand-600" /> {order.deliveryPartnerName}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-bold">
                      Awaiting Partner Assignment
                    </span>
                  )}
                  <Link
                    to="/admin/orders"
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
};
