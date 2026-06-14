import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function StoreLayout() {
  const { user, canManageCustomers, canUseCart, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="text-xl font-bold text-slate-900">
            ShopSphere
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <NavItem to="/">Catalogue</NavItem>
            <NavItem to="/tasks">Tasks</NavItem>
            {canUseCart && <NavItem to="/cart">Cart</NavItem>}
            {canManageCustomers && <NavItem to="/customers">Customers</NavItem>}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.fullname}</p>
              <p className="text-xs text-slate-500">Store access: role {user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 font-medium transition ${
          isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
