import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useLocation } from '../../context/LocationContext';
import { Address, PaymentMethod } from '../../types';
import { TALUKAS } from '../../data/locations';
import confetti from 'canvas-confetti';
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  Plus,
  Lock,
  Sparkles,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, login, register } = useAuth();
  const { items, vendorId, vendorName, subtotal, deliveryFee, platformFee, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();

  // Auth Modal/Tab state if guest
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('customer@demo.rootify');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected or New Address
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.defaultAddress?.id || 'default'
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newVillage, setNewVillage] = useState(currentLocation.name);
  const [newTaluka, setNewTaluka] = useState(currentLocation.taluka);
  const [newPincode, setNewPincode] = useState('403001');

  // Payment method & Customer note
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect to cart page
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Items to Checkout</h2>
        <p className="text-sm text-gray-500 mb-6">Your shopping cart is currently empty.</p>
        <Link
          to="/explore"
          className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm"
        >
          Explore Goan Foods
        </Link>
      </div>
    );
  }

  // Handle Guest Login in-place
  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await login(loginEmail);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  // Handle Guest Signup in-place
  const handleGuestSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!signupName || !signupEmail || !signupPhone) {
      setAuthError('Please fill in all required fields');
      return;
    }
    try {
      await register({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        address: {
          id: `addr-${Date.now()}`,
          name: 'Home',
          street: 'Goa Coastal Lane',
          villageOrTown: currentLocation.name,
          taluka: currentLocation.taluka,
          pincode: '403001',
          isDefault: true,
        },
      });
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed');
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!user) return;

    let deliveryAddress: Address;
    if (isAddingNewAddress || !user.defaultAddress) {
      deliveryAddress = {
        id: `addr-${Date.now()}`,
        name: 'Delivery Address',
        street: newStreet || 'Villa Road',
        landmark: newLandmark,
        villageOrTown: newVillage || currentLocation.name,
        taluka: newTaluka || currentLocation.taluka,
        pincode: newPincode || '403001',
      };
    } else {
      deliveryAddress =
        user.addresses?.find((a) => a.id === selectedAddressId) ||
        user.defaultAddress || {
          id: 'addr-default',
          name: 'Home',
          street: 'Panaji Promenade',
          villageOrTown: 'Panaji',
          taluka: 'Tiswadi',
          pincode: '403001',
        };
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: i.product.images[0],
        price: i.product.price,
        quantity: i.quantity,
        unit: i.product.unit,
        subtotal: i.product.price * i.quantity,
      }));

      const newOrder = await placeOrder({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        deliveryAddress,
        vendorId: vendorId || items[0].product.vendorId,
        vendorName: vendorName || items[0].product.vendorName,
        vendorLocation: items[0].product.vendorLocation,
        items: orderItems,
        subtotal,
        deliveryFee,
        platformFee,
        paymentMethod,
        customerNote: customerNote.trim() || undefined,
      });

      // Clear cart
      clearCart();

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#155E52', '#D95C3A', '#E8893A'],
        });
      } catch (e) {}

      // Navigate to order tracking page
      navigate(`/orders/${newOrder.id}`);
    } catch (e) {
      console.error('Error placing order:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      
      {/* Checkout Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-sand-300">
        <Link to="/cart" className="p-2 rounded-xl hover:bg-sand-200 text-charcoal-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Checkout & Order Confirmation
          </h1>
          <p className="text-xs text-charcoal-500">
            Complete your order from <strong className="text-charcoal-900">{vendorName}</strong>
          </p>
        </div>
      </div>

      {/* Guest Checkout Interception Block */}
      {!isAuthenticated ? (
        <div className="bg-white rounded-3xl border-2 border-brand-200 p-6 sm:p-10 shadow-lg max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 mx-auto border border-brand-100">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-charcoal-900">
              Sign In to Place Your Order
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
              You can browse and cart as a guest! To confirm delivery and receive real-time order tracking updates, please sign in or create an account.
            </p>

            {/* Tab switch */}
            <div className="flex rounded-xl bg-sand-100 p-1 max-w-xs mx-auto mt-4">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  authTab === 'login' ? 'bg-white text-brand-800 shadow-2xs' : 'text-charcoal-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  authTab === 'signup' ? 'bg-white text-brand-800 shadow-2xs' : 'text-charcoal-600'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
              {authError}
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleGuestLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 outline-none"
                  placeholder="customer@demo.rootify"
                />
              </div>

              <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs text-charcoal-600">
                <span className="font-semibold text-charcoal-800 block mb-1">Quick Demo Customer Account:</span>
                <p>Email: <code className="text-brand-800 font-bold">customer@demo.rootify</code> (Sumedh Dessai, Panaji)</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm rounded-xl shadow-md transition"
              >
                Continue as Sumedh Dessai (Demo Customer)
              </button>
            </form>
          ) : (
            <form onSubmit={handleGuestSignup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-sand-300 outline-none focus:ring-1 focus:ring-brand-600"
                  placeholder="e.g. Maria Fernandes"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-sand-300 outline-none focus:ring-1 focus:ring-brand-600"
                    placeholder="maria@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-sand-300 outline-none focus:ring-1 focus:ring-brand-600"
                    placeholder="+91 98221 00000"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm rounded-xl shadow-md transition"
              >
                Create Account & Proceed
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Authenticated Checkout Flow */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Address & Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address Section */}
            <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                <div className="flex items-center gap-2 font-display font-bold text-base text-charcoal-900">
                  <MapPin className="w-5 h-5 text-brand-700" />
                  <span>1. Delivery Address in Goa</span>
                </div>
                {user && user.addresses && user.addresses.length > 0 && (
                  <button
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {isAddingNewAddress ? 'Use Saved Address' : 'Add New Address'}
                  </button>
                )}
              </div>

              {!isAddingNewAddress && user && user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-brand-600 bg-brand-50/50 shadow-2xs'
                          : 'border-sand-300 hover:bg-sand-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-brand-700 focus:ring-brand-600 accent-brand-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-charcoal-900">{addr.name}</strong>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-sand-200 text-charcoal-700 px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{addr.street}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {addr.villageOrTown}, {addr.taluka} Taluka • PIN: {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                /* New Address Form */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-charcoal-700 block mb-1">House / Flat / Street Name</label>
                    <input
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="e.g. Villa 4, Palm Grove Lane, Near St. Anthony Chapel"
                      className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-charcoal-700 block mb-1">Village / Town</label>
                      <input
                        type="text"
                        value={newVillage}
                        onChange={(e) => setNewVillage(e.target.value)}
                        placeholder="e.g. Panaji / Guirim"
                        className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-charcoal-700 block mb-1">Taluka</label>
                      <select
                        value={newTaluka}
                        onChange={(e) => setNewTaluka(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                      >
                        {TALUKAS.map((t) => (
                          <option key={t} value={t}>{t} Taluka</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-charcoal-700 block mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={newLandmark}
                        onChange={(e) => setNewLandmark(e.target.value)}
                        placeholder="e.g. Opp. Panchayat Office"
                        className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-charcoal-700 block mb-1">Goa Pincode</label>
                      <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="403001"
                        className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-sand-200 font-display font-bold text-base text-charcoal-900">
                <CreditCard className="w-5 h-5 text-brand-700" />
                <span>2. Select Payment Method (Prototype Simulation)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UPI Option */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50/50 shadow-2xs'
                      : 'border-sand-300 hover:bg-sand-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 text-brand-700 focus:ring-brand-600 accent-brand-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs font-bold text-charcoal-900">UPI / QR Simulation</strong>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-brand-100 text-brand-800 font-bold">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Simulates instant digital payment from GPay/PhonePe/Paytm.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                    paymentMethod === 'COD'
                      ? 'border-brand-600 bg-brand-50/50 shadow-2xs'
                      : 'border-sand-300 hover:bg-sand-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-brand-700 focus:ring-brand-600 accent-brand-700"
                  />
                  <div>
                    <strong className="text-xs font-bold text-charcoal-900 block">
                      Cash on Delivery (COD)
                    </strong>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Pay cash or scan QR directly when the delivery partner arrives.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Note for Kitchen / Delivery Partner */}
            <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-charcoal-900 block">
                Special Instructions / Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Ring bell at gate, extra banana leaves packaging if available..."
                className="w-full px-3.5 py-2 text-xs border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="bg-white rounded-3xl p-6 border border-sand-300 shadow-2xs space-y-5 sticky top-24">
            <h2 className="font-display font-bold text-base text-charcoal-900 pb-3 border-b border-sand-200">
              Order Summary ({items.length} items)
            </h2>

            {/* Items snippet */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center py-1">
                  <div className="truncate max-w-[65%]">
                    <span className="font-semibold text-charcoal-900">{product.name}</span>
                    <span className="text-charcoal-500 block text-[10px]">Qty: {quantity} • {product.unit}</span>
                  </div>
                  <span className="font-bold text-charcoal-900 font-display">₹{product.price * quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs text-charcoal-600 pt-3 border-t border-sand-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Regional Delivery Partner Fee</span>
                <span className="font-semibold text-charcoal-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform & Packaging Fee</span>
                <span className="font-semibold text-charcoal-900">₹{platformFee}</span>
              </div>

              <div className="pt-3 border-t border-sand-200 flex justify-between text-sm font-bold text-charcoal-900">
                <span className="font-display text-base">Total Amount</span>
                <span className="font-display text-xl text-brand-800">₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-terracotta-300" />
                  <span>Place Order (₹{total})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-brand-800 font-semibold text-center">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>Verified Direct Producer Order</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
