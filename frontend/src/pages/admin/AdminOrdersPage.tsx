import React, { useState } from 'react';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { OrderTimeline } from '../../components/marketplace/OrderTimeline';
import {
  Package,
  Bike,
  User,
  Store,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { orders, assignDelivery } = useOrders();
  const [filter, setFilter] = useState<'all' | 'active' | 'unassigned' | 'completed'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Modal for assigning delivery partner
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedPartner, setSelectedPartner] = useState({
    id: 'user-delivery-rohan',
    name: 'Rohan Naik',
    phone: '+91 98765 43210',
  });

  const availablePartners = [
    { id: 'user-delivery-rohan', name: 'Rohan Naik (North Goa Hub)', phone: '+91 98765 43210' },
    { id: 'user-delivery-amit', name: 'Amit Sawant (South Goa Hub)', phone: '+91 98223 99887' },
    { id: 'user-delivery-preeti', name: 'Preeti Gaonkar (Central Hub)', phone: '+91 97654 11223' },
  ];

  const handleAssign = async () => {
    if (!assigningOrder) return;
    await assignDelivery(
      assigningOrder.id,
      selectedPartner.id,
      selectedPartner.name.split(' (')[0],
      selectedPartner.phone
    );
    setAssigningOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (filter === 'unassigned') return !o.deliveryPartnerId && o.status !== 'DELIVERED';
    if (filter === 'completed') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <PortalLayout
      portalType="admin"
      title="Platform Order Dispatch & Monitor"
      subtitle="Track all customer marketplace orders and assign regional delivery partners"
    >
      <div className="space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-sand-300 overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'active', label: 'Active Live Stream', count: orders.filter((o) => o.status !== 'DELIVERED').length },
            { id: 'unassigned', label: 'Needs Delivery Partner', count: orders.filter((o) => !o.deliveryPartnerId && o.status !== 'DELIVERED').length },
            { id: 'completed', label: 'Delivered', count: orders.filter((o) => o.status === 'DELIVERED').length },
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

        {/* Orders Table/List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-sand-300 overflow-hidden shadow-2xs transition-all"
              >
                <div className="p-5 sm:p-6 bg-sand-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-extrabold text-base text-charcoal-950">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-charcoal-900 font-display">
                        ₹{order.totalAmount} ({order.paymentMethod})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                      <div className="text-charcoal-600">
                        Producer: <strong className="text-charcoal-900">{order.vendorName}</strong> ({order.vendorLocation})
                      </div>
                      <div className="text-charcoal-600">
                        Customer: <strong className="text-charcoal-900">{order.customerName}</strong> ({order.deliveryAddress.villageOrTown}, {order.deliveryAddress.taluka})
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5">
                    {order.deliveryPartnerName ? (
                      <div className="flex items-center gap-1 text-xs text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 font-medium">
                        <Bike className="w-3.5 h-3.5 text-brand-600" />
                        <span>{order.deliveryPartnerName}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssigningOrder(order)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" /> Assign Partner
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 rounded-xl border border-sand-300 text-charcoal-600 hover:bg-sand-100 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-sand-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                        Order Items & Charges
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between p-2.5 bg-sand-50 rounded-xl text-xs">
                            <span className="font-medium text-charcoal-800">{it.productName} (x{it.quantity})</span>
                            <span className="font-bold text-charcoal-900">₹{it.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-sand-200 text-xs space-y-1 text-charcoal-600">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <strong>₹{order.subtotal}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Partner Fee:</span>
                          <strong>₹{order.deliveryFee}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Commission (5%):</span>
                          <strong>₹{Math.round(order.subtotal * 0.05)}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-500 mb-3">
                        Live Lifecycle Progression
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

      </div>

      {/* Assign Delivery Partner Modal */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-sand-300">
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              Assign Delivery Partner
            </h3>
            <p className="text-xs text-charcoal-500">
              Dispatch regional delivery partner for Order #{assigningOrder.orderNumber}
            </p>

            <div className="space-y-2">
              {availablePartners.map((partner) => (
                <label
                  key={partner.id}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    selectedPartner.id === partner.id
                      ? 'border-brand-500 bg-brand-50/60 font-bold'
                      : 'border-sand-300 hover:bg-sand-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Bike className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="block text-charcoal-900">{partner.name}</span>
                      <span className="text-[11px] text-charcoal-400">{partner.phone}</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="partner"
                    checked={selectedPartner.id === partner.id}
                    onChange={() => setSelectedPartner(partner)}
                    className="accent-brand-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 text-xs text-charcoal-600 hover:bg-sand-100 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};
