import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { vendorService } from '../../services/vendorService';
import { Vendor, Order, OrderStatus } from '../../types';
import { OrderTimeline } from '../../components/marketplace/OrderTimeline';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  CookingPot,
  Bike,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const VendorOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateStatus } = useOrders();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadVendor = async () => {
      const allVendors = await vendorService.getAllVendors();
      const currentVendor =
        allVendors.find((v) => v.userId === user?.id || v.id === user?.vendorId) ||
        allVendors[0];
      setVendor(currentVendor);
    };
    loadVendor();
  }, [user]);

  const vendorOrders = orders.filter(
    (o) => o.vendorId === vendor?.id || vendor?.id === 'v-maria-foods'
  );

  const filteredOrders = vendorOrders.filter((o) => {
    if (filterTab === 'pending') return o.status === 'PLACED';
    if (filterTab === 'preparing') return o.status === 'ACCEPTED' || o.status === 'PREPARING';
    if (filterTab === 'ready') return o.status === 'READY_FOR_PICKUP';
    if (filterTab === 'completed') return o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'DELIVERED';
    return true;
  });

  const handleStatusAdvance = async (orderId: string, nextStatus: OrderStatus) => {
    setActionLoadingId(orderId);
    try {
      await updateStatus(orderId, nextStatus, 'vendor');
    } catch (e) {
      console.error('Error updating order:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = window.prompt('Please provide a reason for rejecting this order (e.g. Out of stock ingredients):');
    if (!reason) return;

    setActionLoadingId(orderId);
    try {
      await updateStatus(orderId, 'REJECTED', 'vendor', { rejectionReason: reason });
    } catch (e) {
      console.error('Error rejecting order:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <PortalLayout
      portalType="vendor"
      title="Kitchen Order Management"
      subtitle={`Live order processing for ${vendor?.businessName || "Maria's Traditional Foods"}`}
    >
      <div className="space-y-6">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sand-300 overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: 'all', label: 'All Orders', count: vendorOrders.length },
            { id: 'pending', label: 'New Placed', count: vendorOrders.filter((o) => o.status === 'PLACED').length },
            { id: 'preparing', label: 'In Kitchen', count: vendorOrders.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING').length },
            { id: 'ready', label: 'Ready for Pickup', count: vendorOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length },
            { id: 'completed', label: 'Dispatched / Delivered', count: vendorOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'PICKED_UP').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filterTab === tab.id ? 'bg-brand-700 text-white' : 'bg-sand-200 text-charcoal-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-sand-300 text-center text-xs text-charcoal-500">
            No orders found matching this filter tab.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isProcessing = actionLoadingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs transition-all"
                >
                  {/* Order Card Summary Header */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sand-50/40">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-extrabold text-base text-charcoal-950">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-charcoal-500">
                          {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-600 mt-1">
                        Customer: <strong className="text-charcoal-900">{order.customerName}</strong> • Phone: {order.customerPhone}
                      </p>
                      <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                        {order.deliveryAddress.street}, {order.deliveryAddress.villageOrTown} ({order.deliveryAddress.taluka})
                      </p>
                    </div>

                    {/* Order Action Buttons for Vendor */}
                    <div className="flex items-center gap-2">
                      {order.status === 'PLACED' && (
                        <>
                          <button
                            onClick={() => handleReject(order.id)}
                            disabled={isProcessing}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 border border-rose-200 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button
                            onClick={() => handleStatusAdvance(order.id, 'ACCEPTED')}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept Order
                          </button>
                        </>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStatusAdvance(order.id, 'PREPARING')}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CookingPot className="w-4 h-4" /> Start Preparing
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleStatusAdvance(order.id, 'READY_FOR_PICKUP')}
                          disabled={isProcessing}
                          className="px-4 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Package className="w-4 h-4" /> Mark Ready for Pickup
                        </button>
                      )}

                      {order.status === 'READY_FOR_PICKUP' && (
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
                          Package ready for Partner Pickup
                        </span>
                      )}

                      {(order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY') && (
                        <span className="text-xs font-bold text-terracotta-800 bg-terracotta-50 px-3 py-1.5 rounded-xl border border-terracotta-200 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5" /> Out with Delivery Partner
                        </span>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed & Settled
                        </span>
                      )}

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 rounded-xl border border-sand-300 text-charcoal-600 hover:bg-sand-100 transition cursor-pointer"
                        title="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Items & Timeline Drawer */}
                  {isExpanded && (
                    <div className="p-6 border-t border-sand-200 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Items Checklist */}
                        <div>
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                            Items to Prepare
                          </h4>
                          <div className="space-y-2.5">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-2xl bg-sand-50 border border-sand-200 text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.productImage}
                                    alt=""
                                    className="w-10 h-10 rounded-xl object-cover border border-sand-200"
                                  />
                                  <div>
                                    <span className="font-bold text-charcoal-900 block">{item.productName}</span>
                                    <span className="text-charcoal-500">{item.unit}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-charcoal-900 block font-display">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-charcoal-500 text-[11px]">₹{item.subtotal}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {order.customerNote && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                              <strong>Customer Note:</strong> {order.customerNote}
                            </div>
                          )}
                        </div>

                        {/* Order Timeline */}
                        <div>
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                            Live Order Timeline
                          </h4>
                          <div className="bg-sand-50/50 p-4 rounded-2xl border border-sand-200">
                            <OrderTimeline timeline={order.timeline} />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </PortalLayout>
  );
};
