import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Order, OrderStatus, UserRole } from '../types';
import { orderService, CreateOrderParams } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { useToast } from './ToastContext';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  refreshOrders: () => Promise<void>;
  placeOrder: (params: CreateOrderParams) => Promise<Order>;
  updateStatus: (
    orderId: string,
    newStatus: OrderStatus,
    role: UserRole,
    details?: { rejectionReason?: string; note?: string }
  ) => Promise<Order>;
  assignDelivery: (
    orderId: string,
    deliveryPartnerId: string,
    deliveryPartnerName: string,
    deliveryPartnerPhone: string
  ) => Promise<Order>;
  submitProductReview: (data: {
    orderId: string;
    productId: string;
    productName: string;
    vendorId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    title?: string;
  }) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshOrders = useCallback(async () => {
    try {
      const all = await orderService.getAllOrders();
      setOrders(all);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
    // Listen to storage events to sync across tabs/windows if applicable
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rootify_orders') {
        refreshOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshOrders]);

  const placeOrder = async (params: CreateOrderParams): Promise<Order> => {
    const newOrder = await orderService.createOrder(params);
    await refreshOrders();
    showToast(`Order ${newOrder.orderNumber} placed successfully!`, 'success');
    return newOrder;
  };

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    role: UserRole,
    details?: { rejectionReason?: string; note?: string }
  ): Promise<Order> => {
    const updated = await orderService.updateOrderStatus(orderId, newStatus, role, details);
    await refreshOrders();
    showToast(`Order #${updated.orderNumber} updated to ${newStatus.replace(/_/g, ' ')}`, 'info');
    return updated;
  };

  const assignDelivery = async (
    orderId: string,
    deliveryPartnerId: string,
    deliveryPartnerName: string,
    deliveryPartnerPhone: string
  ): Promise<Order> => {
    const updated = await orderService.assignDeliveryPartner(
      orderId,
      deliveryPartnerId,
      deliveryPartnerName,
      deliveryPartnerPhone
    );
    await refreshOrders();
    showToast(`Assigned ${deliveryPartnerName} to order #${updated.orderNumber}`, 'success');
    return updated;
  };

  const submitProductReview = async (data: {
    orderId: string;
    productId: string;
    productName: string;
    vendorId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    title?: string;
  }): Promise<void> => {
    await reviewService.addReview({
      ...data,
      verifiedPurchase: true,
    });
    await refreshOrders();
    showToast('Thank you! Your verified review has been published.', 'success');
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        refreshOrders,
        placeOrder,
        updateStatus,
        assignDelivery,
        submitProductReview,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
