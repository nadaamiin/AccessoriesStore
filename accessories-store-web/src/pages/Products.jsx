import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import FilterDrawer from "../components/FilterDrawer";
import SortDropdown from "../components/SortDropdown";
import { useSearch } from "../context/SearchContext";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "";

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  // Draft values inside the drawer, committed on "Apply"
  const [draftMin, setDraftMin] = useState(0);
  const [draftMax, setDraftMax] = useState(0);
  const [draftOnSale, setDraftOnSale] = useState(false);
  const [draftInStock, setDraftInStock] = useState(false);
  const [draftOutOfStock, setDraftOutOfStock] = useState(false);
  const [draftCategory, setDraftCategory] = useState("");
  const { searchQuery } = useSearch();
  
  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);

        if (productsRes.data.length > 0) {
          const prices = productsRes.data.map((p) => (p.isOnSale && p.salePrice ? p.salePrice : p.price));
          const lo = Math.floor(Math.min(...prices));
          const hi = Math.ceil(Math.max(...prices));
          setMinPrice(lo);
          setMaxPrice(hi);
          setDraftMin(lo);
          setDraftMax(hi);
        }
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => (p.isOnSale && p.salePrice ? p.salePrice : p.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const inStockCount = products.filter((p) => p.stockQuantity > 0).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const selectCategory = (id) => {
    if (id) setSearchParams({ category: id });
    else setSearchParams({});
  };

  const openDrawer = () => {
    setDraftMin(minPrice);
    setDraftMax(maxPrice);
    setDraftOnSale(onSaleOnly);
    setDraftInStock(inStockOnly);
    setDraftOutOfStock(outOfStockOnly);
    setDraftCategory(activeCategory);
    setDrawerOpen(true);
  };

  const applyFilters = () => {
    setMinPrice(draftMin);
    setMaxPrice(draftMax);
    setOnSaleOnly(draftOnSale);
    setInStockOnly(draftInStock);
    setOutOfStockOnly(draftOutOfStock);
    selectCategory(draftCategory);
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setDraftMin(priceBounds.min);
    setDraftMax(priceBounds.max);
    setDraftOnSale(false);
    setDraftInStock(false);
    setDraftOutOfStock(false);
    setDraftCategory("");

    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setOnSaleOnly(false);
    setInStockOnly(false);
    setOutOfStockOnly(false);
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory) {
      list = list.filter((p) => String(p.categoryId) === String(activeCategory));
    }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q));
      }

    if (onSaleOnly) list = list.filter((p) => p.isOnSale);
    if (inStockOnly) list = list.filter((p) => p.stockQuantity > 0);
    if (outOfStockOnly) list = list.filter((p) => p.stockQuantity === 0);

    list = list.filter((p) => {
      const effective = p.isOnSale && p.salePrice ? p.salePrice : p.price;
      return effective >= minPrice && effective <= maxPrice;
    });

    const sorted = [...list];
    if (sort === "price_asc") {
      sorted.sort((a, b) => (a.isOnSale && a.salePrice ? a.salePrice : a.price) - (b.isOnSale && b.salePrice ? b.salePrice : b.price));
    } else if (sort === "price_desc") {
      sorted.sort((a, b) => (b.isOnSale && b.salePrice ? b.salePrice : b.price) - (a.isOnSale && a.salePrice ? a.salePrice : a.price));
    } else if (sort === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.id - a.id);
    }

    return sorted;
  }, [products, activeCategory, onSaleOnly, inStockOnly, outOfStockOnly, minPrice, maxPrice, sort, searchQuery]);

  const hasActiveFilters =
    activeCategory || onSaleOnly || inStockOnly || outOfStockOnly ||
    minPrice !== priceBounds.min || maxPrice !== priceBounds.max;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-espresso mb-2">Our Products</h1>
          <p className="text-muted text-sm">Handpicked pieces, made with care.</p>
        </div>

        {/* Category tabs — desktop only */}
        {categories.length > 0 && (
          <div className="hidden md:flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => selectCategory("")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                !activeCategory ? "bg-rose-500 text-white" : "bg-white text-espresso hover:bg-nudepink-100"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  String(activeCategory) === String(c.id) ? "bg-rose-500 text-white" : "bg-white text-espresso hover:bg-nudepink-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter | Sort bar */}
        <div className="flex w-full mb-8 border-y border-line bg-white">
          
          {/* Filter */}
          <button
            onClick={openDrawer}
            className="flex-1 flex items-center justify-between px-4 py-3 text-xs font-semibold tracking-wide uppercase text-espresso hover:bg-blush-50 transition"
          >
            <div className="flex items-center gap-2">
              <span>Filter</span>

              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </div>

            <svg 
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
            <path
              d="M4 6h16M7 12h10M10 18h4" 
              strokeLinecap="round" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px bg-line" />

          {/* Sort */}
          <div className="flex-1">
            <SortDropdown value={sort} onChange={setSort} />
          </div>

        </div>

        {loading ? (
          <p className="text-center text-muted py-20">Loading…</p>
        ) : filteredProducts.length === 0 ? (
        <p className="text-center text-muted py-20">
          {searchQuery ? `No products match "${searchQuery}".` : "No products match your filters."}
        </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        activeCategory={draftCategory}
        onCategoryChange={setDraftCategory}
        priceBounds={priceBounds}
        minPrice={draftMin}
        maxPrice={draftMax}
        onPriceChange={(mn, mx) => { setDraftMin(mn); setDraftMax(mx); }}
        onSaleOnly={draftOnSale}
        setOnSaleOnly={setDraftOnSale}
        inStockCount={inStockCount}
        outOfStockCount={outOfStockCount}
        inStockOnly={draftInStock}
        setInStockOnly={setDraftInStock}
        outOfStockOnly={draftOutOfStock}
        setOutOfStockOnly={setDraftOutOfStock}
        onClear={clearFilters}
        onApply={applyFilters}
      />
    </Layout>
  );
}

export default Products;