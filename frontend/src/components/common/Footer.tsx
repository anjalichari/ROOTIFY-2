import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, Store } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F2ECE1] text-charcoal-700 border-t border-sand-300 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-display font-black text-lg">
                R
              </div>
              <span className="font-display font-extrabold text-xl text-charcoal-900">ROOTIFY</span>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Connecting authentic Goan food producers, Mahila Mandals, and local SHGs directly with conscious food lovers.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>100% Verified Origin & Heritage Recipes</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-charcoal-900 mb-3 uppercase tracking-wider">
              Explore Goa
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-600">
              <li>
                <Link to="/explore?cat=sweets" className="hover:text-brand-600 transition">Goan Sweets & Bebinca</Link>
              </li>
              <li>
                <Link to="/explore?cat=traditional" className="hover:text-brand-600 transition">Traditional Goan Chorizo</Link>
              </li>
              <li>
                <Link to="/explore?cat=spices" className="hover:text-brand-600 transition">Stone-Ground Spices & Masalas</Link>
              </li>
              <li>
                <Link to="/explore?cat=beverages" className="hover:text-brand-600 transition">Canacona Forest Kokum</Link>
              </li>
              <li>
                <Link to="/explore?cat=bakery" className="hover:text-brand-600 transition">Artisanal Wood-Fired Bakery</Link>
              </li>
            </ul>
          </div>

          {/* Regional Hubs */}
          <div>
            <h4 className="font-display font-bold text-sm text-charcoal-900 mb-3 uppercase tracking-wider">
              Service Locations
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-600">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Panaji & Tiswadi
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Mapusa, Calangute & Bardez
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Margao & Salcete
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Ponda & Mormugao
              </li>
            </ul>
          </div>

          {/* Producer & SHG Portal */}
          <div>
            <h4 className="font-display font-bold text-sm text-charcoal-900 mb-3 uppercase tracking-wider">
              For Producers
            </h4>
            <p className="text-xs text-charcoal-600 mb-3">
              Are you a local Goan producer, home baker, or Mahila Mandal? Join Rootify to reach regional customers.
            </p>
            <Link
              to="/vendor/register"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-brand-300 text-brand-800 text-xs font-bold hover:bg-brand-50 transition shadow-2xs"
            >
              <Store className="w-4 h-4 text-brand-600" /> Register as a Vendor / SHG
            </Link>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mt-8 pt-6 border-t border-sand-300 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-2">
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
            <span>for Goan Culinary Heritage</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} ROOTIFY. Clean Modern Marketplace.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
