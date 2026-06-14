import { useEffect, useMemo, useState } from "react";
import { getCartItems } from "../api/cartApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { fetchItems } from "../data/mockData.js";

export default function CartPage() {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      setStatus("loading");
      try {
        const [cartResponse, productResponse] = await Promise.all([
          getCartItems(token),
          fetchItems(),
        ]);
        if (cancelled) return;
        if (cartResponse.code !== 200) throw new Error(cartResponse.message ?? "Unable to load cart");
        setCartItems(cartResponse.cartItems ?? []);
        setProducts(productResponse);
        setStatus("success");
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    loadCart();
    return () => { cancelled = true; };
  }, [token]);

  const productById = useMemo(() => {
    return new Map(products.map((product) => [Number(product.id), product]));
  }, [products]);

  const totalItems = cartItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + ((item.actualAmount ?? 0) * (item.amount ?? 0));
  }, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalItems} item{totalItems === 1 ? "" : "s"} selected · Rs.{totalAmount.toLocaleString()}
        </p>
      </div>

      {status === "loading" && <LoadingSpinner />}

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {status === "success" && cartItems.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          Your cart is empty.
        </div>
      )}

      {status === "success" && cartItems.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Product ID</th>
                <th className="px-4 py-3">Actual Amount</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cartItems.map((item) => {
                const product = productById.get(Number(item.productId));
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product?.image && (
                          <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-contain" />
                        )}
                        <span className="font-medium text-slate-900">{item.productName ?? product?.name ?? "Product unavailable"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">#{item.productId}</td>
                    <td className="px-4 py-3 text-slate-700">Rs.{(item.actualAmount ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">{item.amount ?? 0}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Rs.{((item.actualAmount ?? 0) * (item.amount ?? 0)).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
