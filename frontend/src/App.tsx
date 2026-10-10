import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';

import { MarketplaceLayout } from './components/common/MarketplaceLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ExplorePage } from './pages/customer/ExplorePage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { VendorDetailPage } from './pages/customer/VendorDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Vendor Pages
import { VendorRegisterPage } from './pages/vendor/VendorRegisterPage';
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { VendorEarningsPage } from './pages/vendor/VendorEarningsPage';
import { VendorProfilePage } from './pages/vendor/VendorProfilePage';

// Delivery Pages
import { DeliveryDashboardPage } from './pages/delivery/DeliveryDashboardPage';
import { DeliveryChatsPage } from './pages/delivery/DeliveryChatsPage';
import { DeliveryProfilePage } from './pages/delivery/DeliveryProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminIssuesPage } from './pages/admin/AdminIssuesPage';
import { AdminSettlementsPage } from './pages/admin/AdminSettlementsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

// Common Fallback
import { NotFoundPage } from './pages/common/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <OrderProvider>
                <Routes>
                  {/* Public Customer Marketplace Views */}
                  <Route
                    path="/"
                    element={
                      <MarketplaceLayout>
                        <HomePage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/explore"
                    element={
                      <MarketplaceLayout>
                        <ExplorePage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/search"
                    element={<Navigate to="/explore" replace />}
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <MarketplaceLayout>
                        <ProductDetailPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/vendor/:id"
                    element={
                      <MarketplaceLayout>
                        <VendorDetailPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <MarketplaceLayout>
                        <CartPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <MarketplaceLayout>
                        <CheckoutPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <MarketplaceLayout>
                        <LoginPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <MarketplaceLayout>
                        <SignupPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <MarketplaceLayout>
                        <OrdersPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <MarketplaceLayout>
                        <OrderDetailPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <MarketplaceLayout>
                        <CustomerProfilePage />
                      </MarketplaceLayout>
                    }
                  />

                  {/* Vendor Portal Views */}
                  <Route
                    path="/vendor/register"
                    element={
                      <MarketplaceLayout>
                        <VendorRegisterPage />
                      </MarketplaceLayout>
                    }
                  />
                  <Route
                    path="/vendor"
                    element={<Navigate to="/vendor/dashboard" replace />}
                  />
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <VendorDashboardPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/products"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <VendorProductsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/orders"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <VendorOrdersPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/earnings"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <VendorEarningsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/profile"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <VendorProfilePage />
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* Delivery Partner Portal Views */}
                  <Route
                    path="/delivery"
                    element={<Navigate to="/delivery/tasks" replace />}
                  />
                  <Route
                    path="/delivery/tasks"
                    element={
                      <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <DeliveryDashboardPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery/orders"
                    element={<Navigate to="/delivery/tasks" replace />}
                  />
                  <Route
                    path="/delivery/chats"
                    element={
                      <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <DeliveryChatsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery/profile"
                    element={
                      <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <DeliveryProfilePage />
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Portal Views */}
                  <Route
                    path="/admin"
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminDashboardPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/vendors"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminVendorsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminUsersPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminProductsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminOrdersPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/issues"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminIssuesPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settlements"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminSettlementsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <div>
                          <RoleSwitcherBar />
                          <AdminReportsPage />
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route
                    path="*"
                    element={
                      <MarketplaceLayout>
                        <NotFoundPage />
                      </MarketplaceLayout>
                    }
                  />
                </Routes>
              </OrderProvider>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
