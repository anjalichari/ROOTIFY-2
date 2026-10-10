import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  MapPin,
  ShoppingBag,
  Bike,
  Sparkles,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Package className="w-10 h-10" />}
          title="Sign In to Track Your Orders"
          description="Sign in with your customer account to view your active and past Goan food orders."
          actionText="Sign In Now"
          actionHref="/login?returnUrl=/orders"
        />
      </div>
    );
  }

  // Filter orders for the current customer (or all orders for demo if customerId matches)
  const customerOrders = orders.filter(
    (o) => o.customerId === user?.id || user?.email === 'customer@demo.rootify'
  );

  const activeOrders = customerOrders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED'
  );

  const pastOrders = customerOrders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'REJECTED'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return { label: 'Order Placed', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ACCEPTED':
        return { label: 'Vendor Confirmed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PREPARING':
        return { label: 'Kitchen Preparing', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'READY_FOR_PICKUP':
        return { label: 'Ready for Pickup', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'DELIVERED':
        return { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-sand-300">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2.5">
          <Package className="w-7 h-7 text-brand-700" />
          My Orders & Live Tracking
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Track real-time progress from local producer kitchens to your doorstep
        </p>
      </div>

      {customerOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="No Orders Placed Yet"
          description="Explore authentic Goan recipes and place your first direct producer order."
          actionText="Browse Marketplace"
          actionHref="/explore"
        />
      ) : (
        <div className="space-y-8">
          
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse"></span>
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Active Orders ({activeOrders.length})
                </h2>
              </div>

              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="group bg-white rounded-3xl p-5 sm:p-6 border-2 border-brand-200 hover:border-brand-400 shadow-card hover:shadow-card-hover transition-all block"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-200">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-display font-extrabold text-base text-charcoal-900">
                              {order.orderNumber}
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            From: <strong className="text-charcoal-800">{order.vendorName}</strong> ({order.vendorLocation})
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="font-display font-extrabold text-lg text-charcoal-900 block">
                            ₹{order.totalAmount}
                          </span>
                          <span className="text-[11px] text-charcoal-400">
                            {new Date(order.placedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex -space-x-3 overflow-hidden shrink-0">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.productImage}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-charcoal-700 truncate font-medium">
                            {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-700 group-hover:translate-x-1 transition-transform">
                          <span>Live Track</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Delivery address snippet */}
                      <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-xs text-charcoal-500">
                        <span className="flex items-center gap-1 truncate max-w-[80%]">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          {order.deliveryAddress.villageOrTown}, {order.deliveryAddress.taluka}
                        </span>
                        <span className="font-semibold text-charcoal-700 uppercase text-[10px]">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-charcoal-900">
                Past Orders ({pastOrders.length})
              </h2>

              <div className="space-y-3">
                {pastOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="group bg-white rounded-2xl p-4 sm:p-5 border border-sand-300 hover:border-sand-400 hover:shadow-card transition block"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-charcoal-900">
                              {order.orderNumber}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                              {badge.label}
                            </span>
                            {order.isReviewed && (
                              <span className="text-[10px] bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full font-bold border border-brand-200">
                                ★ Reviewed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            {order.vendorName} • {order.items.length} items
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="font-display font-bold text-base text-charcoal-900">
                            ₹{order.totalAmount}
                          </span>
                          <span className="text-xs text-brand-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
