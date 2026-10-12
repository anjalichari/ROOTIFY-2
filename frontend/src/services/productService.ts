import { Product, TrustBadgeLevel } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { INITIAL_PRODUCTS } from '../data/products';

export interface ProductFilters {
  searchQuery?: string;
  categoryId?: string;
  taluka?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onlyVerifiedOrigin?: boolean;
  inStockOnly?: boolean;
  vendorId?: string;
}

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  searchAndFilter(filters: ProductFilters): Promise<Product[]>;
  getProductsByVendor(vendorId: string): Promise<Product[]>;
  addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  updateModerationStatus(id: string, status: 'active' | 'needs_attention' | 'under_review'): Promise<Product>;
  updateTrustBadge(id: string, trustBadge: TrustBadgeLevel): Promise<Product>;
}

class MockProductService implements IProductService {
  async getAllProducts(): Promise<Product[]> {
    const stored = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return stored.map((p) => {
      const initial = INITIAL_PRODUCTS.find((init) => init.id === p.id);
      if (!initial) {
        return {
          ...p,
          trustBadge: p.trustBadge || (p.isVerifiedOrigin ? 'Verified' : 'Self-declared'),
        };
      }
      return {
        ...initial,
        ...p,
        trustBadge: p.trustBadge || initial.trustBadge || (p.isVerifiedOrigin ? 'Verified' : 'Self-declared'),
        originDetails: {
          ...initial.originDetails,
          ...p.originDetails,
          steps: p.originDetails?.steps?.length ? p.originDetails.steps : initial.originDetails?.steps,
          storageTips: p.originDetails?.storageTips || initial.originDetails?.storageTips,
          storySnippet: p.originDetails?.storySnippet || initial.originDetails?.storySnippet,
        },
      };
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find((p) => p.id === id) || null;
  }

  async searchAndFilter(filters: ProductFilters): Promise<Product[]> {
    let products = await this.getAllProducts();

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      products = products.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const catMatch = p.categoryName.toLowerCase().includes(q);
        const vendorMatch = p.vendorName.toLowerCase().includes(q);
        const villageMatch = p.originDetails.village.toLowerCase().includes(q);
        const talukaMatch = (p.originDetails.taluka || p.vendorTaluka).toLowerCase().includes(q);
        const ingredientsMatch = p.originDetails.ingredients.some((ing) =>
          ing.toLowerCase().includes(q)
        );

        return (
          nameMatch ||
          descMatch ||
          catMatch ||
          vendorMatch ||
          villageMatch ||
          talukaMatch ||
          ingredientsMatch
        );
      });
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.vendorId) {
      products = products.filter((p) => p.vendorId === filters.vendorId);
    }

    if (filters.taluka && filters.taluka !== 'all') {
      products = products.filter(
        (p) => p.vendorTaluka.toLowerCase() === filters.taluka?.toLowerCase() ||
               p.originDetails.taluka.toLowerCase() === filters.taluka?.toLowerCase()
      );
    }

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.price >= (filters.minPrice ?? 0));
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= (filters.maxPrice ?? 999999));
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      products = products.filter((p) => p.rating >= (filters.minRating ?? 0));
    }

    if (filters.onlyVerifiedOrigin) {
      products = products.filter((p) => p.isVerifiedOrigin);
    }

    if (filters.inStockOnly) {
      products = products.filter((p) => p.inStock && p.stockCount > 0);
    }

    return products;
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter((p) => p.vendorId === vendorId);
  }

  async addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> {
    const products = await this.getAllProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      moderationStatus: 'active',
    };

    const updated = [newProduct, ...products];
    setStoredItem(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const updated = { ...products[index], ...updates };
    products[index] = updated;
    setStoredItem(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getAllProducts();
    const filtered = products.filter((p) => p.id !== id);
    setStoredItem(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  async updateModerationStatus(id: string, status: 'active' | 'needs_attention' | 'under_review'): Promise<Product> {
    return this.updateProduct(id, { moderationStatus: status });
  }

  async updateTrustBadge(id: string, trustBadge: TrustBadgeLevel): Promise<Product> {
    return this.updateProduct(id, {
      trustBadge,
      isVerifiedOrigin: trustBadge === 'Verified',
    });
  }
}

export const productService = new MockProductService();
