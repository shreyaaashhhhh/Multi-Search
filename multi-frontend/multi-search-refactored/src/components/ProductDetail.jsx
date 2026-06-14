import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchItemById } from "../data/mockData.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const STATUS = { LOADING: "loading", SUCCESS: "success", NOT_FOUND: "not_found", ERROR: "error" };

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState(STATUS.LOADING);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setStatus(STATUS.LOADING);
      try {
        const data = await fetchItemById(id);
        if (cancelled) return;
        setProduct(data ?? null);
        setStatus(data ? STATUS.SUCCESS : STATUS.NOT_FOUND);
      } catch {
        if (!cancelled) setStatus(STATUS.ERROR);
      }
    }

    loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  if (status === STATUS.LOADING) return <LoadingSpinner />;

  if (status === STATUS.NOT_FOUND) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-10 text-slate-500">
        <h2 className="mb-2 text-xl font-semibold">Product not found</h2>
        <Link to="/" className="mt-2 text-emerald-700 hover:underline">Back to catalogue</Link>
      </div>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-10 text-red-500">
        <h2 className="mb-2 text-xl font-semibold">Failed to load product</h2>
        <Link to="/" className="mt-2 text-emerald-700 hover:underline">Back to catalogue</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-100 bg-white p-8 shadow-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline">
          Back to catalogue
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <img
            src={product.image}
            alt={product.name}
            className="h-80 w-full rounded-lg object-cover"
          />

          <div className="space-y-4">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold leading-snug text-slate-800">{product.name}</h1>
            <p className="text-3xl font-bold text-emerald-700">
              Rs.{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
