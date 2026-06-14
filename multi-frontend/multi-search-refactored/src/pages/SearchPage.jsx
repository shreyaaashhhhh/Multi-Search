import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ResultList from "../components/ResultList.jsx";
import Pagination from "../components/Pagination.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

import { fetchItems } from "../data/mockData.js";
import { filterItems, paginateItems } from "../utils/filterUtils.js";
import { addCartItem } from "../api/cartApi.js";
import { useAuth } from "../auth/AuthContext.jsx";

const ITEMS_PER_PAGE = 10;

/**
 * Reads filter state from URL search params so filters are
 * shareable and survive a browser refresh.
 */
function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    query:    searchParams.get("q")        ?? "",
    category: searchParams.get("category") ?? "all",
    sort:     searchParams.get("sort")     ?? "",
    minPrice: Number(searchParams.get("price") ?? 0),
  }), [searchParams]);

  const updateFilter = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      // Reset to page 1 whenever a filter changes
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  return { filters, updateFilter };
}

export default function SearchPage() {
  const [allItems, setAllItems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [page, setPage]           = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);

  const { filters, updateFilter } = useFilters();
  const { token, canUseCart } = useAuth();

  // Load shopping catalogue once on mount
  useEffect(() => {
    let cancelled = false;

    fetchItems()
      .then((data) => { if (!cancelled) { setAllItems(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setFetchError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Derive filtered + sorted list — only recomputed when inputs change
  const filteredItems = useMemo(
    () => filterItems(allItems, filters),
    [allItems, filters]
  );

  // Slice the filtered list for the current page
  const { pageItems, totalPages } = useMemo(
    () => paginateItems(filteredItems, page, ITEMS_PER_PAGE),
    [filteredItems, page]
  );

  const handlePageChange = useCallback((nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAddToCart = useCallback(async (item) => {
    setCartMessage("");
    setCartError("");
    setAddingProductId(item.id);
    try {
      const data = await addCartItem(token, item, 1);
      if (data.code !== 200) throw new Error(data.message ?? "Unable to add product to cart");
      setCartMessage(`${item.name} added to cart`);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setAddingProductId(null);
    }
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <header className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800">Shopping Catalogue</h1>
          <p className="text-slate-500 mt-1">Search products across electronics, books and fashion</p>
        </header>

        <SearchBar
          value={filters.query}
          onChange={(value) => updateFilter("q", value)}
        />

        <FilterPanel filters={filters} onChange={updateFilter} />

        {cartMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {cartMessage}
          </div>
        )}

        {cartError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {cartError}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {fetchError && (
          <div className="text-center py-10 text-red-500">
            Failed to load products: {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <>
            {/* Result count summary */}
            <p className="text-sm text-slate-500 pl-1">
              {filteredItems.length === 0
                ? "No results"
                : `${filteredItems.length} product${filteredItems.length > 1 ? "s" : ""} found`}
            </p>

            <ResultList
              items={pageItems}
              canUseCart={canUseCart}
              onAddToCart={handleAddToCart}
              addingProductId={addingProductId}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

      </div>
    </main>
  );
}
