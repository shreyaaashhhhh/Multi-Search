import { useEffect, useState } from "react";
import { getCustomers } from "../api/authApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const roleNames = {
  1: "Customer",
  2: "Store Staff",
  3: "Store Admin",
};

export default function CustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalpages: 1 });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setStatus("loading");
      try {
        const data = await getCustomers(token, pageInfo.page, 10);
        if (cancelled) return;
        if (data.code !== 200) throw new Error(data.message ?? "Unable to load customers");
        setCustomers(data.users ?? []);
        setPageInfo({ page: data.page, totalpages: data.totalpages || 1 });
        setStatus("success");
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    loadCustomers();
    return () => { cancelled = true; };
  }, [pageInfo.page, token]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">Shopping website access table</p>
        </div>
      </div>

      {status === "loading" && <LoadingSpinner />}

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {status === "success" && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Store Role</th>
                  <th className="px-4 py-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">#{customer.id}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.fullname}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.email}</td>
                    <td className="px-4 py-3 text-slate-700">{customer.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{roleNames[customer.role] ?? `Role ${customer.role}`}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        customer.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {customer.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
