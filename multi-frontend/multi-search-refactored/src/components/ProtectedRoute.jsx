import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function ProtectedRoute({ requireCustomerAccess = false, requireCartAccess = false }) {
  const { loading, isAuthenticated, canManageCustomers, canUseCart } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireCustomerAccess && !canManageCustomers) return <Navigate to="/" replace />;
  if (requireCartAccess && !canUseCart) return <Navigate to="/" replace />;

  return <Outlet />;
}
