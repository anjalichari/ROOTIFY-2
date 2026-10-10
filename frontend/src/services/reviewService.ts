import { Review, Product, Vendor } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_REVIEWS } from '../data/reviews';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_VENDORS } from '../data/vendors';
import { orderService } from './orderService';

export interface IReviewService {
  getAllReviews(): Promise<Review[]>;
  getReviewsByProduct(productId: string): Promise<Review[]>;
  getReviewsByVendor(vendorId: string): Promise<Review[]>;
  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
}

class MockReviewService implements IReviewService {
  async getAllReviews(): Promise<Review[]> {
    return getStoredItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    const reviews = await this.getAllReviews();
    return reviews.filter((r) => r.productId === productId);
  }

  async getReviewsByVendor(vendorId: string): Promise<Review[]> {
    const reviews = await this.getAllReviews();
    return reviews.filter((r) => r.vendorId === vendorId);
  }

  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const reviews = await this.getAllReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedReviews = [newReview, ...reviews];
    setStoredItem(STORAGE_KEYS.REVIEWS, updatedReviews);

    // Mark order as reviewed
    if (reviewData.orderId) {
      try {
        await orderService.markOrderReviewed(reviewData.orderId);
      } catch (e) {
        console.error('Error marking order reviewed:', e);
      }
    }

    // Dynamically recalculate product rating
    try {
      const products = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const prodIndex = products.findIndex((p) => p.id === reviewData.productId);
      if (prodIndex !== -1) {
        const prodReviews = updatedReviews.filter((r) => r.productId === reviewData.productId);
        const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        products[prodIndex].rating = Number(avg.toFixed(1));
        products[prodIndex].reviewCount = prodReviews.length;
        setStoredItem(STORAGE_KEYS.PRODUCTS, products);
      }

      // Recalculate vendor rating
      const vendors = getStoredItem<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
      const vendIndex = vendors.findIndex((v) => v.id === reviewData.vendorId);
      if (vendIndex !== -1) {
        const vendReviews = updatedReviews.filter((r) => r.vendorId === reviewData.vendorId);
        const avg = vendReviews.reduce((sum, r) => sum + r.rating, 0) / vendReviews.length;
        vendors[vendIndex].rating = Number(avg.toFixed(1));
        vendors[vendIndex].reviewCount = vendReviews.length;
        setStoredItem(STORAGE_KEYS.VENDORS, vendors);
      }
    } catch (e) {
      console.error('Error recalculating ratings:', e);
    }

    return newReview;
  }
}

export const reviewService = new MockReviewService();
