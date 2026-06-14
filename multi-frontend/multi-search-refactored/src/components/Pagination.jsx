export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav className="flex items-center justify-center gap-3 pt-6" aria-label="Pagination">
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
        aria-label="Previous page"
      >
        Prev
      </PageButton>

      <span className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
        Page {page} / {totalPages}
      </span>

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
        aria-label="Next page"
      >
        Next
      </PageButton>
    </nav>
  );
}

function PageButton({ onClick, disabled, children, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      {...rest}
    >
      {children}
    </button>
  );
}
