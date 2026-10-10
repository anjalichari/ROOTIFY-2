import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Star, ShieldCheck, Plus, Minus, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCartQty = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, inCartQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, inCartQty - 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-sand-300 hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="relative aspect-4/3 overflow-hidden bg-sand-100 block">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Verified Origin Badge */}
        {product.isVerifiedOrigin && (
          <div className="absolute top-2.5 left-2.5 bg-[#0D3B34]/95 backdrop-blur-md text-brand-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-brand-400/30">
            <ShieldCheck className="w-3 h-3 text-brand-300" />
            <span>Verified Origin</span>
          </div>
        )}

        {/* Rating pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md text-charcoal-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-sand-200/80">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
          {product.reviewCount > 0 && (
            <span className="text-[10px] text-charcoal-400 font-normal">({product.reviewCount})</span>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor & Origin line */}
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
            <Link
              to={`/vendor/${product.vendorId}`}
              className="hover:text-brand-600 font-medium truncate max-w-[65%]"
              onClick={(e) => e.stopPropagation()}
            >
              {product.vendorName}
            </Link>
            <span className="flex items-center gap-0.5 text-[11px] text-charcoal-400 shrink-0">
              <MapPin className="w-3 h-3 text-brand-600/80" />
              {product.vendorTaluka}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-display font-bold text-charcoal-900 text-sm sm:text-base group-hover:text-brand-600 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-charcoal-900 font-display">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-charcoal-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-charcoal-500 font-medium block">
              {product.unit}
            </span>
          </div>

          {/* Action: Add or Quantity Counter */}
          <div>
            {inCartQty === 0 ? (
              <button
                onClick={handleAdd}
                className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-bold text-xs border border-brand-200 hover:border-brand-600 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-brand-600 text-white rounded-xl p-0.5 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-brand-700 transition cursor-pointer"
                  title="Reduce quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-extrabold px-1.5 min-w-[18px] text-center">
                  {inCartQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-brand-700 transition cursor-pointer"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
