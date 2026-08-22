import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProduct, getProducts } from "../api/products";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { useCart } from "../context/CartContext";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import Accordion from "../components/Accordion";
import ReviewForm from "../components/ReviewForm";
import ReviewsSection from "../components/ReviewsSection";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [fav, setFav] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    setShowReviewForm(false);

    getProduct(id)
      .then((res) => {
        setProduct(res.data);
        setFav(isFavorite(res.data.id));
        return getProducts();
      })
      .then((res) => {
        setRelated(res.data.filter((p) => String(p.id) !== String(id)).slice(0, 8));
      })
      .catch((err) => console.error("Failed to load product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-20 text-center text-muted">Loading…</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="p-20 text-center text-muted">Product not found.</div>
      </Layout>
    );
  }

  const images = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.imageUrls || []),
  ].filter((url, index, arr) => arr.indexOf(url) === index);

  const handleFav = () => {
    setFav(toggleFavorite(product.id).includes(product.id));
  };

  const handleAdd = () => {
    if (product.stockQuantity === 0) return;
    addItem(product, quantity);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="flex gap-3">
          {images.length > 1 && (
            <div className="flex flex-col gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === activeImage ? "border-rose-500" : "border-transparent"
                  }`}
                >
                  <img src={`https://localhost:7113${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-blush-100">
            {images.length > 0 ? (
              <img
                src={`https://localhost:7113${images[activeImage]}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No image</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="font-body text-xl md:text-2xl font-extrabold uppercase tracking-wide text-espresso">
            {product.name}
          </h1>

          <div className="mt-4">
            {product.isOnSale && product.salePrice ? (
              <div className="flex items-center gap-3">
                <span className="text-muted text-lg line-through">LE {product.price.toFixed(2)}</span>
                <span className="text-rose-600 text-2xl font-display">LE {product.salePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-espresso text-2xl font-display">LE {product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Quantity / Out of stock */}
          {product.stockQuantity > 0 ? (
            <div className="flex items-center gap-3 mt-6">
              <span className="text-xs font-medium tracking-wide uppercase text-muted">Quantity</span>
              <div className="flex items-center border border-nudepink-200 rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-espresso hover:bg-blush-100 rounded-l-full transition"
                >
                  −
                </button>
                <span className="w-10 text-center text-espresso">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-espresso hover:bg-blush-100 rounded-r-full transition"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <span className="inline-block px-3 py-1.5 rounded-full bg-brick/10 text-brick text-xs font-medium">
                Out of Stock
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              disabled={product.stockQuantity === 0}
              className="flex-1 py-3.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleFav}
              className="w-12 h-12 rounded-full border border-nudepink-200 flex items-center justify-center hover:bg-blush-100 transition shrink-0"
              aria-label="Toggle favorite"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "#A9855C" : "none"} stroke={fav ? "#A9855C" : "#7A6A5C"} strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-10">
            <Accordion title="Description & Material" defaultOpen>
              <p>{product.description || "No description available."}</p>
            </Accordion>

            <Accordion title="Delivery">
              <p>Orders are delivered within 3–5 business days across Egypt.</p>
            </Accordion>

            <Accordion title="Return & Exchange Policy">
              <p>
                Returns are accepted only before the order has been dispatched for delivery.
                Once the courier has picked up the order, it can no longer be returned or exchanged.
                Return shipping costs are covered by the customer.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto py-16 border-t border-nudepink-200 text-center">
          <h2 className="font-display text-2xl text-espresso mb-10">You May Also Like</h2>
          <div className="flex gap-5 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">
            {related.map((p) => (
              <div key={p.id} className="shrink-0 w-48 sm:w-56 snap-start text-left">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="max-w-3xl mx-auto px-6 pt-16 border-t border-nudepink-200 text-center">
        <button
          onClick={() => setShowReviewForm((v) => !v)}
          className="px-6 py-2.5 rounded-full bg-espresso text-white text-sm font-medium hover:bg-rose-600 transition"
        >
          {showReviewForm ? "Cancel Review" : "Write a Review"}
        </button>

        {showReviewForm && (
          <div className="mt-10 flex justify-center">
            <ReviewForm
              productId={product.id}
              onSubmitted={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </section>

      <ReviewsSection productId={product.id} />
    </Layout>
  );
}

export default ProductDetail;