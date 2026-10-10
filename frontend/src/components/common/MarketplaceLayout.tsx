import React, { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { RoleSwitcherBar } from './RoleSwitcherBar';
import { LocationModal } from './LocationModal';

export const MarketplaceLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-gray-900">
      <RoleSwitcherBar />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <LocationModal />
    </div>
  );
};
