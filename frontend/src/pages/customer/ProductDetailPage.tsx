import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Review, Vendor } from '../../types';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import { reviewService } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import {
  Star,
  ShieldCheck,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Award,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity } = useCart();
  const { currentLocation, isTalukaServiceable, setIsLocationSelectorOpen } = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.images[0]);
          const vend = await vendorService.getVendorById(prod.vendorId);
          setVendor(vend);
          const revs = await reviewService.getReviewsByProduct(prod.id);
          setReviews(revs);
        }
      } catch (e) {
        console.error('Error loading product details:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-sand-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-sand-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-sand-200 rounded w-3/4"></div>
            <div className="h-6 bg-sand-200 rounded w-1/3"></div>
            <div className="h-32 bg-sand-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The product you are looking for does not exist.</p>
        <Link to="/explore" className="text-sm font-bold text-orange-600 hover:underline">
          Return to Explore
        </Link>
      </div>
    );
  }

  const isServiceable = isTalukaServiceable(
    product.vendorTaluka,
    vendor?.serviceableTalukas
  );

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCartQty = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to={`/explore?cat=${product.categoryId}`} className="hover:text-gray-900">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden bg-sand-100 border border-sand-300 shadow-md">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isVerifiedOrigin && (
              <div className="absolute top-4 left-4 bg-brand-900/90 backdrop-blur-md text-brand-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-brand-500/30">
                <ShieldCheck className="w-4 h-4 text-brand-300" />
                <span>Verified Goan Origin</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img ? 'border-brand-700 scale-105' : 'border-sand-300 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase Card */}
        <div className="space-y-6">
          
          {/* Title & Producer Header */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                to={`/vendor/${product.vendorId}`}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 uppercase tracking-wider flex items-center gap-1"
              >
                {product.vendorName}
              </Link>
              <span className="text-sand-300">•</span>
              <span className="text-xs text-charcoal-500 flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {product.originDetails.village}, {product.originDetails.taluka} Taluka
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating pill */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-charcoal-400 font-normal">({reviews.length} reviews)</span>
              </div>

              <span className="text-xs text-charcoal-500">
                Shelf life: <strong>{product.originDetails.shelfLife}</strong>
              </span>
            </div>
          </div>

          {/* Pricing & Unit */}
          <div className="p-4 rounded-2xl bg-sand-100/70 border border-sand-300 flex items-center justify-between">
            <div>
              <span className="text-xs text-charcoal-500 block">Artisanal Price</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-3xl text-charcoal-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-charcoal-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-xs text-charcoal-600 font-semibold ml-1">
                  / {product.unit}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 block">
                Fresh Batch in Stock
              </span>
            </div>
          </div>

          {/* Serviceability Warning if applicable */}
          {!isServiceable && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Not deliverable to {currentLocation.name} ({currentLocation.taluka})</p>
                <p className="mt-0.5 text-amber-800">
                  This producer currently delivers to {vendor?.serviceableTalukas.join(', ')} Talukas.
                </p>
                <button
                  onClick={() => setIsLocationSelectorOpen(true)}
                  className="mt-1.5 font-bold underline text-amber-900 hover:text-amber-950 block"
                >
                  Change delivery location
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-charcoal-900 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Add to Cart & Buy Now Area */}
          <div className="pt-2 space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-charcoal-700">Quantity:</span>
              <div className="flex items-center border border-sand-300 rounded-xl bg-white p-1 shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sand-100 text-charcoal-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm px-3 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sand-100 text-charcoal-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-charcoal-400">
                Subtotal: ₹{product.price * quantity}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-800 font-extrabold text-sm border-2 border-brand-200 hover:border-brand-300 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{inCartQty > 0 ? `Add More (${inCartQty} in cart)` : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Rootify Authenticity & Traceability Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-sand-200">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-800 border border-brand-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-charcoal-900">
              ROOTIFY Origin & Authenticity Details
            </h2>
            <p className="text-xs text-charcoal-500">
              Verified regional heritage, ingredients, and traditional preparation method
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Producer & Location
            </span>
            <Link
              to={`/vendor/${product.vendorId}`}
              className="font-display font-bold text-charcoal-900 text-sm hover:text-brand-700 block"
            >
              {product.vendorName}
            </Link>
            <p className="text-charcoal-600">
              Village: <strong>{product.originDetails.village}</strong>
            </p>
            <p className="text-charcoal-600">
              Taluka: <strong>{product.originDetails.taluka} (Goa)</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Traditional Method
            </span>
            <p className="text-charcoal-700 leading-relaxed">
              {product.originDetails.traditionalMethod}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Key Ingredients
            </span>
            <div className="flex flex-wrap gap-1">
              {product.originDetails.ingredients.map((ing, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-sand-300 text-charcoal-700 text-[11px]">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
            <span className="font-bold text-charcoal-400 uppercase tracking-wider text-[10px] block">
              Certifications & Badges
            </span>
            <div className="space-y-1">
              {product.originDetails.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-1.5 text-brand-800 font-semibold text-[11px]">
                  <Award className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {product.originDetails.storySnippet && (
          <div className="p-4 rounded-2xl bg-sand-100/90 border border-sand-300 text-xs text-charcoal-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5 text-brand-900">Heritage Story:</strong>
              <p className="leading-relaxed text-charcoal-700">{product.originDetails.storySnippet}</p>
            </div>
          </div>
        )}
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-sand-200">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-gray-950">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-gray-500">
              Feedback from verified customers across Goa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-display font-extrabold text-xl text-gray-950">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 block">out of 5.0</span>
            </div>
            <div className="flex text-amber-500">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">
            No customer reviews yet. Be the first to order and review this authentic dish!
          </p>
        ) : (
          <div className="space-y-4 divide-y divide-sand-200">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center font-bold text-xs text-gray-700">
                      {rev.userName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Order
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  {rev.title && (
                    <span className="text-xs font-bold text-gray-900 ml-1.5">{rev.title}</span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
