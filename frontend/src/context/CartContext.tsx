import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../services/storage';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = getStoredItem<CartItem[]>(STORAGE_KEYS.CART, []);
    setItems(saved);
  }, []);

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    setStoredItem(STORAGE_KEYS.CART, newItems);
  };

  const currentVendorId = items.length > 0 ? items[0].product.vendorId : null;
  const currentVendorName = items.length > 0 ? items[0].product.vendorName : null;

  const addToCart = (product: Product, quantity = 1): boolean => {
    // Check if adding from a different vendor
    if (items.length > 0 && items[0].product.vendorId !== product.vendorId) {
      const confirmReset = window.confirm(
        `Your cart already contains items from "${items[0].product.vendorName}".\n\nEach order is prepared fresh by one artisanal producer. Would you like to replace your cart with items from "${product.vendorName}"?`
      );
      if (!confirmReset) {
        return false;
      }
      const newItems = [{ product, quantity }];
      saveItems(newItems);
      showToast(`Cart updated with ${product.name}`, 'success');
      return true;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let newItems: CartItem[];

    if (existingIndex > -1) {
      newItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      showToast(`Updated quantity for ${product.name}`, 'success');
    } else {
      newItems = [...items, { product, quantity }];
      showToast(`Added ${product.name} to cart`, 'success');
    }

    saveItems(newItems);
    return true;
  };

  const removeFromCart = (productId: string) => {
    const newItems = items.filter((i) => i.product.id !== productId);
    saveItems(newItems);
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newItems = items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveItems(newItems);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const deliveryFee = items.length > 0 ? 40 : 0;
  const platformFee = items.length > 0 ? 15 : 0;
  const total = subtotal + deliveryFee + platformFee;

  return (
    <CartContext.Provider
      value={{
        items,
        vendorId: currentVendorId,
        vendorName: currentVendorName,
        itemCount,
        subtotal,
        deliveryFee,
        platformFee,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
