import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './route-guards/RequireAuth';
import { RequireStore } from './route-guards/RequireStore';
import { PublicOnly } from './route-guards/PublicOnly';

import { OwnerLayout } from '../components/layout/OwnerLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage';

// Phase 1 Stores Pages
import { StoreListPage } from '../features/stores/pages/StoreListPage';
import { CreateStorePage } from '../features/stores/pages/CreateStorePage';
import { StoreOverviewPage } from '../features/stores/pages/StoreOverviewPage';

import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { CreateProductPage } from '../features/products/pages/CreateProductPage';
import { EditProductPage } from '../features/products/pages/EditProductPage';
import { CategoriesPage } from '../features/categories/pages/CategoriesPage';
import { InventoryPage } from '../features/inventory/pages/InventoryPage';
import { ImportProductsPage } from '../features/imports/pages/ImportProductsPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { OrderDetailsPage } from '../features/orders/pages/OrderDetailsPage';
import { ThemeEditorPage } from '../features/themes/pages/ThemeEditorPage';
import { TeamPage } from '../features/team/pages/TeamPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { AnalyticsPage } from '../features/analytics/pages/AnalyticsPage';
import { AssistantPage } from '../features/assistant/pages/AssistantPage';

// CRM & Marketing pages
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { CustomerDetailsPage } from '../features/customers/pages/CustomerDetailsPage';
import { CampaignsPage } from '../features/marketing/pages/CampaignsPage';
import { CreateCampaignPage } from '../features/marketing/pages/CreateCampaignPage';
import { PromotionsPage } from '../features/marketing/pages/PromotionsPage';
import { MarketingAnalyticsPage } from '../features/marketing/pages/MarketingAnalyticsPage';

// Storefront routes
import { StorefrontLayout } from '../components/layout/StorefrontLayout';
import { StoreHomePage } from '../storefront/pages/StoreHomePage';
import { CategoryPage } from '../storefront/pages/CategoryPage';
import { ProductDetailsPage } from '../storefront/pages/ProductDetailsPage';
import { CartPage } from '../storefront/pages/CartPage';
import { CheckoutPage } from '../storefront/pages/CheckoutPage';
import { OrderConfirmationPage } from '../storefront/pages/OrderConfirmationPage';
import { CustomerLoginPage } from '../storefront/pages/CustomerLoginPage';
import { CustomerRegisterPage } from '../storefront/pages/CustomerRegisterPage';
import { CustomerAccountPage } from '../storefront/pages/CustomerAccountPage';
import { NotFoundPage } from '../storefront/pages/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Storefront */}
        <Route path="/store/:storeSlug" element={<StorefrontLayout />}>
          <Route index element={<StoreHomePage />} />
          <Route path="category/:categorySlug" element={<CategoryPage />} />
          <Route path="product/:productSlug" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmed/:orderId" element={<OrderConfirmationPage />} />
          <Route path="account" element={<CustomerAccountPage />} />
          <Route path="account/login" element={<CustomerLoginPage />} />
          <Route path="account/register" element={<CustomerRegisterPage />} />
        </Route>

        {/* Customer Portal direct entry routes */}
        <Route path="/customer" element={<Navigate to="/store/bloom-boutique/account" replace />} />
        <Route path="/customer/login" element={<Navigate to="/store/bloom-boutique/account/login" replace />} />
        <Route path="/customer/register" element={<Navigate to="/store/bloom-boutique/account/register" replace />} />
        <Route path="/customer/account" element={<Navigate to="/store/bloom-boutique/account" replace />} />

        {/* Auth routes */}
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Merchant Portal */}
        <Route element={<RequireAuth />}>
          {/* Phase 1 Store Management & Selection */}
          <Route path="/app" element={<Navigate to="/app/stores" replace />} />
          <Route path="/app/stores" element={<StoreListPage />} />
          <Route path="/app/stores/new" element={<CreateStorePage />} />
          <Route path="/app/stores/:storeId" element={<StoreOverviewPage />} />

          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Store-Scoped Operations */}
          <Route element={<RequireStore />}>
            <Route path="/" element={<OwnerLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<CreateProductPage />} />
              <Route path="products/:id/edit" element={<EditProductPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="imports" element={<ImportProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetailsPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="campaigns/new" element={<CreateCampaignPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="marketing/analytics" element={<MarketingAnalyticsPage />} />
              <Route path="theme" element={<ThemeEditorPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
