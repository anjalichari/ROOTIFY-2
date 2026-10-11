import React, { ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  Package,
  DollarSign,
  User as UserIcon,
  Bike,
  MessageSquare,
  Shield,
  Users,
  AlertOctagon,
  BarChart3,
  LogOut,
  ArrowLeft,
  ShoppingBag,
  QrCode,
} from 'lucide-react';

interface PortalLayoutProps {
  children: ReactNode;
  portalType: 'vendor' | 'delivery' | 'admin';
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  portalType,
  title,
  subtitle,
  actionButton,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const vendorNavItems = [
    { to: '/vendor/dashboard', label: 'Dashboard', icon: <Store className="w-4 h-4" /> },
    { to: '/vendor/products', label: 'My Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/vendor/passports', label: 'My Story & QR Passports', icon: <QrCode className="w-4 h-4" /> },
    { to: '/vendor/orders', label: 'Incoming Orders', icon: <Package className="w-4 h-4" /> },
    { to: '/vendor/earnings', label: 'Earnings & Settlements', icon: <DollarSign className="w-4 h-4" /> },
    { to: '/vendor/profile', label: 'Producer Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const deliveryNavItems = [
    { to: '/delivery/tasks', label: 'Delivery Tasks', icon: <Bike className="w-4 h-4" /> },
    { to: '/delivery/chats', label: 'Order Chats', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/delivery/profile', label: 'Partner Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/passports', label: 'Origin Passports & Audits', icon: <QrCode className="w-4 h-4" /> },
    { to: '/admin/vendors', label: 'Vendor Approvals', icon: <Store className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/products', label: 'Catalog Moderation', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/admin/orders', label: 'Order Monitor & Dispatch', icon: <Package className="w-4 h-4" /> },
    { to: '/admin/issues', label: 'Customer Disputes', icon: <AlertOctagon className="w-4 h-4" /> },
    { to: '/admin/settlements', label: 'Vendor Settlements', icon: <DollarSign className="w-4 h-4" /> },
    { to: '/admin/reports', label: 'Analytics Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const navItems =
    portalType === 'vendor'
      ? vendorNavItems
      : portalType === 'delivery'
      ? deliveryNavItems
      : adminNavItems;

  const getPortalBadge = () => {
    switch (portalType) {
      case 'vendor':
        return { label: 'Producer Portal', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'delivery':
        return { label: 'Delivery Partner Portal', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'admin':
        return { label: 'Platform Operations Admin', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
  };

  const badge = getPortalBadge();

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col md:flex-row text-charcoal-900">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-sand-300 shadow-xs shrink-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-sand-200">
          <Link to="/" className="flex items-center gap-2 group mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-display font-black text-lg group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-display font-extrabold text-lg text-charcoal-900">ROOTIFY</span>
          </Link>
          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* User Card in Sidebar */}
        {user && (
          <div className="px-5 py-3.5 bg-sand-50/70 border-b border-sand-200 flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-sand-300"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-charcoal-900 truncate">{user.name}</p>
              <p className="text-[10px] text-charcoal-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200 shadow-2xs'
                    : 'text-charcoal-600 hover:text-brand-900 hover:bg-sand-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sand-200 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-charcoal-600 hover:text-brand-700 hover:bg-brand-50/50 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation & Drawer Bar */}
      <div className="md:hidden bg-white border-b border-sand-300 p-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center text-white font-display font-black text-sm">
            R
          </Link>
          <div>
            <span className="font-display font-bold text-xs text-charcoal-900 block leading-tight">{title}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs text-charcoal-600 hover:text-charcoal-900 font-medium px-2 py-1 rounded bg-sand-100">
            Marketplace
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="md:hidden bg-white/95 border-b border-sand-200 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 sticky top-[53px] z-20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-brand-700 text-white shadow-2xs'
                  : 'bg-sand-100 text-charcoal-700 hover:bg-sand-200'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Page Top Header Bar */}
        <div className="bg-white border-b border-sand-200/80 px-4 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-gray-950">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {/* Page Body */}
        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
