import { Order, OrderStatus, OrderItem, Address, PaymentMethod, OrderTimelineStep, UserRole, SettlementRecord } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_ORDERS } from '../data/orders';

export interface CreateOrderParams {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: Address;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  paymentMethod: PaymentMethod;
  customerNote?: string;
}

export interface IOrderService {
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: string): Promise<Order[]>;
  getOrdersByDeliveryPartner(deliveryPartnerId: string): Promise<Order[]>;
  createOrder(params: CreateOrderParams): Promise<Order>;
  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    role: UserRole,
    details?: { rejectionReason?: string; note?: string }
  ): Promise<Order>;
  assignDeliveryPartner(orderId: string, deliveryPartnerId: string, deliveryPartnerName: string, deliveryPartnerPhone: string): Promise<Order>;
  markOrderReviewed(orderId: string): Promise<Order>;
}

class MockOrderService implements IOrderService {
  async getAllOrders(): Promise<Order[]> {
    return getStoredItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.id === id) || null;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter((o) => o.customerId === customerId);
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter((o) => o.vendorId === vendorId);
  }

  async getOrdersByDeliveryPartner(deliveryPartnerId: string): Promise<Order[]> {
    const orders = await this.getAllOrders();
    return orders.filter((o) => o.deliveryPartnerId === deliveryPartnerId);
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    const orders = await this.getAllOrders();
    const timestamp = new Date().toISOString();
    const orderNumber = `RTF-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `ord-${Date.now()}`;

    const initialTimeline: OrderTimelineStep[] = [
      {
        status: 'PLACED',
        title: 'Order Placed',
        description: `Order received with ${params.paymentMethod === 'UPI' ? 'UPI simulation' : 'Cash on Delivery'}.`,
        timestamp,
        completed: true,
        current: true,
        updatedByRole: 'customer',
      },
      {
        status: 'ACCEPTED',
        title: 'Vendor Confirmation',
        description: `Awaiting acceptance by ${params.vendorName}.`,
        completed: false,
        current: false,
      },
      {
        status: 'PREPARING',
        title: 'Preparing Order',
        description: 'Artisanal kitchen packing and preparation.',
        completed: false,
        current: false,
      },
      {
        status: 'READY_FOR_PICKUP',
        title: 'Ready for Pickup',
        description: 'Sealed package ready for pickup.',
        completed: false,
        current: false,
      },
      {
        status: 'PICKED_UP',
        title: 'Picked Up',
        description: 'Delivery partner picked up package.',
        completed: false,
        current: false,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Delivery partner heading to your address.',
        completed: false,
        current: false,
      },
      {
        status: 'DELIVERED',
        title: 'Delivered',
        description: 'Order delivered safely to customer.',
        completed: false,
        current: false,
      },
    ];

    const totalAmount = params.subtotal + params.deliveryFee + params.platformFee;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      deliveryAddress: params.deliveryAddress,
      vendorId: params.vendorId,
      vendorName: params.vendorName,
      vendorLocation: params.vendorLocation,
      items: params.items,
      itemCount: params.items.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      platformFee: params.platformFee,
      totalAmount,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
      status: 'PLACED',
      placedAt: timestamp,
      updatedAt: timestamp,
      customerNote: params.customerNote,
      timeline: initialTimeline,
      isReviewed: false,
    };

    const updated = [newOrder, ...orders];
    setStoredItem(STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    role: UserRole,
    details?: { rejectionReason?: string; note?: string }
  ): Promise<Order> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error(`Order ${orderId} not found`);

    const order = orders[index];
    const timestamp = new Date().toISOString();

    // Enforce Role Boundaries strictly:
    if (newStatus === 'DELIVERED' && role !== 'delivery') {
      throw new Error('Only the assigned Delivery Partner can mark an order as Delivered.');
    }
    if ((newStatus === 'ACCEPTED' || newStatus === 'PREPARING' || newStatus === 'READY_FOR_PICKUP' || newStatus === 'REJECTED') && (role !== 'vendor' && role !== 'admin')) {
      throw new Error('Only the Vendor or Admin can update kitchen preparation statuses.');
    }
    if ((newStatus === 'PICKED_UP' || newStatus === 'OUT_FOR_DELIVERY') && role !== 'delivery') {
      throw new Error('Only the Delivery Partner can update transit status.');
    }

    // Update timeline steps
    const statusSequence: OrderStatus[] = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    const targetIndex = statusSequence.indexOf(newStatus);

    const updatedTimeline = order.timeline.map((step) => {
      const stepIndex = statusSequence.indexOf(step.status);
      if (stepIndex !== -1 && targetIndex !== -1) {
        if (stepIndex < targetIndex) {
          return { ...step, completed: true, current: false };
        } else if (stepIndex === targetIndex) {
          return {
            ...step,
            completed: true,
            current: true,
            timestamp,
            updatedByRole: role,
            description: details?.note || step.description,
          };
        } else {
          return { ...step, completed: false, current: false };
        }
      }
      return step;
    });

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: timestamp,
      deliveredAt: newStatus === 'DELIVERED' ? timestamp : order.deliveredAt,
      paymentStatus: (newStatus === 'DELIVERED' && order.paymentMethod === 'COD') ? 'PAID' : order.paymentStatus,
      rejectionReason: details?.rejectionReason || order.rejectionReason,
      timeline: updatedTimeline,
    };

    orders[index] = updatedOrder;
    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // If delivered, create / update settlement record
    if (newStatus === 'DELIVERED') {
      const settlements = getStoredItem<SettlementRecord[]>(STORAGE_KEYS.SETTLEMENTS, []);
      const existingSettlement = settlements.find((s) => s.orderId === order.id);
      if (!existingSettlement) {
        const platformComm = Math.round(order.subtotal * 0.05);
        const newSettlement: SettlementRecord = {
          id: `stl-${Date.now()}`,
          vendorId: order.vendorId,
          vendorName: order.vendorName,
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderAmount: order.subtotal,
          platformCommission: platformComm,
          vendorPayable: order.subtotal - platformComm,
          status: 'ELIGIBLE',
          deliveredAt: timestamp,
        };
        setStoredItem(STORAGE_KEYS.SETTLEMENTS, [newSettlement, ...settlements]);
      }
    }

    return updatedOrder;
  }

  async assignDeliveryPartner(
    orderId: string,
    deliveryPartnerId: string,
    deliveryPartnerName: string,
    deliveryPartnerPhone: string
  ): Promise<Order> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const updatedOrder: Order = {
      ...orders[index],
      deliveryPartnerId,
      deliveryPartnerName,
      deliveryPartnerPhone,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    setStoredItem(STORAGE_KEYS.ORDERS, orders);
    return updatedOrder;
  }

  async markOrderReviewed(orderId: string): Promise<Order> {
    const orders = await this.getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const updated = { ...orders[index], isReviewed: true, updatedAt: new Date().toISOString() };
    orders[index] = updated;
    setStoredItem(STORAGE_KEYS.ORDERS, orders);
    return updated;
  }
}

export const orderService = new MockOrderService();
