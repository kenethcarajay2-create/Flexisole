
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Loader2 } from "lucide-react";

import MainLayout from "../layouts/MainLayout";

// CUSTOMER PAGES
import Home from "../pages/Home";
import Shop from "../pages/shop/Shop";
import ProductDetails from "../pages/shop/ProductDetails";
import Cart from "../pages/shop/Cart";
import Checkout from "../pages/shop/Checkout";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/auth/Login";
import Account from "../pages/account/Account";
import MyOrders from "../pages/account/MyOrders";
import MyReviews from "../pages/account/MyReviews";
import NotFound from "../pages/NotFound";

// CONTEXT
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

import {
  CustomerAuthProvider,
  useCustomerAuth,
} from "../context/CustomerAuthContext";

// ANALYTICS
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";

// ADMIN
import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";
import AdminLayout from "../layouts/admin/AdminLayout";

import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";
import Orders from "../pages/admin/Orders";

// NEW: SOCIAL MEDIA SETTINGS
import SocialSettings from "../pages/admin/SocialSettings";

function ProtectedCustomerRoute({ children }) {
  const location = useLocation();

  const {
    isAuthenticated,
    checkingSession,
  } = useCustomerAuth();

  if (checkingSession) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-cream">
        <Loader2
          size={30}
          className="animate-spin text-brand-700"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <AnalyticsTracker />

          <Routes>
            {/* CUSTOMER WEBSITE */}
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/shop"
                element={<Shop />}
              />

              <Route
                path="/product/:slug"
                element={<ProductDetails />}
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              {/* SIGN-IN REQUIRED FOR CHECKOUT */}
              <Route
                path="/checkout"
                element={
                  <ProtectedCustomerRoute>
                    <Checkout />
                  </ProtectedCustomerRoute>
                }
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              {/* CUSTOMER ACCOUNT */}
              <Route
                path="/account"
                element={
                  <ProtectedCustomerRoute>
                    <Account />
                  </ProtectedCustomerRoute>
                }
              />

              <Route
                path="/account/orders"
                element={
                  <ProtectedCustomerRoute>
                    <MyOrders />
                  </ProtectedCustomerRoute>
                }
              />

              <Route
                path="/account/reviews"
                element={
                  <ProtectedCustomerRoute>
                    <MyReviews />
                  </ProtectedCustomerRoute>
                }
              />
            </Route>

            {/* ADMIN LOGIN */}
            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* PROTECTED ADMIN AREA */}
            <Route element={<ProtectedAdminRoute />}>
              <Route
                path="/admin"
                element={<AdminLayout />}
              >
                <Route
                  index
                  element={<Dashboard />}
                />

                <Route
                  path="products"
                  element={<Products />}
                />

                <Route
                  path="products/new"
                  element={<AddProduct />}
                />

                <Route
                  path="products/:id/edit"
                  element={<EditProduct />}
                />

                <Route
                  path="orders"
                  element={<Orders />}
                />

                {/* NEW: SOCIAL MEDIA SETTINGS */}
                <Route
                  path="settings/social"
                  element={<SocialSettings />}
                />

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/admin"
                      replace
                    />
                  }
                />
              </Route>
            </Route>

            {/* NOT FOUND */}
            <Route element={<MainLayout />}>
              <Route
                path="*"
                element={<NotFound />}
              />
            </Route>
          </Routes>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
