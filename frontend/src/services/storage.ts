import { Product, Vendor, User, Order, Review, ChatMessage, SupportIssue, SettlementRecord, GoaLocation } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_VENDORS } from '../data/vendors';
import { DEMO_USERS } from '../data/users';
import { INITIAL_ORDERS } from '../data/orders';
import { INITIAL_REVIEWS } from '../data/reviews';
import { INITIAL_MESSAGES, INITIAL_ISSUES, INITIAL_SETTLEMENTS } from '../data/messages';
import { GOA_LOCATIONS } from '../data/locations';
import { INITIAL_BATCHES, INITIAL_ORIGIN_PASSPORTS, INITIAL_PASSPORT_MEDIA } from '../data/passports';

const KEYS = {
  USERS: 'rootify_users',
  CURRENT_USER: 'rootify_current_user',
  PRODUCTS: 'rootify_products',
  VENDORS: 'rootify_vendors',
  ORDERS: 'rootify_orders',
  REVIEWS: 'rootify_reviews',
  MESSAGES: 'rootify_messages',
  ISSUES: 'rootify_issues',
  SETTLEMENTS: 'rootify_settlements',
  SELECTED_LOCATION: 'rootify_selected_location',
  CART: 'rootify_cart',
  BATCHES: 'rootify_batches',
  PASSPORTS: 'rootify_passports',
  MEDIA: 'rootify_media',
  SCAN_LOGS: 'rootify_scan_logs',
};

// Initialize localStorage with initial synthetic data if not already present
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.VENDORS)) {
    localStorage.setItem(KEYS.VENDORS, JSON.stringify(INITIAL_VENDORS));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.MESSAGES)) {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(KEYS.ISSUES)) {
    localStorage.setItem(KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
  }
  if (!localStorage.getItem(KEYS.SETTLEMENTS)) {
    localStorage.setItem(KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
  }
  if (!localStorage.getItem(KEYS.SELECTED_LOCATION)) {
    localStorage.setItem(KEYS.SELECTED_LOCATION, JSON.stringify(GOA_LOCATIONS[0])); // Default Panaji
  }
  if (!localStorage.getItem(KEYS.BATCHES)) {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
  }
  if (!localStorage.getItem(KEYS.PASSPORTS)) {
    localStorage.setItem(KEYS.PASSPORTS, JSON.stringify(INITIAL_ORIGIN_PASSPORTS));
  }
  if (!localStorage.getItem(KEYS.MEDIA)) {
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(INITIAL_PASSPORT_MEDIA));
  }
  if (!localStorage.getItem(KEYS.SCAN_LOGS)) {
    localStorage.setItem(KEYS.SCAN_LOGS, JSON.stringify([]));
  }
};

export const getStoredItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

export const setStoredItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};

export const STORAGE_KEYS = KEYS;
