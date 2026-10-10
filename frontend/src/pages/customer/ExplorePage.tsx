import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';
import { TALUKAS } from '../../data/locations';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  RotateCcw,
  Compass,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('cat');
    if (q !== null) setSearchQuery(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Execute search and filters
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const results = await productService.searchAndFilter({
          searchQuery,
          categoryId: selectedCategory,
          taluka: selectedTaluka,
          minRating: selectedRating,
          onlyVerifiedOrigin: onlyVerified,
          inStockOnly,
          maxPrice,
        });
        setProducts(results);
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [searchQuery, selectedCategory, selectedTaluka, selectedRating, onlyVerified, inStockOnly, maxPrice]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId !== 'all') {
      searchParams.set('cat', catId);
    } else {
      searchParams.delete('cat');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTaluka('all');
    setSelectedRating(0);
    setOnlyVerified(false);
    setInStockOnly(false);
    setMaxPrice(1000);
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedTaluka !== 'all' ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) +
    (onlyVerified ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 1000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      
      {/* Header & Search Bar */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-700" />
            Explore Authentic Goan Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Search across local dishes, spices, ingredients, talukas, and producer stories
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by product (e.g. 'Bebinca'), village ('Divar'), ingredients ('Coconut', 'Vinegar')..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-sand-300 rounded-2xl text-sm font-medium shadow-2xs focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 outline-none transition"
          />
          <Search className="w-5 h-5 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-sand-100 text-charcoal-400 hover:text-charcoal-600 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-sand-300 text-xs font-bold text-charcoal-800 flex items-center justify-center gap-2 shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-700" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="py-2.5 px-3 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-semibold text-charcoal-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar / Mobile Expandable Drawer */}
        <aside
          className={`${
            showMobileFilters ? 'block' : 'hidden'
          } md:block md:col-span-1 bg-white p-5 rounded-2xl border border-sand-300 shadow-2xs space-y-6 sticky top-24`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <span className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-700" /> Filter Marketplace
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-2">
              Category
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                    : 'text-charcoal-600 hover:bg-sand-50'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySelect(c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    selectedCategory === 'c.id' || selectedCategory === c.id
                      ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                      : 'text-charcoal-600 hover:bg-sand-50'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-charcoal-400">{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Taluka / Region */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-2">
              Producer Taluka
            </label>
            <select
              value={selectedTaluka}
              onChange={(e) => setSelectedTaluka(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-600 font-medium text-charcoal-900"
            >
              <option value="all">All Talukas (North & South Goa)</option>
              {TALUKAS.map((t) => (
                <option key={t} value={t}>
                  {t} Taluka
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-700 mb-1">
              <span>Max Price</span>
              <span className="text-brand-800 font-display">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="90"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
              <span>₹90</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((rt) => (
                <button
                  key={rt}
                  onClick={() => setSelectedRating(rt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-0.5 border transition ${
                    selectedRating === rt
                      ? 'bg-brand-700 text-white border-brand-700 shadow-2xs'
                      : 'bg-sand-50 text-charcoal-700 border-sand-300 hover:bg-sand-100'
                  }`}
                >
                  {rt === 0 ? 'All' : `${rt}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes: Verified Origin & In-Stock */}
          <div className="space-y-2.5 pt-2 border-t border-sand-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded text-brand-700 focus:ring-brand-600 accent-brand-700"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
                Verified Origin Only
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-700 focus:ring-brand-600 accent-brand-700"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Apply button on mobile */}
          {showMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(false)}
              className="md:hidden w-full py-2 bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Apply Filters ({products.length} Results)
            </button>
          )}
        </aside>

        {/* Product Results Grid */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500">
              Showing <strong className="text-gray-900">{products.length}</strong> items
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-sand-200"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No Goan Products Found"
              description="We couldn't find any products matching your active search or filters. Try adjusting your query or resetting filters."
              actionText="Reset All Filters"
              onActionClick={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
