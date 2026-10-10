import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import {
  ShoppingBag,
  MapPin,
  ChevronDown,
  Search,
  User as UserIcon,
  LogOut,
  Store,
  Bike,
  Shield,
  Compass,
  Package,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { itemCount } = useCart();
  const { currentLocation, setIsLocationSelectorOpen } = useLocation();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const isMarketplace = !routerLocation.pathname.startsWith('/admin') &&
                        !routerLocation.pathname.startsWith('/vendor') &&
                        !routerLocation.pathname.startsWith('/delivery');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand-200/90 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/10 group-hover:bg-brand-700 transition-colors">
                <span className="font-display font-black text-xl tracking-tighter">R</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-charcoal-900 flex items-center gap-1">
                  ROOTIFY
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 mb-2"></span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-brand-700 -mt-1">
                  Goa Food Marketplace
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            {isMarketplace && (
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-100/90 hover:bg-sand-200 text-charcoal-900 text-xs font-medium border border-sand-300/80 transition group cursor-pointer"
                title="Change delivery location in Goa"
              >
                <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                  <MapPin className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-charcoal-600 block leading-tight">Deliver to</span>
                  <span className="font-bold text-charcoal-900 flex items-center gap-1 leading-tight">
                    {currentLocation.name}, {currentLocation.taluka}
                    <ChevronDown className="w-3 h-3 text-charcoal-400 group-hover:text-charcoal-700 transition" />
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          {isMarketplace && (
            <div className="hidden lg:flex flex-1 max-w-md mx-2">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Search Bebinca, Chorizo, Spices, SHGs, Taluka..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-sand-50/90 border border-sand-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-charcoal-900 placeholder:text-charcoal-400 transition shadow-2xs"
                />
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-charcoal-700">
            <Link
              to="/"
              className={`hover:text-brand-600 transition ${
                routerLocation.pathname === '/' ? 'text-brand-600 font-bold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`flex items-center gap-1.5 hover:text-brand-600 transition ${
                routerLocation.pathname === '/explore' ? 'text-brand-600 font-bold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 hover:text-brand-600 transition ${
                routerLocation.pathname.startsWith('/orders') ? 'text-brand-600 font-bold' : ''
              }`}
            >
              <Package className="w-4 h-4" />
              Orders
            </Link>
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Mobile Location Badge button */}
            {isMarketplace && (
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-sand-100 text-charcoal-900 text-xs border border-sand-300"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-semibold truncate max-w-[80px]">{currentLocation.name}</span>
              </button>
            )}

            {/* Cart Button with Terracotta Counter */}
            {isMarketplace && (
              <Link
                to="/cart"
                className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-50 hover:bg-brand-100/90 text-brand-800 font-bold text-sm flex items-center gap-2 border border-brand-200/90 transition group shadow-2xs"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-brand-600 group-hover:scale-105 transition" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-terracotta-500 text-white text-xs flex items-center justify-center font-extrabold shadow-sm">
                    {itemCount}
                  </span>
                ) : (
                  <span className="hidden sm:inline text-xs text-brand-600/70 font-normal">0</span>
                )}
              </Link>
            )}

            {/* User / Portal Account Menu */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sand-100 transition border border-transparent hover:border-sand-200"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-charcoal-900 max-w-[100px] truncate text-left">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="text-xs font-semibold text-charcoal-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-charcoal-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 uppercase tracking-wider border border-brand-200">
                          {role}
                        </span>
                      </div>

                      <div className="py-1 text-xs">
                        {role === 'customer' && (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                              <UserIcon className="w-4 h-4 text-charcoal-400" /> My Profile
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                              <Package className="w-4 h-4 text-charcoal-400" /> My Orders & Tracking
                            </Link>
                            <Link
                              to="/vendor/register"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                              <Store className="w-4 h-4 text-brand-600" /> Become a Vendor / SHG
                            </Link>
                          </>
                        )}

                        {role === 'vendor' && (
                          <>
                            <Link
                              to="/vendor/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                              <Store className="w-4 h-4 text-brand-600" /> Vendor Dashboard
                            </Link>
                            <Link
                              to="/vendor/orders"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                              <Package className="w-4 h-4 text-brand-600" /> Manage Orders
                            </Link>
                          </>
                        )}

                        {role === 'delivery' && (
                          <Link
                            to="/delivery/tasks"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                          >
                            <Bike className="w-4 h-4 text-blue-600" /> Delivery Tasks
                          </Link>
                        )}

                        {role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-charcoal-700 hover:bg-brand-50 hover:text-brand-800"
                          >
                            <Shield className="w-4 h-4 text-purple-600" /> Admin Ops Portal
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-sand-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-bold text-charcoal-700 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:inline-block px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
