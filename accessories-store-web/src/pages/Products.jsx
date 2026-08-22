import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  const selectCategory = (id) => {
    if (id) {
      setSearchParams({ category: id });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => String(p.categoryId) === String(activeCategory))
    : products;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-espresso mb-2">Our Products</h1>
          <p className="text-muted text-sm">Handpicked pieces, made with care.</p>
        </div>

        {/* Category tabs — desktop only */}
        {categories.length > 0 && (
          <div className="hidden md:flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => selectCategory("")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                !activeCategory
                  ? "bg-rose-500 text-white"
                  : "bg-white text-espresso hover:bg-nudepink-100"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  String(activeCategory) === String(c.id)
                    ? "bg-rose-500 text-white"
                    : "bg-white text-espresso hover:bg-nudepink-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted py-20">Loading…</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted py-20">No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Products;