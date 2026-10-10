import React, { useState } from 'react';
import { Star, X, ShieldCheck } from 'lucide-react';
import { OrderItem } from '../../types';

interface ReviewModalProps {
  orderId: string;
  vendorId: string;
  vendorName: string;
  item: OrderItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    productId: string;
    productName: string;
    vendorId: string;
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  vendorId,
  vendorName,
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickTags = [
    'Authentic Goan Flavour',
    'Fresh & Warm',
    'Traditional Packaging',
    'Perfect Sweetness',
    'Heirloom Quality',
  ];

  const handleTagClick = (tag: string) => {
    if (!title) {
      setTitle(tag);
    } else if (!comment.includes(tag)) {
      setComment((prev) => (prev ? `${prev} • ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        orderId,
        productId: item.productId,
        productName: item.productName,
        vendorId,
        rating,
        title: title.trim() || 'Verified Customer Review',
        comment: comment.trim(),
      });
      onClose();
    } catch (e) {
      console.error('Failed to submit review:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-sand-50">
          <div className="flex items-center gap-3">
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-12 h-12 rounded-xl object-cover border border-sand-300"
            />
            <div>
              <h3 className="font-display font-bold text-gray-900 text-base line-clamp-1">
                Rate & Review
              </h3>
              <p className="text-xs text-gray-500">{vendorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Star Rating */}
          <div className="text-center py-2 bg-sand-50/70 rounded-2xl border border-sand-200">
            <span className="text-xs text-gray-500 block mb-1">Select your rating</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-brand-800 mt-1 block">
              {rating === 5
                ? 'Outstanding / Authentic!'
                : rating === 4
                ? 'Very Good'
                : rating === 3
                ? 'Average'
                : rating === 2
                ? 'Below Expectations'
                : 'Poor'}
            </span>
          </div>

          {/* Quick tags */}
          <div>
            <span className="text-xs font-semibold text-charcoal-700 block mb-1.5">
              Quick Highlights:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-xs px-2.5 py-1 rounded-full bg-sand-100 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-300 text-charcoal-700 border border-sand-200 transition"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-charcoal-700 block mb-1">Review Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best Bebinca in North Goa!"
              className="w-full px-3.5 py-2 text-sm border border-sand-300 rounded-xl focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 outline-none"
            />
          </div>

          {/* Detailed comment */}
          <div>
            <label className="text-xs font-semibold text-charcoal-700 block mb-1">
              Your Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the authentic taste, ingredients, freshness, and delivery experience..."
              className="w-full px-3.5 py-2 text-sm border border-sand-300 rounded-xl focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex items-center gap-2 text-xs text-brand-900 bg-brand-50/80 p-2.5 rounded-xl border border-brand-200">
            <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
            <span>This verified review will be tied to your delivered order.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-charcoal-600 hover:bg-sand-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
