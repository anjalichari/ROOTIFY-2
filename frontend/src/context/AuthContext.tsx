import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Address } from '../types';
import { authService } from '../services/authService';
import { initializeStorage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: Address;
  }) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address: Address;
  }): Promise<User> => {
    const newUser = await authService.registerCustomer(data);
    setUser(newUser);
    return newUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const switchRole = async (targetRole: UserRole): Promise<User | null> => {
    const switched = await authService.switchDemoRole(targetRole);
    setUser(switched);
    return switched;
  };

  const updateUser = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error('No user logged in');
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const role: UserRole = user ? user.role : 'guest';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
