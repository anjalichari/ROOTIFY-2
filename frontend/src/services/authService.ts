import { User, UserRole, Address } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from './storage';
import { DEMO_USERS } from '../data/users';

export interface IAuthService {
  getCurrentUser(): User | null;
  login(email: string, password?: string): Promise<User>;
  registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: Address;
  }): Promise<User>;
  switchDemoRole(role: UserRole): Promise<User | null>;
  logout(): Promise<void>;
  updateProfile(userId: string, updates: Partial<User>): Promise<User>;
}

class MockAuthService implements IAuthService {
  getCurrentUser(): User | null {
    return getStoredItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  async login(email: string, _password?: string): Promise<User> {
    const users = getStoredItem<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find matching user
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (foundUser) {
      setStoredItem(STORAGE_KEYS.CURRENT_USER, foundUser);
      return foundUser;
    }

    // If not found in demo accounts, create a customer account on the fly for smooth demoing
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: normalizedEmail,
      phone: '+91 98000 00000',
      role: 'customer',
      createdAt: new Date().toISOString(),
      defaultAddress: {
        id: `addr-${Date.now()}`,
        name: 'Primary Address',
        street: 'Panaji Promenade',
        villageOrTown: 'Panaji',
        taluka: 'Tiswadi',
        pincode: '403001',
        isDefault: true,
      },
    };

    const updatedUsers = [...users, newUser];
    setStoredItem(STORAGE_KEYS.USERS, updatedUsers);
    setStoredItem(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  }

  async registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: Address;
  }): Promise<User> {
    const users = getStoredItem<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      // Return existing and log in
      setStoredItem(STORAGE_KEYS.CURRENT_USER, existingUser);
      return existingUser;
    }

    const newUser: User = {
      id: `user-cust-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
      defaultAddress: data.address,
      addresses: [data.address],
    };

    const updatedUsers = [...users, newUser];
    setStoredItem(STORAGE_KEYS.USERS, updatedUsers);
    setStoredItem(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  }

  async switchDemoRole(role: UserRole): Promise<User | null> {
    if (role === 'guest') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }

    const users = getStoredItem<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
    let target = users.find((u) => u.role === role);

    if (!target) {
      target = DEMO_USERS.find((u) => u.role === role);
    }

    if (target) {
      setStoredItem(STORAGE_KEYS.CURRENT_USER, target);
      return target;
    }

    return null;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users = getStoredItem<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
    const index = users.findIndex((u) => u.id === userId);
    
    if (index === -1) {
      throw new Error('User not found');
    }

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    setStoredItem(STORAGE_KEYS.USERS, users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setStoredItem(STORAGE_KEYS.CURRENT_USER, updated);
    }

    return updated;
  }
}

export const authService = new MockAuthService();
