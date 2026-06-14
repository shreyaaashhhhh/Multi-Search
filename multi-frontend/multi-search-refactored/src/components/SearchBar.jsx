import { useCallback, useEffect, useState } from "react";

const DEBOUNCE_DELAY_MS = 400;

export default function SearchBar({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => stableOnChange(inputValue), DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [inputValue, stableOnChange]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="relative block">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="w-full rounded-lg border border-slate-300 px-5 py-3 pr-20 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <span className="absolute right-4 top-3.5 text-sm font-medium text-slate-400" aria-hidden="true">
          Search
        </span>
      </label>
    </div>
  );
}
