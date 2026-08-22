import PriceRangeSlider from "./PriceRangeSlider";

function FilterDrawer({
  open,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
  priceBounds,
  minPrice,
  maxPrice,
  onPriceChange,
  onSaleOnly,
  setOnSaleOnly,
  inStockCount,
  outOfStockCount,
  inStockOnly,
  setInStockOnly,
  outOfStockOnly,
  setOutOfStockOnly,
  onClear,
  onApply,
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-espresso/40 z-40" onClick={onClose} />}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-blush-50 shadow-xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h2 className="font-body text-lg font-extrabold text-espresso tracking-wide uppercase">Filter</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-blush-100" aria-label="Close filters">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 divide-y divide-line">
          {/* Category */}
          {categories.length > 0 && (
            <div className="py-6">
              <p className="text-xs font-semibold tracking-wide uppercase text-espresso mb-4">Category</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!activeCategory}
                    onChange={() => onCategoryChange("")}
                    className="w-4 h-4 accent-espresso"
                  />
                  <span className="text-sm text-espresso">All Categories</span>
                </label>
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={String(activeCategory) === String(c.id)}
                      onChange={() => onCategoryChange(c.id)}
                      className="w-4 h-4 accent-espresso"
                    />
                    <span className="text-sm text-espresso">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="py-6">
            <p className="text-xs font-semibold tracking-wide uppercase text-espresso mb-4">Availability</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-espresso"
                />
                <span className="text-sm text-espresso">
                  In stock <span className="text-muted">({inStockCount})</span>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outOfStockOnly}
                  onChange={(e) => setOutOfStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-espresso"
                />
                <span className="text-sm text-espresso">
                  Out of stock <span className="text-muted">({outOfStockCount})</span>
                </span>
              </label>
            </div>
          </div>

          {/* Price */}
          <div className="py-6">
            <p className="text-xs font-semibold tracking-wide uppercase text-espresso mb-5">Price</p>
            <PriceRangeSlider
              min={priceBounds.min}
              max={priceBounds.max}
              valueMin={minPrice}
              valueMax={maxPrice}
              onChange={onPriceChange}
            />
          </div>

          {/* Sale */}
          <div className="py-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-espresso"
              />
              <span className="text-sm text-espresso">On Sale</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-line flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-3 rounded-full border border-line text-espresso text-sm font-medium hover:bg-blush-100 transition"
          >
            Clear
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-3 rounded-full bg-espresso text-white text-sm font-medium hover:opacity-90 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

export default FilterDrawer;