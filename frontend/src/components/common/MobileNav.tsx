import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  // If in portal view (Vendor, Delivery, Admin), let the portal handle specific mobile navigation
  if (role === 'vendor' || role === 'delivery' || role === 'admin') {
    return null;
  }

  const profilePath = isAuthenticated ? '/profile' : '/login';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sand-300/90 px-2 py-1 shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold transition ${
              isActive ? 'text-brand-700 font-bold' : 'text-charcoal-500 hover:text-charcoal-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>Home</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold transition ${
              isActive ? 'text-brand-700 font-bold' : 'text-charcoal-500 hover:text-charcoal-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Compass className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>Explore</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold transition ${
              isActive ? 'text-brand-700 font-bold' : 'text-charcoal-500 hover:text-charcoal-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Package className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>Orders</span>
            </>
          )}
        </NavLink>

        <NavLink
          to={profilePath}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold transition ${
              isActive ? 'text-brand-700 font-bold' : 'text-charcoal-500 hover:text-charcoal-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{isAuthenticated ? 'Profile' : 'Sign In'}</span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};
