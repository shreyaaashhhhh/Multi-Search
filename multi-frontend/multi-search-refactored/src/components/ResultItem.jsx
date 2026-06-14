import { memo } from "react";
import { Link } from "react-router-dom";

const ResultItem = memo(function ResultItem({ item, canUseCart, onAddToCart, adding }) {
  return (
    <article className="group rounded-lg border border-slate-100 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        to={`/product/${item.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={`View details for ${item.name}`}
      >
        <img
          src={item.image}
          alt={item.name}
          className="mb-3 h-40 w-full object-contain"
          loading="lazy"
        />
        <h3 className="mb-1 text-sm font-semibold leading-snug text-slate-800 line-clamp-2">
          {item.name}
        </h3>
        <p className="mb-2 text-xs capitalize text-slate-400">{item.category}</p>
        <p className="text-lg font-bold text-emerald-700">Rs.{item.price.toLocaleString()}</p>
      </Link>

      {canUseCart && (
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          disabled={adding}
          className="mt-4 w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      )}
    </article>
  );
});

export default ResultItem;
