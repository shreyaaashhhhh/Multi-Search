/**
 * Applies search query, category, min-price filter, and sort order
 * to a flat array of product objects.
 *
 * @param {Array}  items   - Full product list
 * @param {Object} filters - { query, category, minPrice, sort }
 * @returns {Array} Filtered and sorted product list (new array, source untouched)
 */
export function filterItems(items, { query = "", category = "all", minPrice = 0, sort = "" } = {}) {
  const normalizedQuery = query.toLowerCase().trim();

  const filtered = items.filter((item) => {
    const matchesQuery = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory = category === "all" || item.category === category;
    const matchesPrice = item.price >= minPrice;
    return matchesQuery && matchesCategory && matchesPrice;
  });

  // Sort on a copy so the original order is preserved for the next render cycle
  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-low":
      case "price-low-high":
        return a.price - b.price;
      case "price-high":
      case "price-high-low":
        return b.price - a.price;
      case "name-a-z":
        return a.name.localeCompare(b.name);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      default:
        return 0;
    }
  });
}

/**
 * Slices a filtered list into the correct page window.
 *
 * @param {Array}  items        - Already-filtered product list
 * @param {number} page         - 1-based current page
 * @param {number} itemsPerPage
 * @returns {{ pageItems: Array, totalPages: number }}
 */
export function paginateItems(items, page, itemsPerPage) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const clampedPage = Math.min(Math.max(page, 1), totalPages || 1);
  const start = (clampedPage - 1) * itemsPerPage;
  return {
    pageItems: items.slice(start, start + itemsPerPage),
    totalPages,
  };
}
