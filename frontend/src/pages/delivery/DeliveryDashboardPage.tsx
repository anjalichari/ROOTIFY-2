import React, { useState } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { OrderTimeline } from '../../components/marketplace/OrderTimeline';
import {
  Bike,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  MessageSquare,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DeliveryDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateStatus } = useOrders();
  const [filterTab, setFilterTab] = useState<'all' | 'assigned' | 'in_transit' | 'completed'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // Orders assigned to this delivery partner or general delivery demo
  const deliveryOrders = orders.filter(
    (o) => o.deliveryPartnerId === user?.id || user?.email === 'delivery@demo.rootify' || o.deliveryPartnerId === 'user-delivery-rohan'
  );

  const filteredOrders = deliveryOrders.filter((o) => {
    if (filterTab === 'assigned') return o.status === 'READY_FOR_PICKUP' || o.status === 'ACCEPTED' || o.status === 'PREPARING';
    if (filterTab === 'in_transit') return o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY';
    if (filterTab === 'completed') return o.status === 'DELIVERED';
    return true;
  });

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setLoadingOrderId(orderId);
    try {
      await updateStatus(orderId, nextStatus, 'delivery');
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <PortalLayout
      portalType="delivery"
      title="Delivery Partner Tasks"
      subtitle="North & South Goa Regional Dispatch Queue"
    >
      <div className="space-y-6">
        
        {/* Partner Info Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-brand-200">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">{user?.name || 'Rohan Naik'}</h2>
              <p className="text-xs text-brand-200">
                Vehicle: <strong>{user?.vehicleType || 'Honda Activa 6G'}</strong> ({user?.vehicleNumber || 'GA 07 AA 4590'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-brand-500/20 text-brand-200 border border-brand-400/30 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
              On Duty (North Goa Hub)
            </span>
            <Link
              to="/delivery/chats"
              className="px-3.5 py-1.5 rounded-xl bg-white text-brand-950 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Order Chats
            </Link>
          </div>
        </div>

        {/* Task Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sand-300 overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: 'all', label: 'All Tasks', count: deliveryOrders.length },
            { id: 'assigned', label: 'Assigned / Ready for Pickup', count: deliveryOrders.filter((o) => o.status === 'READY_FOR_PICKUP' || o.status === 'PREPARING' || o.status === 'ACCEPTED').length },
            { id: 'in_transit', label: 'In Transit / Out for Delivery', count: deliveryOrders.filter((o) => o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY').length },
            { id: 'completed', label: 'Delivered', count: deliveryOrders.filter((o) => o.status === 'DELIVERED').length },
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

        {/* Tasks List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-sand-300 text-center text-xs text-charcoal-500">
            No delivery assignments currently in this category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isProcessing = loadingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs transition-all"
                >
                  <div className="p-5 sm:p-6 bg-sand-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-base text-charcoal-950">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-charcoal-700 font-display">
                          ₹{order.totalAmount} ({order.paymentMethod})
                        </span>
                      </div>

                      {/* Pickup & Delivery Points */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-2 text-charcoal-700">
                          <MapPin className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-charcoal-900 block">Pickup from Producer:</span>
                            <span>{order.vendorName} ({order.vendorLocation})</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-charcoal-700">
                          <Navigation className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-charcoal-900 block">Deliver to Customer:</span>
                            <span>{order.customerName} • {order.deliveryAddress.street}, {order.deliveryAddress.villageOrTown}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step Actions for Delivery Partner */}
                    <div className="flex items-center gap-2">
                      {order.status === 'READY_FOR_PICKUP' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, 'PICKED_UP')}
                          disabled={isProcessing}
                          className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Package className="w-4 h-4" /> Pick Up Order
                        </button>
                      )}

                      {order.status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={isProcessing}
                          className="px-4 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Bike className="w-4 h-4" /> Start Delivery
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, 'DELIVERED')}
                          disabled={isProcessing}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirm Delivered
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Delivered Successfully
                        </span>
                      )}

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 rounded-xl border border-sand-300 text-charcoal-600 hover:bg-sand-100 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Items & Timeline */}
                  {isExpanded && (
                    <div className="p-6 border-t border-sand-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                          Package Contents ({order.items.length} items)
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between p-2.5 bg-sand-50 rounded-xl text-xs text-charcoal-800">
                              <span>{it.productName} (x{it.quantity})</span>
                              <span className="font-bold text-charcoal-900">₹{it.subtotal}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Link
                            to={`/delivery/chats?orderId=${order.id}`}
                            className="px-3.5 py-1.5 bg-sand-100 hover:bg-sand-200 text-charcoal-800 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Open Chat with Kitchen / Customer
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                          Live Synchronized Timeline
                        </h4>
                        <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200">
                          <OrderTimeline timeline={order.timeline} />
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
