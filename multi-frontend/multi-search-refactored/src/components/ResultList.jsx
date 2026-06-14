import ResultItem from "./ResultItem.jsx";

export default function ResultList({ items, canUseCart = false, onAddToCart, addingProductId }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <ul
      className="m-0 grid list-none grid-cols-2 gap-5 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Product results"
    >
      {items.map((item) => (
        <li key={item.id}>
          <ResultItem
            item={item}
            canUseCart={canUseCart}
            onAddToCart={onAddToCart}
            adding={addingProductId === item.id}
          />
        </li>
      ))}
    </ul>
  );
}
