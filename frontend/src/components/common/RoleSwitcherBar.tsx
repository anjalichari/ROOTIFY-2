import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, ShoppingBag, Store, Bike, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcherBar: React.FC = () => {
  const { role, user, switchRole } = useAuth();
  const navigate = useNavigate();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; path: string; desc: string }[] = [
    {
      id: 'guest',
      label: 'Guest Visitor',
      icon: <User className="w-3.5 h-3.5" />,
      path: '/',
      desc: 'Browse & Cart without login',
    },
    {
      id: 'customer',
      label: 'Customer',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      path: '/orders',
      desc: 'Sumedh Dessai (Panaji)',
    },
    {
      id: 'vendor',
      label: 'Vendor',
      icon: <Store className="w-3.5 h-3.5" />,
      path: '/vendor/orders',
      desc: "Maria Fernandes (Guirim)",
    },
    {
      id: 'delivery',
      label: 'Delivery Partner',
      icon: <Bike className="w-3.5 h-3.5" />,
      path: '/delivery/tasks',
      desc: 'Rohan Naik (North Goa Hub)',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      path: '/admin/orders',
      desc: 'Rootify Platform Ops',
    },
  ];

  const handleSwitch = async (targetRole: UserRole, targetPath: string) => {
    await switchRole(targetRole);
    if (targetRole === 'guest') {
      navigate('/');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className="bg-[#0E2A25] text-white text-xs border-b border-[#1A3D36] py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-400/30">
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            Demo Role Switcher
          </span>
          <span className="hidden sm:inline text-sand-300">
            Active: <strong className="text-white capitalize">{role}</strong>
            {user ? ` (${user.name})` : ' (Unauthenticated Visitor)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {roles.map((r) => {
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSwitch(r.id, r.path)}
                title={r.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs ring-1 ring-brand-400'
                    : 'bg-[#153B34] text-sand-200 hover:bg-[#1C4840] hover:text-white border border-[#235048]'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
