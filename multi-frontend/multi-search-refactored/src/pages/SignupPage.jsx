import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { signup } from "../api/authApi.js";
import { useAuth } from "../auth/AuthContext.jsx";

const emptyForm = { fullname: "", phone: "", email: "", password: "" };

export default function SignupPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await signup(form);
      if (data.code !== 200) throw new Error(data.message ?? "Unable to create account");
      setForm(emptyForm);
      setMessage("Customer account created. You can login now.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">ShopSphere</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Create customer account</h1>

        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Full name" name="fullname" value={form.fullname} onChange={updateField} />
          <Field label="Phone" name="phone" value={form.phone} onChange={updateField} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={updateField} />

          {error && <Status kind="error">{error}</Status>}
          {message && <Status kind="success">{message}</Status>}

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Login</Link>
        </p>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function Status({ kind, children }) {
  const className = kind === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`sm:col-span-2 rounded-lg border px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}
