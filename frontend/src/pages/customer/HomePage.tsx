import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Vendor, Category } from '../../types';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import { CATEGORIES } from '../../data/categories';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { VendorCard } from '../../components/marketplace/VendorCard';
import { CategoryCard } from '../../components/marketplace/CategoryCard';
import { useLocation } from '../../context/LocationContext';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Search,
  Users,
  Award,
  Clock,
  HeartHandshake,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentLocation, setIsLocationSelectorOpen } = useLocation();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        const allVendors = await vendorService.getAllVendors();

        setPopularProducts(allProducts.filter((p) => p.isPopular).slice(0, 4));
        setRecommendedProducts(allProducts.filter((p) => p.isRecommended || !p.isPopular).slice(0, 4));
        setVendors(allVendors.filter((v) => v.status === 'approved').slice(0, 3));
      } catch (e) {
        console.error('Error loading homepage data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Marketplace Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-black/20 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sand-100 text-xs font-bold border border-white/25">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-300" />
              <span>Authentic Goan Food Marketplace</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-white">
              Direct from Local Goan Kitchens, Bakers & Mahila Mandals
            </h1>

            <p className="text-sm sm:text-base text-sand-100/90 leading-relaxed max-w-xl">
              Discover traditional Bebinca, wood-smoked Chorizo, stone-ground Recheado masalas, and Canacona forest kokum. Verified recipes, heirloom quality.
            </p>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/explore"
                className="px-6 py-3 rounded-2xl bg-white hover:bg-sand-50 text-brand-900 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-700" />
              </Link>
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="px-5 py-3 rounded-2xl bg-brand-950/40 hover:bg-brand-950/60 backdrop-blur-md text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-terracotta-300" />
                <span>Deliver to: {currentLocation.name}</span>
              </button>
            </div>
          </div>

          {/* Quick stats floating cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <ShieldCheck className="w-6 h-6 mx-auto mb-1 text-brand-200" />
              <div className="font-display font-extrabold text-xl text-white">100%</div>
              <div className="text-[10px] text-sand-200 font-medium">Verified Origin</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-terracotta-200" />
              <div className="font-display font-extrabold text-xl text-white">SHG & Mandals</div>
              <div className="text-[10px] text-sand-200 font-medium">Women Cooperatives</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Award className="w-6 h-6 mx-auto mb-1 text-terracotta-200" />
              <div className="font-display font-extrabold text-xl text-white">Heirloom</div>
              <div className="text-[10px] text-sand-200 font-medium">Traditional Methods</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 text-brand-200" />
              <div className="font-display font-extrabold text-xl text-white">30-45m</div>
              <div className="text-[10px] text-sand-200 font-medium">Fresh Dispatch</div>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Horizontal Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
              Browse Categories
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Explore authentic regional varieties from across Goa
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Popular Near You Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
                Popular in {currentLocation.taluka} & Nearby
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Top rated traditional recipes loved by local customers
              </p>
            </div>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            View More <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-sand-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Authentic Goan Producers & SHGs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
                Verified Local Producers & SHGs
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Meet the artisanal bakers, spice mills, and self-help groups behind the food
              </p>
            </div>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            All Producers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* Recommended & Heritage Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
              Heritage Goan Specialties
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Hand-crafted pickles, forest kokum, and freshly cured condiments
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Regional Trust / Why Rootify Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-sand-100/90 border border-sand-300 grid grid-cols-1 md:grid-cols-3 gap-6 text-charcoal-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-700 shrink-0 shadow-2xs border border-sand-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
                Verified Origin Traceability
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Every product lists its specific Goan village, traditional preparation method, and certifications.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-700 shrink-0 shadow-2xs border border-sand-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
                Direct Producer Support
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                95% of item value flows directly to village producers, home kitchens, and women-led SHG cooperatives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-terracotta-600 shrink-0 shadow-2xs border border-sand-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal-900 mb-1">
                Fresh & Fast Dispatch
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Breads and confections are dispatched fresh on the same day straight from traditional wood ovens.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
