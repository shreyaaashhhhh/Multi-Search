import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center px-6 py-10">
        <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">ShopSphere</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Login to your store account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access is mapped from your role and store navigation permissions.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="username"
                value={form.username}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="customer@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter password"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New shopper? <Link to="/signup" className="font-semibold text-emerald-700 hover:underline">Create an account</Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-[url('/src/assets/images/backpack.jpg')] bg-cover bg-center lg:block">
        <div className="flex h-full items-end bg-slate-950/45 p-10">
          <div className="max-w-lg text-white">
            <h2 className="text-4xl font-bold">One catalogue, different store access.</h2>
            <p className="mt-3 text-white/85">
              Customers browse products. Store staff manage customer tables when their role mapping allows it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
