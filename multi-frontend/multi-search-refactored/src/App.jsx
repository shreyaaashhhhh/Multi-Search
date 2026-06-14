import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StoreLayout from "./components/StoreLayout.jsx";

// Lazy-load pages so the initial bundle stays lean
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const ProductDetail = lazy(() => import("./components/ProductDetail.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const CustomersPage = lazy(() => import("./pages/CustomersPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const TasksPage = lazy(() => import("./pages/TasksPage.jsx"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<SearchPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route element={<ProtectedRoute requireCartAccess />}>
                <Route path="/cart" element={<CartPage />} />
              </Route>
              <Route element={<ProtectedRoute requireCustomerAccess />}>
                <Route path="/customers" element={<CustomersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
