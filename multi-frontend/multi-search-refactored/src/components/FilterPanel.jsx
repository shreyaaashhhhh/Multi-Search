const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "books", label: "Books" },
  { value: "clothing", label: "Fashion" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-a-z", label: "Name: A to Z" },
];

export default function FilterPanel({ filters, onChange }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-5">
        <FilterSelect
          label="Category"
          value={filters.category}
          options={CATEGORY_OPTIONS}
          onChange={(value) => onChange("category", value)}
        />
        <FilterSelect
          label="Sort By"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => onChange("sort", value)}
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex min-w-[140px] flex-1 flex-col">
      <label htmlFor={id} className="mb-1.5 text-sm font-medium text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
