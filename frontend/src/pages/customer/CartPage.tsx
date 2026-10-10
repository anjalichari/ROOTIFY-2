import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Store,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, vendorName, subtotal, deliveryFee, platformFee, total, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="Your Cart is Empty"
          description="Looks like you haven't added any authentic Goan sweets, spices, or traditional treats yet."
          actionText="Explore Goan Foods"
          actionHref="/explore"
        />
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sand-300">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-brand-700" />
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Fresh artisanal order prepared by <strong className="text-charcoal-900">{vendorName}</strong>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-sand-300 shadow-2xs overflow-hidden divide-y divide-sand-200">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="p-4 sm:p-5 flex items-center gap-4">
                {/* Image */}
                <Link to={`/product/${product.id}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-sand-100 border border-sand-200">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.id}`}
                    className="font-display font-bold text-sm sm:text-base text-charcoal-900 hover:text-brand-700 transition truncate block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Unit: <span className="font-semibold text-charcoal-700">{product.unit}</span>
                  </p>
                  <p className="text-xs font-extrabold text-charcoal-900 font-display mt-1">
                    ₹{product.price}
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center border border-sand-300 rounded-xl bg-sand-50/80 p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-charcoal-700 transition"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs px-2.5 min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-charcoal-700 transition"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900 font-display">
                      ₹{product.price * quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-charcoal-400 hover:text-rose-600 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Producer Promise */}
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Goan Artisanal Guarantee:</strong>
              <p>
                Items in your cart are prepared fresh by <strong>{vendorName}</strong>. Authentic traditional recipe, verified hygiene and regional ingredients.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Bill Details & Checkout */}
        <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-5 sticky top-24">
          <h2 className="font-display font-bold text-base text-charcoal-900 pb-3 border-b border-sand-200">
            Bill Summary
          </h2>

          <div className="space-y-3 text-xs text-charcoal-600">
            <div className="flex justify-between">
              <span>Item Total ({items.reduce((acc, it) => acc + it.quantity, 0)} items)</span>
              <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Goa Regional Delivery Partner Fee</span>
              <span className="font-semibold text-charcoal-900">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform & Packaging Fee</span>
              <span className="font-semibold text-charcoal-900">₹{platformFee}</span>
            </div>

            <div className="pt-3 border-t border-sand-200 flex justify-between text-sm font-bold text-charcoal-900">
              <span className="font-display text-base">To Pay</span>
              <span className="font-display text-xl text-brand-800">₹{total}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isAuthenticated && (
            <p className="text-[11px] text-charcoal-400 text-center">
              You will be prompted to sign in or create an account at checkout.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
