import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { OrderTimeline } from '../../components/marketplace/OrderTimeline';
import { ReviewModal } from '../../components/marketplace/ReviewModal';
import { OrderItem } from '../../types';
import {
  Package,
  MapPin,
  Clock,
  Phone,
  Store,
  Bike,
  ShieldCheck,
  Star,
  ArrowLeft,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, submitProductReview } = useOrders();
  const { user } = useAuth();

  const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItem | null>(null);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">We could not locate this order.</p>
        <Link to="/orders" className="text-sm font-bold text-orange-600 hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED';

  const handleReviewSubmit = async (data: any) => {
    await submitProductReview({
      ...data,
      userId: user?.id || 'user-customer-demo',
      userName: user?.name || 'Sumedh Dessai',
      userAvatar: user?.avatar,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-300">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="p-2 rounded-xl hover:bg-sand-200 text-charcoal-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-extrabold text-2xl text-charcoal-900">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isDelivered
                    ? 'bg-brand-50 text-brand-800 border-brand-200'
                    : 'bg-terracotta-50 text-terracotta-800 border-terracotta-200'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Placed on {new Date(order.placedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* Live status badge */}
        {!isDelivered && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-800 text-xs font-bold self-start sm:self-auto border border-brand-200">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
            <span>Live Sync Tracking</span>
          </div>
        )}
      </div>

      {/* 7-Stage Interactive Order Tracker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">
              Live Order Progression
            </h2>
            <p className="text-xs text-charcoal-500">
              Updated in real-time as the producer, admin dispatch, and delivery partner progress your order
            </p>
          </div>
        </div>

        <OrderTimeline timeline={order.timeline} />
      </div>

      {/* Items & Review Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-sand-200">
          <h2 className="font-display font-bold text-lg text-charcoal-900">
            Items in this Order ({order.items.length})
          </h2>
          <span className="text-xs text-charcoal-500">
            Producer: <strong>{order.vendorName}</strong>
          </span>
        </div>

        <div className="divide-y divide-sand-200">
          {order.items.map((item) => (
            <div key={item.productId} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 rounded-2xl object-cover border border-sand-300 shrink-0"
                />
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-900">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Quantity: <strong>{item.quantity}</strong> ({item.unit}) • ₹{item.price} each
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-display font-extrabold text-base text-charcoal-900">
                  ₹{item.subtotal}
                </span>

                {/* Rating button enabled only if delivered */}
                {isDelivered && (
                  <button
                    onClick={() => setSelectedReviewItem(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{order.isReviewed ? 'Update Review' : 'Rate & Review'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bill Breakdown */}
        <div className="pt-4 border-t border-sand-200 space-y-2 text-xs text-charcoal-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-charcoal-900">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Partner Fee</span>
            <span className="font-semibold text-charcoal-900">₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span className="font-semibold text-charcoal-900">₹{order.platformFee}</span>
          </div>
          <div className="pt-2 border-t border-sand-200 flex justify-between text-sm font-bold text-charcoal-900">
            <span className="font-display text-base">Total Paid / Payable</span>
            <span className="font-display text-lg text-brand-800">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Delivery & Partner Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Delivery Address */}
        <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-charcoal-900 mb-2">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span>Delivery Address</span>
          </div>
          <p className="text-xs font-bold text-charcoal-900">{order.customerName}</p>
          <p className="text-xs text-charcoal-600 leading-relaxed">{order.deliveryAddress.street}</p>
          <p className="text-xs text-charcoal-500">
            {order.deliveryAddress.villageOrTown}, {order.deliveryAddress.taluka} Taluka • PIN: {order.deliveryAddress.pincode}
          </p>
          <p className="text-xs text-charcoal-500 pt-1">Phone: {order.customerPhone}</p>
        </div>

        {/* Assigned Delivery Partner Details */}
        <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-charcoal-900 mb-2">
            <Bike className="w-4 h-4 text-blue-600" />
            <span>Delivery Partner</span>
          </div>
          {order.deliveryPartnerName ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-charcoal-900">{order.deliveryPartnerName}</p>
              <p className="text-xs text-charcoal-500">Contact: {order.deliveryPartnerPhone}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Goa Regional Partner
              </span>
            </div>
          ) : (
            <p className="text-xs text-charcoal-400 italic">
              Awaiting delivery partner assignment by platform admin.
            </p>
          )}

          <div className="pt-2 border-t border-sand-200 text-xs flex items-center justify-between text-charcoal-500">
            <span>Payment: <strong className="text-charcoal-800">{order.paymentMethod}</strong></span>
            <span className="font-bold text-brand-700">{order.paymentStatus}</span>
          </div>
        </div>

      </div>

      {/* Review Modal Trigger */}
      {selectedReviewItem && (
        <ReviewModal
          orderId={order.id}
          vendorId={order.vendorId}
          vendorName={order.vendorName}
          item={selectedReviewItem}
          isOpen={true}
          onClose={() => setSelectedReviewItem(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

    </div>
  );
};
